import { db } from "../config/firebaseConfig.js";
import {
  addDoc,
  arrayUnion,
  deleteDoc,
  deleteField,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { generateRandomCode, searchifyTags } from "./commonUtils.js";

export function addAssignment(course, values, handleClose, setSubmitting) {
  const ref = collection(db, "courses", course.id, "assignments");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addAnnouncement(course, values, handleClose, setSubmitting) {
  const ref = collection(db, "courses", course.id, "announcements");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export async function addTags(
  tags,
  libraryID,
  questionID,
  handleClose,
  setSubmitting
) {
  const docRef = doc(db, "libraries", libraryID, "questions", questionID);

  const tagsSearchable = searchifyTags(tags);

  setSubmitting(true);
  updateDoc(docRef, { tags: tags, tags_searchable: tagsSearchable })
    .then(() => setTimeout(() => handleClose(), 500))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 300));
}

export function addCourse(values, handleClose, setSubmitting) {
  const ref = collection(db, "courses");
  setSubmitting(true);
  addDoc(ref, { dateCreated: serverTimestamp(), ...values })
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addPointerToFile(user, file, url, colName) {
  const ref = collection(db, "users", user.uid, colName);
  const data = {
    type: file.type,
    name: file.name,
    size: file.size,
    dateUploaded: serverTimestamp(),
    url: url,
  };
  addDoc(ref, data)
    .then(() => console.log("upload successful"))
    .catch((error) => console.log(error));
}

export function addPointerToCourseImage(course, file, url) {
  const ref = doc(db, "courses", course.id);
  const data = {
    type: file.type,
    name: file.name,
    size: file.size,
    dateUploaded: serverTimestamp(),
    url: url,
  };
  updateDoc(ref, { courseImage: data })
    .then(() => console.log("upload successful"))
    .catch((error) => console.log(error));
}

export function addQuestion(
  values,
  qSet,
  user,
  setSubmitting,
  setSelQuestion,
  handleClose
) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);

  const newID = generateRandomCode(8);

  const tidiedValues = {
    id: newID,
    created: new Date(),
    ...values,
  };

  setSubmitting(true);
  updateDoc(ref, {
    questions: arrayUnion(tidiedValues),
  })
    .then(() => {
      setSelQuestion(tidiedValues);
      setTimeout(() => handleClose(), 600);
    })
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addQuestionToLibrary(
  values,
  libraryID,
  handleClose,
  setSubmitting
) {
  const ref = collection(db, "libraries", libraryID, "questions");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addResource(course, values, handleClose, setSubmitting) {
  const ref = collection(db, "courses", course.id, "resources");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addStudentToCourse(
  course,
  studentInfo,
  handleClose,
  setSubmitting
) {
  setSubmitting(true);
  const ref1 = doc(db, "courses", course.id);
  const ref2 = doc(db, "courses", course.id, "students", studentInfo.id);

  setDoc(ref2, { ...studentInfo, dateJoined: serverTimestamp() }).catch(
    (error) => console.log(error)
  );

  updateDoc(ref1, {
    studentIDs: arrayUnion(studentInfo.id),
  })
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addUser({ userCredentials, values }) {
  setDoc(doc(db, "users", userCredentials.user.uid), values);
}

export function addUserLink(user, values, setSubmitting, handleClose) {
  const ref = collection(db, "users", user.uid, "links");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 500))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 300));
}

export function addUserQSet(user, values, setSubmitting, handleClose) {
  const ref = collection(db, "users", user.uid, "question-sets");
  setSubmitting(true);
  addDoc(ref, { ...values, questions: [], dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 500))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 300));
}

export function autoSaveQuestion(
  values,
  questionID,
  qSet,
  user,
  setSelQuestion
) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);
  const updatedQuestions = qSet.questions.map((question) =>
    question.id === questionID ? values : question
  );

  updateDoc(ref, {
    questions: updatedQuestions,
  }).then(() => setSelQuestion(values));
}

