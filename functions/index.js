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

exports.addQResponse = functions.https.onRequest(async (req, res) => {
  const courseID = req.query.courseid;
  const asgmtID = req.query.asgmtid;
  const userID = req.query.userid;
  const questionID = req.query.qid;
  const correctStatus = req.query.correct;
  const ptsAwarded = req.query.pts;

  await admin
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

  res.json({ result: `Success! document updated` });

  // example url
  // http://127.0.0.1:5001/koral-v3/us-central1/addQResponse?courseid=iZpyhGCBfLsQmsQ6W6rv&asgmtid=lmeGfuMgC1aaWN38Tn6g&userid=fmssRP4l1zCNkGsHo9py&qid=q82hj40&correct=1&pts=8
});

exports.addAsgmt = functions.https.onRequest(async (req, res) => {
  const qSetID = req.query.qsetid;
  const courseID = req.query.courseid;
  const userID = req.query.userid;
  const points = req.query.points;

  functions.logger.log(qSetID, courseID, userID, points);

  const ref = admin
    .firestore()
    .collection("courses")
    .doc(courseID)
    .collection("assignments");

  await ref.add({
    source: {
      docRef: `users/${userID}/question-sets/${qSetID}`,
      type: "user content",
    },
    totalPointsPossible: points,
    type: "question set",
  });

  res.json({ result: `Success! document updated` });

  // example url
  // http://127.0.0.1:5001/koral-v3/us-central1/addAsgmt?userid=kcgZaULYG103p18J2Uvq&courseid=course101&qsetid=t7PHrMq4eQQeXPtq159B&points=7
});

exports.addQSetDeployment = functions.firestore
  .document("/courses/{courseID}/assignments/{asgmtID}")
  .onCreate(async (snap, context) => {
    const { courseID } = context.params;

    const docRef = snap.data().source.docRef;
    const docRefArr = docRef.split("/");
    const userID = docRefArr[1];
    const qSetID = docRefArr[3];

    const qSetRef = admin
      .firestore()
      .collection("users")
      .doc(userID)
      .collection("question-sets")
      .doc(qSetID);

    const courseRef = admin.firestore().collection("courses").doc(courseID);

    const qSetDoc = await qSetRef.get();
    const deployments = qSetDoc.data()?.deployments || [];

    const courseDoc = await courseRef.get();
    const courseTitle = courseDoc.data()?.title || "";

    const newDeployment = {
      type: "course",
      id: courseID,
      title: courseTitle,
    };

    return qSetRef.update({ deployments: [...deployments, newDeployment] });
  });

exports.removeQSetDeployment = functions.firestore
  .document("/courses/{courseID}/assignments/{asgmtID}")
  .onDelete(async (snap, context) => {
    const { courseID } = context.params;
    const docRef = snap.data().source.docRef;
    const docRefArr = docRef.split("/");
    const userID = docRefArr[1];
    const qSetID = docRefArr[3];

    const qSetRef = admin
      .firestore()
      .collection("users")
      .doc(userID)
      .collection("question-sets")
      .doc(qSetID);

    const qSetDoc = await qSetRef.get();
    const deployments = qSetDoc.data()?.deployments || [];

    const itemIndex = deployments.findIndex((el) => el.id === courseID);

    if (itemIndex > -1) {
      deployments.splice(itemIndex, 1);
    }

    return qSetRef.update({ deployments: deployments });
  });

exports.generateGradeSummary = functions.firestore
  .document("/courses/{courseID}/assignments/{asgmtID}/submissions/{userID}")
  .onWrite(async (change, context) => {
    const { courseID, asgmtID, userID } = context.params;

    const asmgtRef = admin
      .firestore()
      .collection("courses")
      .doc(courseID)
      .collection("assignments")
      .doc(asgmtID);

    const studentGradesDoc = admin
      .firestore()
      .collection("courses")
      .doc(courseID)
      .collection("grades")
      .doc(userID);

    const asgmtDoc = await asmgtRef.get();

    if (asgmtDoc.data().type === "question set") {
      const totalPointsAwarded = change.after.data().totalPointsAwarded;

      functions.logger.log(
        "generating question set grade summary for",
        `courseID: ${courseID}, userID: ${userID}, asgmtID: ${asgmtID}`
      );

      functions.logger.log("total points awarded: " + totalPointsAwarded);

      const values = {
        [asgmtID]: {
          totalPointsPossible: asgmtDoc.data().totalPointsPossible,
          totalPointsAwarded: totalPointsAwarded,
          type: asgmtDoc.data().type,
        },
      };

      return studentGradesDoc
        .set(values, { merge: true })
        .then(() => functions.logger.log("grade summary added successfully"))
        .catch(() => {
          functions.logger.log(
            "an error occurred adding grade summary...exiting function"
          );
        });
    }
  });

exports.addUserInfoToAsgmt = functions.firestore
  .document("/courses/{courseID}/grades/{userID}")
  .onCreate(async (snap, context) => {
    const { courseID, userID } = context.params;

    const ref = admin.firestore().collection("users").doc(userID);
    const userDoc = await ref.get();
    const values = {
      email: userDoc.data().email,
      firstName: userDoc.data().firstName,
      lastName: userDoc.data().lastName,
    };

    return snap.ref
      .set(values, { merge: true })
      .then(() => {
        functions.logger.log("adding user info to user's grade summary");
        functions.logger.log(`userID: ${userID}, courseID: ${courseID}`);
      })
      .catch(() => {
        functions.logger.log(
          "an error occurred adding grade summary...exiting function"
        );
      });
  });

exports.incrementLibQnCount = functions.firestore
  .document("/libraries/{libID}/questions/{questionID}")
  .onCreate(async (snap, context) => {
    const { libID } = context.params;
    const ref = admin.firestore().collection("libraries").doc(libID);

    const libDoc = await ref.get();
    const questionCount = libDoc.data().questionCount;

    functions.logger.log(
      "question added to library...incrementing question count"
    );

    //had difficulty using admine.firestore.FieldValue.increment(), so setting questionCount explicitly
    return ref.update({ questionCount: questionCount + 1 });
  });

exports.decrementLibQnCount = functions.firestore
  .document("/libraries/{libID}/questions/{questionID}")
  .onDelete(async (snap, context) => {
    const { libID } = context.params;
    const ref = admin.firestore().collection("libraries").doc(libID);

    const libDoc = await ref.get();
    const questionCount = libDoc.data().questionCount;

    functions.logger.log(
      "question removed from library...decrementing question count"
    );

    //had difficulty using admine.firestore.FieldValue.increment(), so setting questionCount explicitly
    return ref.update({ questionCount: questionCount - 1 });
  });
