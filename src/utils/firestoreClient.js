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
  limit,
  startAfter,
  endBefore,
} from "firebase/firestore";
import {
  generateRandomCode,
  searchifyTags,
  sortByTitle,
} from "./commonUtils.js";

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

export function addManualAsgmt(course, values, handleClose, setSubmitting) {
  const ref = collection(db, "courses", course.id, "assignments");
  const tidiedValues = {
    hasDateDue: false,
    hasDateOpen: false,
    dateCreated: serverTimestamp(),
    type: "manual entry",
    ...values,
  };
  setSubmitting(true);
  addDoc(ref, tidiedValues)
    .then(() => setTimeout(() => handleClose(), 600))
    .catch((err) => console.log(err))
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function addTags(
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

export function addUserQn(
  values,
  refParams,
  setSubmitting,
  setSelQuestion,
  handleClose
) {
  const { userID, qSetID } = refParams;
  const ref = doc(db, "users", userID, "question-sets", qSetID);

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

export function addLibraryQn(values, libraryID, handleClose, setSubmitting) {
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

function addResourceToClonedCourse(courseID, values) {
  const ref = doc(db, "courses", courseID, "resources", values.id);
  setDoc(ref, { ...values, dateCloned: serverTimestamp() });
}

function addAssignmentToClonedCourse(courseID, values) {
  const ref = doc(db, "courses", courseID, "assignments", values.id);
  setDoc(ref, { ...values, dateCloned: serverTimestamp() });
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
  addDoc(ref, { ...values, dateCreated: serverTimestamp() })
    .then(() => setTimeout(() => handleClose(), 500))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 300));
}

export function autoSaveUserQn(values, questionID, qSet, user, setSelQuestion) {
  const ref = doc(db, "users", user.uid, "question-sets", qSet.id);
  const updatedQuestions = qSet.questions.map((question) =>
    question.id === questionID ? values : question
  );

  updateDoc(ref, {
    questions: updatedQuestions,
  }).then(() => setSelQuestion(values));
}

export function autoAddLibraryQn(
  values,
  libID,
  libQID,
  setEdit,
  setSelQuestion
) {
  const ref = doc(db, "libraries", libID, "questions", libQID);

  const tidiedValues = {
    dateCreated: serverTimestamp(),
    ...values,
  };

  setDoc(ref, tidiedValues).then(() => {
    setSelQuestion({ ...tidiedValues, id: libQID });
    setEdit(true);
  });
}

export function autoSaveLibraryQn(values, libID, libQID, setSelQuestion) {
  const ref = doc(db, "libraries", libID, "questions", libQID);
  updateDoc(ref, values).then(() => setSelQuestion(values));
}

export function autoAddUserQn(
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

function buildQuery(ref, library, searchTerm, countPerPage) {
  if (!searchTerm) {
    const q = query(ref, orderBy(library.orderBy, "desc"), limit(countPerPage));
    return q;
  }

  if (searchTerm) {
    const q = query(
      ref,
      where("tags_searchable", "array-contains", searchTerm),
      orderBy(library.orderBy, "desc")
    );
    return q;
  }
}

function buildQueryAfter(ref, library, searchTerm, countPerPage, lastDoc) {
  if (!searchTerm) {
    const q = query(
      ref,
      orderBy(library.orderBy, "desc"),
      startAfter(lastDoc),
      limit(countPerPage)
    );
    return q;
  }

  if (searchTerm) {
    const q = query(
      ref,
      where("tags_searchable", "array-contains", searchTerm),
      orderBy(library.orderBy, "desc"),
      startAfter(lastDoc),
      limit(countPerPage)
    );
    return q;
  }
}

function buildQueryBefore(ref, library, searchTerm, firstDoc) {
  if (!searchTerm) {
    const q = query(ref, orderBy(library.orderBy, "desc"), endBefore(firstDoc));
    return q;
  }

  if (searchTerm) {
    const q = query(
      ref,
      where("tags_searchable", "array-contains", searchTerm),
      orderBy(library.orderBy, "desc"),
      endBefore(firstDoc)
    );
    return q;
  }
}

export function cloneCourse(
  values,
  resources,
  assignments,
  setSubmitting,
  setSuccess
) {
  const ref = collection(db, "courses");

  setSubmitting(true);
  addDoc(ref, {
    ...values,
    dateCreated: serverTimestamp(),
    dateCloned: serverTimestamp(),
  })
    .then((newCourse) => {
      setTimeout(() => {
        resources.forEach((resource) =>
          addResourceToClonedCourse(newCourse.id, resource)
        );
      }, 100);
      setTimeout(() => {
        assignments.forEach((assignment) =>
          addAssignmentToClonedCourse(newCourse.id, assignment)
        );
      }, 500);
      setTimeout(() => {
        setSuccess(true);
      }, 2200);
    })
    .finally(() =>
      setTimeout(() => {
        setSubmitting(false);
      }, 2000)
    );
}

export function copyLibrayQnToUser(
  questions,
  refParams,
  setSubmitting,
  handleSuccess
) {
  const { userID, qSetID } = refParams;
  const ref = doc(db, "users", userID, "question-sets", qSetID);

  setSubmitting(true);
  updateDoc(ref, {
    questions: questions,
  })
    .then(() => {
      setTimeout(() => handleSuccess(), 600);
    })
    .finally(() => setTimeout(() => setSubmitting(false), 400));
}

export function countLibraryQuestions(libraryID) {
  const ref = collection(db, "libraries", libraryID, "questions");
  const ref2 = doc(db, "libraries", libraryID);
  const q = query(ref);

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
    }));
    console.log(fetchedItems);
    updateDoc(ref2, { questionCount: fetchedItems.length });
  });
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