export function autoAddQueston(
  values,
  newID,
  qSet,
  user,
  setEdit,
  setSelQuestion
) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);
  const tidiedValues = {
    id: newID,
    dateCreated: new Date(),
    ...values,
  };

  updateDoc(ref, {
    questions: arrayUnion(tidiedValues),
  }).then(() => {
    setSelQuestion(tidiedValues);
    setEdit(true);
  });

  return tidiedValues.id;
}

export function deleteCourseAnncmt(course, anncmt) {
  const ref = doc(db, "courses", course.id, "announcements", anncmt.id);
  deleteDoc(ref);
}

export function deleteCourseAsgmt(course, asgmt) {
  const ref = doc(db, "courses", course.id, "assignments", asgmt.id);
  deleteDoc(ref);
}

export function deleteCourseImage(course) {
  const ref = doc(db, "courses", course.id);
  updateDoc(ref, { courseImage: deleteField() });
}

export function deleteCourseResource(course, resource) {
  const ref = doc(db, "courses", course.id, "resources", resource.id);
  deleteDoc(ref);
}

export function deleteLibraryQuestion(question, libraryID) {
  const ref = doc(db, "libraries", libraryID, "questions", question.id);
  deleteDoc(ref);
}

export function deleteQuestion(question, qIndex, qSet, user, setSelQuestion) {
  const questions = qSet.questions;
  const updatedQuestions = questions.filter((el) => question.id !== el.id);

  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);
  updateDoc(ref, {
    questions: updatedQuestions,
  }).then(() => {
    if (updatedQuestions.length === 0) {
      setSelQuestion(null);
    } else if (qIndex === 0) {
      setSelQuestion(updatedQuestions[0]);
    } else if (updatedQuestions.length === qIndex) {
      setSelQuestion(updatedQuestions[qIndex - 1]);
    } else {
      setSelQuestion(updatedQuestions[qIndex]);
    }
  });
}

export function deleteQuestionSubmissions(selQuestion, docRefParams) {
  const { qSetID, userID } = docRefParams;
  const ref = doc(db, "users", userID, "question-sets", qSetID);

  updateDoc(ref, {
    [`submissionHistory.${selQuestion.id}`]: [],
  });
}

export function deleteUserContent(user, colName, docID) {
  const ref = doc(db, "users", user.uid, colName, docID);
  deleteDoc(ref);
}

export function fetchAnnouncements(courseID, setAnnouncements, setLoading) {
  const ref = collection(db, "courses", courseID, "announcements");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated?.toDate(),
    }));
    setAnnouncements(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchAssignments(courseID, setAssignments, setLoading) {
  const ref = collection(db, "courses", courseID, "assignments");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated?.toDate(),
      dateDue: doc.data().dateDue?.toDate(),
      dateOpen: doc.data().dateOpen?.toDate(),
    }));
    setAssignments(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchCourse(courseID, setCourse, setLoading) {
  //TODO: restrict access to instructor
  const ref = doc(db, "courses", courseID);
  const unsubscribe = onSnapshot(ref, (doc) => {
    setCourse({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated.toDate(),
    });
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchGrades(courseID, setGrades) {
  const ref = collection(db, "courses", courseID, "grades");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGrades(fetchedItems);
  });
  return unsubscribe;
}

export function fetchInstructorCourses(user, setInstructorCourses) {
  const colRef = collection(db, "courses");
  const q = query(colRef, where("instructorIDs", "array-contains", user.uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setInstructorCourses(fetchedItems);
  });
  return unsubscribe;
}

export function fetchLibraries(setLibraries) {
  const colRef = collection(db, "libraries");
  const q = query(colRef);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLibraries(fetchedItems);
  });
  return unsubscribe;
}

