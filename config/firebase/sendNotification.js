// const admin = require('firebase-admin');
// const serviceAccount = require('./test.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// exports.sendNotificationToUser = async (deviceToken, title, body,imageUrl, data,actionPage) => {
//   const message = {
//     token: deviceToken,
//     notification: {
//       title: title,
//       body: body,
//       image: imageUrl,  // URL or path to the image file
//     },
//     android: {
//       notification: {
//         channel_id: 'indfashion', // Specify your channel ID here
//       }
//     },
//     apns: {
//       payload: {
//         aps: {
//           alert: {
//             title: title,
//             body: body,
//           },
//           sound: 'default',
//           badge: 1,  // Optional: Badge count on the app icon
//           'mutable-content': 1  // Required for rich notifications (images, etc.)
//         },
//       },
//       fcm_options: {
//         image: imageUrl  // URL or path to the image file
//       }
//     },
//     data: {
//       ...data,
//       click_action: actionPage  // Custom action
//     },
//   };

//   console.log("Message", message);

//   try {
//     const response = await admin.messaging().send(message);
//     console.log('Successfully sent message:', response);
//     return {
//       success : 1,
//       result : response,
//       payload : message
//     }
//   } catch (error) {
//     console.error('Error sending message:', error);
//     return {
//       success : 0,
//       result : error,
//       payload : message
//     };
//   }
// };