export function deleteLibraryQuestion(question, libraryID, setTotalCount) {
  const ref = doc(db, "libraries", libraryID, "questions", question.id);
  deleteDoc(ref).then(() => setTotalCount((prev) => prev - 1));
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

export function deleteUserSubmissionHistory(docRefParams) {
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

  deleteDoc(ref);
}

export function deleteUserGrade(docRefParams) {
  const { asgmtID, userID, courseID } = docRefParams;

  const ref = doc(db, "courses", courseID, "grades", userID);

  updateDoc(ref, {
    [asgmtID]: deleteField(),
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

export function fetchAssignments(courseID, setAssignments, setLoading, option) {
  const ref = collection(db, "courses", courseID, "assignments");
  const q =
    option === "gradebook"
      ? query(ref)
      : query(ref, where("type", "!=", "manual entry"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated?.toDate(),
      dateDue: doc.data().dateDue?.toDate(),
      dateOpen: doc.data().dateOpen?.toDate(),
    }));
    setAssignments(sortByTitle(fetchedItems));
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
  const q = query(colRef, orderBy("sortIndex", "asc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLibraries(fetchedItems);
  });
  return unsubscribe;
}

export function fetchLibrariesAsEditor(user, setLibraries) {
  const colRef = collection(db, "libraries");
  const q = query(colRef, where("editorIDs", "array-contains", user.uid));
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

export function fetchLibraryQuestions(
  library,
  searchTerm,
  countPerPage,
  isEditor,
  setQuestions,
  setLastDoc,
  setTotalCount,
  setPage,
  setFetching
) {
  const ref = collection(db, "libraries", library?.id, "questions");

  const q = buildQuery(ref, library, searchTerm, countPerPage);

  setFetching(true);

  console.log("...fetching library questions");

  if (!isEditor) {
    getDocs(q).then((snapshot) => {
      const fetchedDocs = snapshot.docs.slice(0, countPerPage);
      const fetchedItems = fetchedDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (searchTerm) {
        setTotalCount(snapshot.docs.length);
      }

      setPage(1);
      setTimeout(() => {
        setQuestions(fetchedItems);
        setLastDoc(fetchedDocs?.at(-1));
        setFetching(false);
      }, 300);
    });
    return;
  }

  if (isEditor) {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDocs = snapshot.docs.slice(0, countPerPage);
      const fetchedItems = fetchedDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (searchTerm) {
        setTotalCount(snapshot.docs.length);
      }

      setPage(1);
      setTimeout(() => {
        setQuestions(fetchedItems);
        setLastDoc(fetchedDocs?.at(-1));
        setFetching(false);
      }, 300);
    });
    return unsubscribe;
  }
}

export function fetchLibraryQnsAfter(
  library,
  searchTerm,
  countPerPage,
  lastDoc,
  isEditor,
  setQuestions,
  setFirstDoc,
  setLastDoc,
  setPage,
  setFetching
) {
  const ref = collection(db, "libraries", library?.id, "questions");
  const q = buildQueryAfter(ref, library, searchTerm, countPerPage, lastDoc);

  setFetching(true);

  if (!isEditor) {
    getDocs(q).then((snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPage((prev) => prev + 1);
      setTimeout(() => {
        setQuestions(fetchedItems);
        setFirstDoc(snapshot.docs?.at(0));
        setLastDoc(snapshot.docs?.at(-1));
        setFetching(false);
      }, 300);
    });
    return;
  }

  if (isEditor) {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPage((prev) => prev + 1);
      setTimeout(() => {
        setQuestions(fetchedItems);
        setFirstDoc(snapshot.docs?.at(0));
        setLastDoc(snapshot.docs?.at(-1));
        setFetching(false);
      }, 300);
    });
    return unsubscribe;
  }
}