export function fetchLibrary(libraryID, setLibrary, setLoading) {
  const ref = doc(db, "libraries", libraryID);
  const unsubscribe = onSnapshot(ref, (doc) => {
    setLibrary({
      id: doc.id,
      ...doc.data(),
    });
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchLibraryQuestions(libraryID, setQuestions) {
  const ref = collection(db, "libraries", libraryID, "questions");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestions(fetchedItems);
  });
  return unsubscribe;
}

export function fetchStudentCourses(user, setStudentCourses, setLoading) {
  const colRef = collection(db, "courses");
  const q = query(colRef, where("studentIDs", "array-contains", user.uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudentCourses(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchQSetSubmissionHistory(
  courseID,
  asgmtID,
  user,
  setSubmissionHistory
) {
  const ref = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    user.uid
  );

  const unsubscribe = onSnapshot(ref, (doc) => {
    if (!doc.data()) {
      setSubmissionHistory(null);
    } else {
      setTimeout(() => {
        setSubmissionHistory({
          ...doc.data(),
        });
      }, 200);
    }
  });
  return unsubscribe;
}

export function fetchResources(courseID, setResources, setLoading) {
  const ref = collection(db, "courses", courseID, "resources");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated.toDate(),
    }));
    setResources(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchUserDocuments(user, setDocuments, setLoading) {
  function compareNames(a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
  }

  const ref = collection(db, "users", user.uid, "documents");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      url: doc.data().url,
      dateUploaded: doc.data().dateUploaded?.toDate(),
      size: doc.data().size,
      searchHandle: doc.data().name.toLowerCase(),
    }));
    setDocuments(fetchedItems.sort(compareNames));
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchUserImages(user, setImages, setLoading) {
  const ref = collection(db, "users", user.uid, "images");
  const q = query(ref, orderBy("dateUploaded", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      url: doc.data().url,
      dateUploaded: doc.data().dateUploaded?.toDate(),
      size: doc.data().size,
      searchHandle: doc.data().name.toLowerCase(),
    }));
    setImages(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchUserLinks(user, setLinks, setLoading) {
  const ref = collection(db, "users", user.uid, "links");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      url: doc.data().url,
      dateCreated: doc.data().dateCreated?.toDate(),
      searchHandle: doc.data().title.toLowerCase(),
    }));
    setTimeout(() => {
      setLinks(fetchedItems);
      setLoading(false);
    }, 1000);
  });
  return unsubscribe;
}

export function fetchUserInfo(user, setUserInfo) {
  const ref = doc(db, "users", user.uid);
  const unsubscribe = onSnapshot(ref, (doc) => {
    setUserInfo({
      id: doc.id,
      ...doc.data(),
    });
  });
  return unsubscribe;
}

export function fetchUserQSets(user, setQSets, setLoading) {
  const ref = collection(db, "users", user.uid, "question-sets");
  const q = query(ref, orderBy("title", "asc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      mode: doc.data().mode,
      adaptiveParams: doc.data().adaptiveParams || null,
      deployments: doc.data().deployments || [],
      questions: doc.data().questions,
      dateCreated: doc.data().dateCreated?.toDate(),
      searchHandle: doc.data().title.toLowerCase(),
    }));
    setQSets(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchUserQSet(user, qSetID, setQSet, setFetching) {
  const ref = doc(db, "users", user.uid, "question-sets", qSetID);
  const unsubscribe = onSnapshot(ref, (doc) => {
    const values = {
      id: doc.id,
      ...doc.data(),
    };
    setTimeout(() => {
      setQSet(values);
      setFetching(false);
    }, 1000);
  });
  return unsubscribe;
}

export function getAssignment(courseID, asgmtID, setAsgmt) {
  const ref = doc(db, "courses", courseID, "assignments", asgmtID);
  getDoc(ref).then((doc) => setAsgmt({ id: doc.id, ...doc.data() }));
}

export function getResource(courseID, resourceID, setResource) {
  const ref = doc(db, "courses", courseID, "resources", resourceID);
  getDoc(ref).then((doc) => setResource({ id: doc.id, ...doc.data() }));
}

export function getImage(userID, imageID, setImage, setLoading) {
  const ref = doc(db, "users", userID, "images", imageID);
  getDoc(ref).then((doc) => {
    setImage({ id: doc.id, ...doc.data() });
    setLoading(false);
  });
}

export function getDocument(userID, documentID, setDocument, setLoading) {
  const ref = doc(db, "users", userID, "documents", documentID);
  getDoc(ref).then((doc) => {
    setDocument({ id: doc.id, ...doc.data() });
    setLoading(false);
  });
}

export function getLink(userID, linkID, setLink, setLoading) {
  const ref = doc(db, "users", userID, "links", linkID);
  getDoc(ref).then((doc) => {
    setLink({ id: doc.id, ...doc.data() });
    setLoading(false);
  });
}

export function getQSet(userID, qSetID, setQSet, setLoading) {
  const ref = doc(db, "users", userID, "question-sets", qSetID);
  getDoc(ref).then((doc) => {
    setQSet({ id: doc.id, ...doc.data() });
    setLoading(false);
  });
}

export function getUserDocuments(user, setDocuments, setSelItem) {
  const ref = collection(db, "users", user.uid, "documents");
  const q = query(ref);

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDocuments(fetchedItems);
    setSelItem(fetchedItems[0]);
  });
}

