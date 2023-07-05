import { db } from "../config/firebaseConfig.js";

import {
  addDoc,
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
  const ref = collection(db, "users", user.uid, "questionSets");
  setSubmitting(true);
  addDoc(ref, { ...values, questions: [], created: serverTimestamp() })
    .then(() => {
      setSubmitting(false);
      handleClose();
    })
    .catch((error) => console.log(error));
}

export function deleteFirestoreRef(user, colName, docID) {
  deleteDoc(doc(db, "users", user.uid, colName, docID));
}

export function fetchCourses(user, setCourses, setFetching) {
  const colRef = collection(db, "courses");
  const q = query(colRef, where("instructorIDs", "array-contains", user.uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCourses(fetchedItems);
    setFetching(false);
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

export function fetchUserQSets(user, setQSets, setFetching) {
  const ref = collection(db, "users", user.uid, "questionSets");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      created: doc.data().created?.toDate(),
      searchHandle: doc.data().title.toLowerCase(),
    }));
    setQSets(fetchedItems);
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
  const docRef = doc(db, "users", user.id, "question_sets", docID);
  setSubmitting(true);
  updateDoc(docRef, values)
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}
