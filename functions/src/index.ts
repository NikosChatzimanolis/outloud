import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Trigger when a message is created
 * Path: threads/{threadId}/messages/{messageId}
 */
export const onMessageCreated = functions.firestore
  .document("threads/{threadId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data();

    if (!message) {
      console.log("No message data.");
      return;
    }

    const { fromUid, toUid, text } = message;

    console.log("New message:", text);

    if (!fromUid || !toUid) {
      console.log("Missing sender or receiver.");
      return;
    }

    try {
      // get receiver user document
      const userDoc = await db.collection("users").doc(toUid).get();

      if (!userDoc.exists) {
        console.log("Receiver not found");
        return;
      }

      const userData = userDoc.data();

      if (!userData || !userData.deviceTokens) {
        console.log("No device tokens for user");
        return;
      }

      const tokens: string[] = userData.deviceTokens;

      const payload: admin.messaging.MulticastMessage = {
        tokens: tokens,
        notification: {
          title: "New OutLoud message",
          body: text,
        },
        data: {
          threadId: context.params.threadId,
          messageId: context.params.messageId,
        },
      };

      await admin.messaging().sendMulticast(payload);

      console.log("Push notification sent");
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  });