export function getUserGrades(courseID, userID, setGrades) {
  const ref = doc(db, "courses", courseID, "grades", userID);
  getDoc(ref).then((doc) => {
    setGrades({ id: doc.id, ...doc.data() });
  });
}

export function getUserLinks(user, setLinks, setSelItem) {
  const ref = collection(db, "users", user.uid, "links");
  const q = query(ref);

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLinks(fetchedItems);
    setSelItem(fetchedItems[0]);
  });
}

export function getUserImages(user, setImages, setSelItem) {
  const ref = collection(db, "users", user.uid, "images");
  const q = query(ref);

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setImages(fetchedItems);
    setSelItem(fetchedItems[0]);
  });
}

export function getUserQSets(user, setQSets, setSelItem) {
  const ref = collection(db, "users", user.uid, "question-sets");
  const q = query(ref);

  function calcTotalPossiblePoints(qSet) {
    const questions = qSet.questions;
    if (questions.length === 0) return 0;
    if (qSet.mode === "adaptive") {
      return qSet.adaptiveParams?.totalPointsPossible || 0;
    }
    const arr = [];
    questions.forEach((question) => arr.push(question.pointsPossible || 0));
    return arr.reduce((acc, cur) => acc + cur, 0);
  }

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      totalPointsPossible: calcTotalPossiblePoints(doc.data()),
    }));
    setQSets(fetchedItems);
    setSelItem(fetchedItems[0]);
  });
}

export function saveFreeResponse(
  docRefParams,
  question,
  currentResponse,
  setSubmitting
) {
  const { userID, qSetID } = docRefParams;
  const newSubmission = {
    response: currentResponse,
    dateSubmitted: new Date(),
  };

  const ref = doc(db, "users", userID, "question-sets", qSetID);

  // overwrite previous response
  setSubmitting(true);
  updateDoc(ref, {
    [`submissionHistory.${question.id}`]: [newSubmission],
  }).finally(() => setTimeout(() => setSubmitting(false), 300));
}

export function saveFreeResponseFromCourse(
  docRefParams,
  question,
  currentResponse,
  setSubmitting
) {
  const { courseID, asgmtID, userID } = docRefParams;

  const ref = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    userID
  );

  function overwriteResponse() {
    const newSubmission = {
      response: currentResponse,
      dateSubmitted: new Date(),
    };
    setSubmitting(true);
    updateDoc(ref, { [question.id]: [newSubmission] }).finally(() =>
      setTimeout(() => setSubmitting(false), 300)
    );
  }

  overwriteResponse();
}

