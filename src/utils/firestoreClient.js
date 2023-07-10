import { db } from "../config/firebaseConfig.js";
import {
  addDoc,
  arrayUnion,
  deleteDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { generateRandomCode } from "./commonUtils.js";

export function addAssignment(course, values, handleClose, setSubmitting) {
  const ref = collection(db, "courses", course.id, "assignments");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => {
      setTimeout(() => setSubmitting(false), 500);
      setTimeout(() => handleClose(), 500);
    })
    .catch((error) => {
      console.log(error);
      setTimeout(() => setSubmitting(false), 500);
    });
}

export function addCourse(handleClose, setSubmitting, values) {
  const ref = collection(db, "courses");
  setSubmitting(true);
  addDoc(ref, { dateCreated: serverTimestamp(), ...values })
    .then(() => {
      setTimeout(() => setSubmitting(false), 500);
      setTimeout(() => handleClose(), 500);
    })
    .catch((error) => {
      console.log(error);
      setTimeout(() => setSubmitting(false), 500);
    });
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
      setTimeout(() => handleClose(), 800);
    })
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function addPointerToFile(user, file, url, colName) {
  const ref = collection(db, "users", user.uid, colName);
  const data = {
    type: file.type,
    name: file.name,
    size: file.size,
    uploaded: serverTimestamp(),
    url: url,
  };
  addDoc(ref, data)
    .then(() => console.log("upload successful"))
    .catch((error) => console.log(error));
}

export function addResource(course, values, handleClose, setSubmitting) {
  const ref = collection(db, "courses", course.id, "resources");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => {
      setTimeout(() => setSubmitting(false), 500);
      setTimeout(() => handleClose(), 500);
    })
    .catch((error) => {
      console.log(error);
      setTimeout(() => setSubmitting(false), 500);
    });
}

export function addUser({ userCredentials, values }) {
  setDoc(doc(db, "users", userCredentials.user.uid), values);
}

export function addUserLink(user, values, setSubmitting, handleClose) {
  const ref = collection(db, "users", user.uid, "links");
  setSubmitting(true);
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => {
      setSubmitting(false);
      handleClose();
    })
    .catch((error) => console.log(error));
}

export function addUserQSet(user, values, setSubmitting, handleClose) {
  const ref = collection(db, "users", user.uid, "question-sets");
  setSubmitting(true);
  addDoc(ref, { ...values, questions: [], dateCreated: serverTimestamp() })
    .then(() => {
      setSubmitting(false);
      handleClose();
    })
    .catch((error) => console.log(error));
}

export function autoSaveQuestion(
  values,
  selQuestion,
  qSet,
  user,
  setSelQuestion
) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);
  const updatedQuestions = qSet.questions.map((question) =>
    question.id === selQuestion.id ? values : question
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

export function deleteCourseResource(course, resource) {
  const ref = doc(db, "courses", course.id, "resources", resource.id);
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

export function deleteQuestionSubmissions(selQuestion, qSet, user) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);

  updateDoc(ref, {
    [`submissionHistory.${selQuestion.id}`]: [],
  });
}

export function deleteUserContent(user, colName, docID) {
  const ref = doc(db, "users", user.uid, colName, docID);
  deleteDoc(ref);
}

export function fetchAssignments(courseID, setAssignments, setLoading) {
  const ref = collection(db, "courses", courseID, "assignments");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated.toDate(),
      dateDue: doc.data().dateDue.toDate(),
      dateOpen: doc.data().dateOpen.toDate(),
    }));
    setAssignments(fetchedItems);
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchCourses(user, setCourses, setLoading) {
  const colRef = collection(db, "courses");
  const q = query(colRef, where("instructorIDs", "array-contains", user.uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCourses(fetchedItems);
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

export function fetchUserDocuments(user, setDocuments, setFetching) {
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
      uploaded: doc.data().uploaded?.toDate(),
      size: doc.data().size,
      searchHandle: doc.data().name.toLowerCase(),
    }));
    setDocuments(fetchedItems.sort(compareNames));
    setFetching(false);
  });
  return unsubscribe;
}

export function fetchUserImages(user, setImages, setFetching) {
  const ref = collection(db, "users", user.uid, "images");
  const q = query(ref, orderBy("uploaded", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      url: doc.data().url,
      uploaded: doc.data().uploaded?.toDate(),
      size: doc.data().size,
      searchHandle: doc.data().name.toLowerCase(),
    }));
    setImages(fetchedItems);
    setFetching(false);
  });
  return unsubscribe;
}

export function fetchUserLinks(user, setLinks, setFetching) {
  const ref = collection(db, "users", user.uid, "links");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      url: doc.data().url,
      dateCreated: doc.data().dateCreated?.toDate(),
      searchHandle: doc.data().title.toLowerCase(),
    }));
    setLinks(fetchedItems);
    setFetching(false);
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

export function fetchUserQSets(user, setQSets, setFetching) {
  const ref = collection(db, "users", user.uid, "question-sets");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      mode: doc.data().mode,
      dateCreated: doc.data().dateCreated?.toDate(),
      searchHandle: doc.data().title.toLowerCase(),
    }));
    setQSets(fetchedItems);
    setFetching(false);
  });
  return unsubscribe;
}

export function fetchUserQSet(user, qSetID, setQSet, setFetching) {
  const ref = doc(db, "users", user.uid, "question-sets", qSetID);
  const unsubscribe = onSnapshot(ref, (doc) => {
    setQSet({
      id: doc.id,
      ...doc.data(),
    });
    setFetching(false);
  });
  return unsubscribe;
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

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
    }));
    setQSets(fetchedItems);
    setSelItem(fetchedItems[0]);
  });
}

export function saveQuestionResponse(
  currentResponse,
  grade,
  submissions,
  question,
  qSet,
  user
) {
  const newSubmission = { response: currentResponse, submitted: new Date() };

  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);

  function appendResponse() {
    updateDoc(ref, {
      [`submissionHistory.${question.id}`]: [...submissions, newSubmission],
    });
  }

  function overwriteResponse() {
    updateDoc(ref, {
      [`submissionHistory.${question.id}`]: [newSubmission],
    });
  }

  if (grade) {
    newSubmission.answeredCorrectly = grade.answeredCorrectly;
    newSubmission.pointsAwarded = grade.pointsAwarded;
  }

  if (question.type === "free response") {
    overwriteResponse();
  } else {
    appendResponse();
  }
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
