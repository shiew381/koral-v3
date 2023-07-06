import { db } from "../config/firebaseConfig.js";
import {
  addDoc,
  arrayUnion,
  deleteDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { generateRandomCode } from "./commonUtils.js";

export function addCourse(handleClose, setSubmitting, values) {
  const ref = collection(db, "courses");
  setSubmitting(true);
  addDoc(ref, values)
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

  console.log(user.uid);
  console.log(qSet.id);

  const newID = generateRandomCode(8);

  const tidiedValues = {
    id: newID,
    created: new Date(),
    ...values,
  };

  console.log(tidiedValues);

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

export function addUser({ userCredentials, values }) {
  setDoc(doc(db, "users", userCredentials.user.uid), values);
}

export function addUserLink(user, values, setSubmitting, handleClose) {
  const ref = collection(db, "users", user.uid, "links");
  setSubmitting(true);
  addDoc(ref, { ...values, created: serverTimestamp() })
    .then(() => {
      setSubmitting(false);
      handleClose();
    })
    .catch((error) => console.log(error));
}

export function addUserQSet(user, values, setSubmitting, handleClose) {
  const ref = collection(db, "users", user.uid, "question-sets");
  setSubmitting(true);
  addDoc(ref, { ...values, questions: [], created: serverTimestamp() })
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
  const ref = doc(db, "users", user.uid, "assets", qSet.id);
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
  const ref = doc(db, "users", user.uid, "assets", qSet.id);
  const tidiedValues = {
    id: newID,
    created: new Date(),
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

export function deleteFirestoreRef(user, colName, docID) {
  deleteDoc(doc(db, "users", user.uid, colName, docID));
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
      created: doc.data().created?.toDate(),
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
    console.log("Current data: ", doc.data());
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
      created: doc.data().created?.toDate(),
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
    console.log("Current data: ", doc.data());
    setQSet({
      id: doc.id,
      ...doc.data(),
    });
    setFetching(false);
  });
  return unsubscribe;
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
  const ref = doc(db, "users", user.uid, "assets", qSet.id);

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
