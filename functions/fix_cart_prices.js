/**
 * Firebase Cloud Function to remove wrong prices from all cart items
 * This cleans up the incorrect price data stored from the broken code
 * 
 * The working code (old code) stores prices correctly at the time of add
 * But wrong prices already in Firebase need to be removed
 * 
 * Deploy with: firebase deploy --only functions:removeWrongPrices
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.removeWrongPrices = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Check if user is admin (optional - remove this check if not using auth)
    try {
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.get();
      
      let deletedCount = 0;
      let errorCount = 0;
      
      console.log(`Processing ${usersSnapshot.size} users...`);
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userId = userDoc.id;
          const cartRef = usersRef.doc(userId).collection('Cart');
          const cartSnapshot = await cartRef.get();
          
          console.log(`User ${userId}: Found ${cartSnapshot.size} cart items`);
          
          // Process each cart item
          const batch = db.batch();
          let batchCount = 0;
          
          for (const cartItem of cartSnapshot.docs) {
            try {
              const itemData = cartItem.data();
              
              // Delete the price field - it will be recalculated fresh
              // This removes the wrong prices stored by the buggy code
              batch.update(cartRef.doc(cartItem.id), {
                price: admin.firestore.FieldValue.delete(),
              });
              
              deletedCount++;
              batchCount++;
              
              // Firestore batches can only have 500 operations
              if (batchCount >= 500) {
                await batch.commit();
                console.log(`Committed batch of ${batchCount} for user ${userId}`);
                batchCount = 0;
              }
            } catch (error) {
              errorCount++;
              console.error(`Error processing ${userId}/${cartItem.id}:`, error.message);
            }
          }
          
          // Commit remaining items in batch
          if (batchCount > 0) {
            await batch.commit();
            console.log(`Committed final batch of ${batchCount} for user ${userId}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing user ${userDoc.id}:`, error.message);
        }
      }
      
      const result = {
        success: true,
        deletedCount: deletedCount,
        errorCount: errorCount,
        message: `Removed ${deletedCount} wrong prices from cart items. ${errorCount} errors encountered.`,
        timestamp: new Date().toISOString(),
      };
      
      console.log('Fix completed:', result);
      return result;
    } catch (error) {
      console.error('Fatal error in removeWrongPrices:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * Alternative: Simple HTTP endpoint to trigger the fix
 * Call with: curl -X POST https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/removeWrongPricesHTTP
 */
exports.removeWrongPricesHTTP = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    try {
      // Security: Add a simple key check
      const authKey = req.headers['x-api-key'];
      if (authKey !== process.env.FIX_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.get();
      
      let deletedCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const cartRef = usersRef.doc(userId).collection('Cart');
        const cartSnapshot = await cartRef.get();

        for (const cartItem of cartSnapshot.docs) {
          await cartRef.doc(cartItem.id).update({
            price: admin.firestore.FieldValue.delete(),
          });
          deletedCount++;
        }
      }

      return res.json({
        success: true,
        deletedCount: deletedCount,
        message: `Removed ${deletedCount} wrong prices`,
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
