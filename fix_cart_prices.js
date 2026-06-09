/**
 * Firebase Cloud Function to fix incorrect cart prices for all users
 * Run this ONCE to clean up the wrong prices stored in Firebase
 * 
 * This function:
 * 1. Reads all user cart items
 * 2. Recalculates the correct price using: quantity × unitPrice1
 * 3. Updates the stored price in Firestore
 * 
 * Deploy with: firebase functions:deploy fixCartPrices
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.fixCartPrices = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    try {
      const usersRef = db.collection('users');
      const usersSnapshot = await usersRef.get();
      
      let fixedCount = 0;
      let errorCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const cartRef = usersRef.doc(userId).collection('Cart');
        const cartSnapshot = await cartRef.get();
        
        for (const cartItem of cartSnapshot.docs) {
          try {
            const itemData = cartItem.data();
            
            // Get the correct unit price
            const unitPrice = itemData.selectedPrice || itemData.unitPrice1 || 0;
            const quantity = itemData.quantity || 1;
            
            // Calculate the correct total price
            const correctPrice = quantity * unitPrice;
            
            // Only update if price is different
            if (itemData.price !== correctPrice) {
              await cartRef.doc(cartItem.id).update({
                price: correctPrice,
              });
              fixedCount++;
              console.log(`Fixed ${userId}/${cartItem.id}: ${itemData.price} → ${correctPrice}`);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error fixing ${userId}/${cartItem.id}:`, error);
          }
        }
      }
      
      return {
        success: true,
        fixedCount: fixedCount,
        errorCount: errorCount,
        message: `Fixed ${fixedCount} cart items, ${errorCount} errors`,
      };
    } catch (error) {
      console.error('Error in fixCartPrices:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });

/**
 * MANUAL ALTERNATIVE: Run this in Firebase Console if you can't deploy
 * 
 * 1. Go to Firebase Console → Cloud Firestore
 * 2. In the browser console (F12), paste and run:
 */

const manualFixScript = `
const firebase = require('firebase/app');
require('firebase/firestore');

const db = firebase.firestore();
let fixedCount = 0;

async function fixPrices() {
  const usersRef = db.collection('users');
  const usersSnapshot = await usersRef.get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const cartRef = usersRef.doc(userId).collection('Cart');
    const cartSnapshot = await cartRef.get();
    
    for (const cartItem of cartSnapshot.docs) {
      const itemData = cartItem.data();
      const unitPrice = itemData.selectedPrice || itemData.unitPrice1 || 0;
      const quantity = itemData.quantity || 1;
      const correctPrice = quantity * unitPrice;
      
      if (itemData.price !== correctPrice) {
        await cartRef.doc(cartItem.id).update({
          price: correctPrice,
        });
        fixedCount++;
        console.log('Fixed:', correctPrice);
      }
    }
  }
  
  console.log('Fixed ' + fixedCount + ' items');
}

fixPrices();
`;
