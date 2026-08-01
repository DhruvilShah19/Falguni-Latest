import { adminDb } from '@/lib/firebase-admin';

interface PromoteResult {
  promoted: boolean;
  draftData: FirebaseFirestore.DocumentData | null;
  newOrderId: string | null;
}

// Atomically promotes a DraftOrders/{orderId} doc into a real Orders
// document, or does nothing if it's already been promoted (or never
// existed). Both the Cashfree webhook and the client-triggered /verify
// route call this for the same order within moments of each other on
// every purchase -- wrapping the read+create+delete in a single Firestore
// transaction is what actually prevents that race from creating two Orders
// documents for one payment. A plain read-then-write (what this replaced)
// lets both callers observe "draft still exists" before either one
// deletes it, so both would create their own order.
//
// Side-effect writes (user history, vendor notification, vendor orderID
// increment) are intentionally done OUTSIDE the transaction, after it
// commits -- a transaction's callback can be re-run on contention, and
// repeating a notification/history write on retry would itself create
// duplicates. Those writes are also individually best-effort (their own
// try/catch) so a failure there doesn't undo the order creation above,
// which is the part that actually matters.
export async function promoteDraftOrder(
  orderId: string,
  cashFreeDetails: Record<string, any>
): Promise<PromoteResult> {
  const draftRef = adminDb.collection('DraftOrders').doc(orderId);
  const newOrderRef = adminDb.collection('Orders').doc();

  const draftData = await adminDb.runTransaction(async (transaction) => {
    const draftSnap = await transaction.get(draftRef);
    if (!draftSnap.exists) {
      return null;
    }
    const data = draftSnap.data() ?? null;
    transaction.set(newOrderRef, {
      ...data,
      status: 'Received',
      paymentStatus: 'Success',
      cashFreeDetails,
    });
    transaction.delete(draftRef);
    return data;
  });

  if (!draftData) {
    return { promoted: false, draftData: null, newOrderId: null };
  }

  const userID = draftData?.userID;
  if (userID) {
    try {
      await adminDb.collection('users').doc(userID).collection('History').add({
        timeCreated: new Date(),
        message: 'Placed an order',
        amount: `-₹${draftData?.total ?? ''}`,
        paymentSystem: 'Online',
      });
    } catch (histErr) {
      console.error('[orderPromotion] Error writing user history:', histErr);
    }
  }

  const vendorID = draftData?.vendorID;
  if (vendorID) {
    try {
      await adminDb.collection('vendors').doc(vendorID).collection('Notifications').add({
        timeCreated: new Date(),
        message: `New order alert Order ID #${draftData?.orderID ?? 'Unknown'}`,
        amount: `₹${draftData?.total ?? ''}`,
        paymentSystem: 'Online',
      });
    } catch (notifErr) {
      console.error('[orderPromotion] Error writing vendor notification:', notifErr);
    }

    try {
      const vendorRef = adminDb.collection('vendors').doc(vendorID);
      const vendorSnap = await vendorRef.get();
      if (vendorSnap.exists) {
        const currentOrderID = Number(vendorSnap.data()?.['orderID'] || 0);
        await vendorRef.update({ orderID: currentOrderID + 1 });
      }
    } catch (vendorErr) {
      console.error('[orderPromotion] Error incrementing vendor orderID:', vendorErr);
    }
  }

  console.log(`[orderPromotion] Promoted DraftOrder ${orderId} to Order ${newOrderRef.id}.`);
  return { promoted: true, draftData, newOrderId: newOrderRef.id };
}

// Fallback path: the draft is already gone (promoted by the other
// trigger), so just make sure the existing Orders doc is marked
// Received/Success instead of creating anything new. Not part of the race
// above -- this only updates a document, it never creates one.
export async function markExistingOrderReceived(
  orderId: string,
  cashFreeDetails: Record<string, any>
): Promise<boolean> {
  const ordersRef = adminDb.collection('Orders');
  let querySnapshot = await ordersRef.where('cashFreeDetails.cf_order_id', '==', orderId).limit(1).get();
  if (querySnapshot.empty) {
    querySnapshot = await ordersRef.where('cashfreeOrderId', '==', orderId).limit(1).get();
  }

  if (querySnapshot.empty) {
    return false;
  }

  await querySnapshot.docs[0].ref.update({
    status: 'Received',
    paymentStatus: 'Success',
    cashFreeDetails,
  });
  return true;
}