export function saveQuestionResponse(
  submissions,
  docRefParams,
  question,
  currentResponse,
  grade,
  setSubmitting
) {
  const { userID, qSetID } = docRefParams;
  const ref = doc(db, "users", userID, "question-sets", qSetID);

  const newSubmission = {
    response: currentResponse,
    dateSubmitted: new Date(),
  };

  newSubmission.answeredCorrectly = grade.answeredCorrectly;
  newSubmission.pointsAwarded = grade.pointsAwarded;

  const updatedSubmissions = [...submissions, newSubmission];

  setSubmitting(true);
  updateDoc(ref, {
    [`submissionHistory.${question.id}`]: updatedSubmissions,
  }).finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function saveQResponseFromCourse(
  submissions,
  docRefParams,
  question,
  currentResponse,
  grade,
  updatedPointsAwarded,
  setSubmitting
) {
  const { courseID, asgmtID, userID } = docRefParams;

  const ref = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    userID
  );

  const newSubmission = {
    response: currentResponse,
    dateSubmitted: new Date(),
  };

  function appendResponse() {
    const updatedSubmissions = [...submissions, newSubmission];
    newSubmission.answeredCorrectly = grade.answeredCorrectly;
    newSubmission.pointsAwarded = grade.pointsAwarded;
    setSubmitting(true);

    setDoc(
      ref,
      {
        [question.id]: updatedSubmissions,
        totalPointsAwarded: updatedPointsAwarded,
      },
      { merge: true }
    ).finally(() => setTimeout(() => setSubmitting(false), 500));
  }

  appendResponse();
}

export function saveAdaptivePointsAwarded(docRefParams, points) {
  const { courseID, asgmtID, userID } = docRefParams;

  const ref = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    userID
  );

  updateDoc(ref, {
    totalPointsAwarded: points,
  });
}

export function updateAdaptiveParams(
  user,
  docID,
  values,
  setSubmitting,
  handleClose
) {
  const docRef = doc(db, "users", user.uid, "question-sets", docID);
  setSubmitting(true);
  updateDoc(docRef, values)
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function updateAnnouncement(
  course,
  selAnncmt,
  values,
  handleClose,
  setSubmitting
) {
  const ref = doc(db, "courses", course.id, "announcements", selAnncmt.id);

  setSubmitting(true);
  updateDoc(ref, values)
    .then(() => setTimeout(() => handleClose(), 800))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function updateAssignment(
  course,
  selAsgmt,
  values,
  handleClose,
  setSubmitting
) {
  const ref = doc(db, "courses", course.id, "assignments", selAsgmt.id);

  setSubmitting(true);
  updateDoc(ref, values)
    .then(() => setTimeout(() => handleClose(), 800))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export async function updateTags(tags, libraryID, questionID) {
  const docRef = doc(db, "libraries", libraryID, "questions", questionID);
  const tagsSearchable = searchifyTags(tags);
  updateDoc(docRef, { tags: tags, tags_searchable: tagsSearchable });
}

export function updateQuestion(
  values,
  selQuestion,
  qSet,
  user,
  setSubmitting,
  setSelQuestion,
  handleClose
) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);

  const tidiedValues = {
    id: selQuestion.id,
    ...values,
    updated: new Date(),
  };

  const updatedQuestions = qSet.questions.map((question) =>
    question.id === selQuestion.id ? tidiedValues : question
  );

  setSubmitting(true);
  updateDoc(ref, {
    questions: updatedQuestions,
  })
    .then(() => {
      setSelQuestion(tidiedValues);
      setTimeout(() => handleClose(), 800);
    })
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function updateUserQSet(
  user,
  qSet,
  updatedValues,
  setSubmitting,
  successAction
) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);

  setSubmitting && setSubmitting(true);
  updateDoc(ref, updatedValues)
    .then(() => successAction && setTimeout(() => successAction(), 250))
    .catch((error) => console.log(error))
    .finally(
      () => setSubmitting && setTimeout(() => setSubmitting(false), 200)
    );
}