export function fetchLibraryQnsBefore(
  library,
  searchTerm,
  countPerPage,
  firstDoc,
  isEditor,
  setQuestions,
  setFirstDoc,
  setLastDoc,
  setPage,
  setFetching
) {
  const ref = collection(db, "libraries", library?.id, "questions");
  const q = buildQueryBefore(ref, library, searchTerm, firstDoc);

  setFetching(true);

  if (!isEditor) {
    getDocs(q).then((snapshot) => {
      const fetchedDocs = snapshot.docs.slice(-countPerPage);
      const fetchedItems = fetchedDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPage((prev) => prev - 1);
      setTimeout(() => {
        setQuestions(fetchedItems);
        setFirstDoc(fetchedDocs?.at(0));
        setLastDoc(fetchedDocs?.at(-1));
        setFetching(false);
      }, 300);
    });
    return;
  }

  if (isEditor) {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDocs = snapshot.docs.slice(-countPerPage);
      const fetchedItems = fetchedDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPage((prev) => prev - 1);
      setTimeout(() => {
        setQuestions(fetchedItems);
        setFirstDoc(fetchedDocs?.at(0));
        setLastDoc(fetchedDocs?.at(-1));
        setFetching(false);
      }, 300);
    });
    return unsubscribe;
  }
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

export function fetchResources(courseID, setResources, setLoading) {
  const ref = collection(db, "courses", courseID, "resources");
  const q = query(ref);
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateCreated: doc.data().dateCreated.toDate(),
    }));
    setResources(sortByTitle(fetchedItems));
    setLoading(false);
  });
  return unsubscribe;
}

export function fetchStudents(courseID, setStudents, setLoading) {
  const ref = collection(db, "courses", courseID, "students");
  const q = query(ref, orderBy("firstName", "asc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dateJoined: doc.data().dateJoined.toDate(),
    }));
    setStudents(fetchedItems);
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
    setLinks(sortByTitle(fetchedItems));
    setLoading(false);
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
  const q = query(ref);

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
    setQSets(sortByTitle(fetchedItems));
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

export function getAssignmentsForCloning(course, setAssignments) {
  const ref = collection(db, "courses", course?.id, "assignments");
  const q = query(ref);

  const fetchedItems = [];
  getDocs(q).then((snapshot) => {
    snapshot.docs.forEach((doc) =>
      fetchedItems.push({
        id: doc.id,
        cloned: true,
        dateCloned: new Date(),
        clonedFrom: {
          id: course?.id,
          title: course?.title,
        },
        ...doc.data(),
      })
    );
    setAssignments(fetchedItems);
  });
}

export function getDocument(userID, documentID, setDocument, setLoading) {
  const ref = doc(db, "users", userID, "documents", documentID);
  getDoc(ref).then((doc) => {
    setDocument({ id: doc.id, ...doc.data() });
    setLoading(false);
  });
}

export function getChemElemList(setElemList, setLoading) {
  const ref = doc(db, "lists", "chemical_elements");
  getDoc(ref).then((doc) => {
    console.log(doc);
    setElemList([...doc.data().elements]);
    setLoading(false);
  });
}

export function getImage(userID, imageID, setImage, setLoading) {
  const ref = doc(db, "users", userID, "images", imageID);
  getDoc(ref).then((doc) => {
    setImage({ id: doc.id, ...doc.data() });
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

export async function getNewestQSet(userID) {
  const ref = collection(db, "users", userID, "question-sets");
  const q = query(ref, orderBy("dateCreated", "desc"), limit(1));
  const snapshot = await getDocs(q);
  const fetchedItems = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return fetchedItems[0];
}

export function getQSet(userID, qSetID, setQSet, setLoading) {
  const ref = doc(db, "users", userID, "question-sets", qSetID);
  getDoc(ref).then((doc) => {
    setQSet({ id: doc.id, ...doc.data() });
    setLoading(false);
  });
}

export function getQSetSubmissionHistory(
  courseID,
  asgmtID,
  userID,
  setSubmissionHistory
) {
  const ref = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    userID
  );

  getDoc(ref).then((doc) => {
    setSubmissionHistory({ id: doc.id, ...doc.data() });
  });
}

export function getResource(courseID, resourceID, setResource) {
  const ref = doc(db, "courses", courseID, "resources", resourceID);
  getDoc(ref).then((doc) => setResource({ id: doc.id, ...doc.data() }));
}

export function getResourcesForCloning(course, setResources) {
  const ref = collection(db, "courses", course?.id, "resources");
  const q = query(ref);

  const fetchedItems = [];
  getDocs(q).then((snapshot) => {
    snapshot.docs.forEach((doc) =>
      fetchedItems.push({
        id: doc.id,
        cloned: true,
        dateCloned: new Date(),
        clonedFrom: {
          id: course?.id,
          title: course?.title,
        },
        ...doc.data(),
      })
    );
    setResources(fetchedItems);
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
  const q = query(ref, orderBy("title", "asc"));

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
      ...doc.data(),
      totalPointsPossible: calcTotalPossiblePoints(doc.data()),
    }));
    setQSets(fetchedItems);
    setSelItem(fetchedItems[0]);
  });
}

