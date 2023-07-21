const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.addMessage = functions.https.onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await admin
//     .firestore()
//     .collection("messages")
//     .add({ original: original });
//   // Send back a message that we've successfully written the message
//   res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

//
exports.addQResponse = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const courseID = req.query.courseid;
  const asgmtID = req.query.asgmtid;
  const userID = req.query.userid;
  const questionID = req.query.qid;
  const correctStatus = req.query.correct;
  const ptsAwarded = req.query.ptsAwarded;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("courses")
    .doc(courseID)
    .collection("assignments")
    .doc(asgmtID)
    .collection("submissions")
    .doc(userID)
    .update({
      [questionID]: [
        {
          answeredCorrectly: Boolean(Number(correctStatus)),
          pointsAwarded: Number(ptsAwarded),
        },
      ],
    });
  // Send back a message that we've successfully written the message
  res.json({ result: `Success! document updated` });
});

exports.generateGradeSummary = functions.firestore
  .document("/courses/{courseID}/assignments/{asgmtID}/submissions/{userID}")
  .onWrite((change, context) => {
    const { courseID, asgmtID, userID } = context.params;
    // const courseID = context.params.courseID;
    // const asgmtID = context.params.asgmtID;
    // const userID = context.params.userID;

    const ref1 = admin
      .firestore()
      .collection("courses")
      .doc(courseID)
      .collection("assignments")
      .doc(asgmtID);

    const ref2 = admin
      .firestore()
      .collection("courses")
      .doc(courseID)
      .collection("grades")
      .doc(userID);

    return ref1
      .get()
      .then((doc) => {
        if (doc.data().type === "question set") {
          const submissionHistory = change.after.data();
          const questionIDs = Object.keys(submissionHistory);
          const arr = [];

          questionIDs.forEach((id) => {
            const submissions = submissionHistory[id];
            const lastSubmission = submissions.at(-1);
            arr.push(lastSubmission.pointsAwarded || 0);
          });

          const totalPointsAwarded = arr.reduce((acc, cur) => acc + cur, 0);

          functions.logger.log(
            "generating question set grade summary for",
            `courseID: ${courseID}, userID: ${userID}, asgmtID: ${asgmtID}`
          );

          functions.logger.log("total points awarded: " + totalPointsAwarded);

          const values = {
            [asgmtID]: {
              totalPointsPossible: doc.data().totalPointsPossible,
              totalPointsAwarded: totalPointsAwarded,
              type: doc.data().type,
            },
          };

          ref2
            .set(values, { merge: true })
            .then(() =>
              functions.logger.log("grade summary added successfully")
            );
        } else {
          functions.logger.log(
            "assignment is not a quesiton set...exiting function"
          );
        }
      })
      .catch(() => {
        functions.logger.log(
          "an error occurred adding grade summary...exiting function"
        );
      });
  });

exports.addUserInfoToAsgmt = functions.firestore
  .document("/courses/{courseID}/grades/{userID}")
  .onCreate((snap, context) => {
    const { courseID, userID } = context.params;

    const ref = admin.firestore().collection("users").doc(userID);

    return ref
      .get()
      .then((doc) => {
        functions.logger.log("adding user info to user's grade summary");
        functions.logger.log(`userID: ${userID}, courseID: ${courseID}`);
        snap.ref.set(
          {
            email: doc.data().email,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
          },
          { merge: true }
        );
      })
      .catch(() => {
        functions.logger.log(
          "an error occurred adding grade summary...exiting function"
        );
      });
  });
