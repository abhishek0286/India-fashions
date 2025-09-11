// const admin = require("firebase-admin");

// admin.initializeApp({
//   credential: admin.credential.cert(
//     require("./test.json")
//   ),
// });

// // Subscribe a device token to a topic
// exports.subscribeToTopic = async (token, topic) => {
//   try {
//     const response = await admin.messaging().subscribeToTopic(token, topic);
//     console.log("✅ Subscribed to topic:", topic);
//     return { success: true, response };
//   } catch (err) {
//     console.error("❌ Failed to subscribe:", err.message);
//     return { success: false, message: err.message };
//   }
// };

// exports.unsubscribeFromTopic = async (token, topic) => {
//   try {
//     const response = await admin.messaging().unsubscribeFromTopic(token, topic);
//     // await admin.messaging().unsubscribeFromTopic([token1, token2], topic);
//     console.log(`✅ Unsubscribed from topic: ${topic}`);
//     return { success: true, response };
//   } catch (err) {
//     console.error(`❌ Failed to unsubscribe from topic: ${topic}`, err.message);
//     return { success: false, message: err.message };
//   }
// };

// exports.subscribeToTopics = async (token, topics = []) => {
//   const results = [];

//   for (const topic of topics) {
//     try {
//       const response = await admin.messaging().subscribeToTopic(token, topic);
//       console.log(`✅ Subscribed to topic: ${topic}`);
//       results.push({ topic, success: true, response });
//     } catch (err) {
//       console.error(`❌ Failed to subscribe to topic: ${topic}`, err.message);
//       results.push({ topic, success: false, message: err.message });
//     }
//   }

//   return results;
// };

// exports.unsubscribeFromTopics = async (token, topics = []) => {
//   const results = [];

//   for (const topic of topics) {
//     try {
//       const response = await admin.messaging().unsubscribeFromTopic(token, topic);
//       console.log(`✅ Unsubscribed from topic: ${topic}`);
//       results.push({ topic, success: true, response });
//     } catch (err) {
//       console.error(`❌ Failed to unsubscribe from topic: ${topic}`, err.message);
//       results.push({ topic, success: false, message: err.message });
//     }
//   }

//   return results;
// };

// exports.sendToTopic = async (topic, title="", body="", clickActionUrl, imageUrl="") => {
//   const message = {
//     notification: {
//       title,
//       body,
//       // imageUrl:"", // Only works in some platforms (e.g., Android)
//     },
//     data: {
//       click_action: "INDFASHION_NOTIFICATION", // required by flutter_local_notifications
//       targetUrl: clickActionUrl || "", // custom field to send the page link
//     },
//     topic,
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log("📤 Notification sent to topic:", topic);
//     return { success: true, response };
//   } catch (err) {
//     console.error("❌ Failed to send:", err.message);
//     return { success: false, message: err.message };
//   }
// };

// exports.subscribeUsersToTopic = async (users, topic) => {
//   const results = [];

//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];

//     try {
//       const response = await admin.messaging().subscribeToTopic(user.fcmToken, topic);
//       console.log(`✅ Subscribed ${user.userName} to topic: ${topic}`);
//       results.push({ success: true, user: user.userName, response });
//     } catch (err) {
//       console.error(`❌ Failed to subscribe ${user.userName} to topic: ${topic}`, err.message);
//       results.push({ success: false, user: user.userName, message: err.message });
//     }
//   }

//   return results;
// };

// exports.unsubscribeUsersToTopic = async (users, topic) => {
//   const results = [];

//   for (let i = 0; i < users.length; i++) {
//     const user = users[i];

//     try {
//       const response = await admin.messaging().unsubscribeFromTopic(user.fcmToken, topic);
//       console.log(`✅ Subscribed ${user.userName} to topic: ${topic}`);
//       results.push({ success: true, user: user.userName, response });
//     } catch (err) {
//       console.error(`❌ Failed to subscribe ${user.userName} to topic: ${topic}`, err.message);
//       results.push({ success: false, user: user.userName, message: err.message });
//     }
//   }

//   return results;
// };