export function deleteQSetSubmissionHistory(courseID, asgmtID, userID) {
  const ref1 = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    userID
  );

  const ref2 = doc(db, "courses", courseID, "grades", userID);

  deleteDoc(ref1).catch((err) => console.log(err));

  updateDoc(ref2, {
    [asgmtID]: deleteField(),
  }).catch((err) => console.log(err));
}

export function updateAdaptivePoints(docRefParams, points) {
  const { courseID, asgmtID, userID } = docRefParams;

  const ref1 = doc(
    db,
    "courses",
    courseID,
    "assignments",
    asgmtID,
    "submissions",
    userID
  );

  const ref2 = doc(db, "courses", courseID, "grades", userID);

  updateDoc(ref1, {
    totalPointsAwarded: points,
  });

  setTimeout(
    () =>
      updateDoc(ref2, {
        [asgmtID]: {
          totalPointsAwarded: points,
          totalPointsPossible: points,
          type: "question set",
        },
      }),
    1000
  );
}

export function saveManualGrade(
  docRefParams,
  values,
  handleClose,
  setSubmitting
) {
  const { asgmtID, userID, courseID } = docRefParams;

  const ref = doc(db, "courses", courseID, "grades", userID);
  setSubmitting(true);
  updateDoc(ref, {
    [asgmtID]: {
      totalPointsAwarded: Number(values.totalPointsAwarded),
      totalPointsPossible: Number(values.totalPointsPossible),
      type: values.type,
    },
  })
    .then(() => setTimeout(() => handleClose(), 600))
    .finally(() => setTimeout(() => setSubmitting(false), 300));
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

export function saveLibraryQn(values, libID, handleClose, setSubmitting) {
  const ref = doc(db, "libraries", libID, "questions", values.id);

  setSubmitting(true);
  updateDoc(ref, values)
    .then(() => setTimeout(() => handleClose(), 800))
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function saveUserQn(
  values,
  selQuestion,
  qSet,
  refParams,
  setSubmitting,
  setSelQuestion,
  handleClose
) {
  const { userID, qSetID } = refParams;
  const ref = doc(db, "users", userID, "question-sets", qSetID);

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

export function updateAsgmtLabels(
  course,
  selAsgmt,
  labels,
  handleClose,
  setSubmitting
) {
  const ref = doc(db, "courses", course.id, "assignments", selAsgmt.id);
  const values = { labels: labels };

  setSubmitting(true);
  updateDoc(ref, values)
    .then(() => setTimeout(() => handleClose(), 800))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 500));
}

export function updateSearchSuggestions(
  suggestions,
  libID,
  setSubmitting,
  handleClose
) {
  setSubmitting(true);

  const docRef = doc(db, "libraries", libID);
  updateDoc(docRef, { searchSuggestions: suggestions })
    .then(() => setTimeout(() => handleClose(), 500))
    .catch((error) => console.log(error))
    .finally(() => setTimeout(() => setSubmitting(false), 300));
}

export function updateTags(tags, libraryID, questionID) {
  const docRef = doc(db, "libraries", libraryID, "questions", questionID);
  const tagsSearchable = searchifyTags(tags);
  updateDoc(docRef, { tags: tags, tags_searchable: tagsSearchable });
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

// export function updateAdaptiveFullPoints(docRefParams, adaptiveParams) {
//   const { courseID, userID, asgmtID } = docRefParams;
//   if (!courseID) return;
//   if (!userID) return;
//   const ref = doc(db, "courses", courseID, "grades", userID);
//   const totalPointsPossible = adaptiveParams?.totalPointsPossible;

//   updateDoc(ref, {
//     [asgmtID]: {
//       totalPointsAwarded: totalPointsPossible,
//       totalPointsPossible: totalPointsPossible,
//       type: "question set",
//     },
//   });
// }
