import { Button, Divider, Typography } from "@mui/material";
import { Page } from "../components/common/Pages";
import {
  deleteField,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  limit,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { generateRandomCode } from "../utils/commonUtils";
import { db } from "../config/firebaseConfig";
// import { fullParse } from "../utils/customParsers";
import { useState } from "react";

export default function MaintenencePage() {
  const [items, setItems] = useState([]);

  const library = {
    id: "txrSW60b6w44oYo9Rsdk",
  };

  function handleFetch() {
    getLibraryQuestions(library, setItems);
  }

  return (
    <Page>
      <Button onClick={handleFetch}>FETCH ITEMS</Button>
      <div style={{ padding: "15px" }}>
        <Typography>library id: {library.id}</Typography>
        <Typography>found {items.length} items</Typography>
      </div>

      <Divider />

      {items.map((item) => (
        <div key={item.id} style={{ padding: "15px" }}>
          <ItemDisplay item={item} library={library} />
          <Divider />
        </div>
      ))}
    </Page>
  );
}

function ItemDisplay({ item, library }) {
  if (!item?.id) {
    return null;
  }
  return (
    <>
      <Typography color="text.secondary">Question ID: {item?.id}</Typography>
      {/* <Typography color="text.secondary">type: {item?.type}</Typography> */}
      {/* <br /> */}
      <div style={{ maxWidth: "700px" }}>
        {JSON.stringify(item?.correctAnswer, null, 2)}
      </div>

      {/* <br /> */}

      {false && (
        <Button onClick={() => console.log("hello")} variant="contained">
          fix
        </Button>
      )}
      {/* <br /> */}
      {/* <br /> */}
    </>
  );
}

function getLibraryQuestions(library, setItems) {
  const ref = collection(db, "libraries", library.id, "questions");

  const q = query(ref, where("type", "==", "multipart"), limit(500));

  getDocs(q).then((snapshot) => {
    const fetchedItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setItems(fetchedItems);
  });
}

function updateFreeResponse(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);

  updateDoc(ref, {
    attemptsAllowed: deleteField(),
    scoringMethod: deleteField(),
    // correctAnswer: deleteField(),
    // created: deleteField(),
    // auxillaryFiles: deleteField(),
    // lastEdited: deleteField(),
  }).then(() => console.log(`succesfuly updated ${question?.id}`));

  // updateDoc(ref, {
  //   dateEdited: serverTimestamp(),
  //   pointsPossible: 1,
  //   possiblePoints: deleteField(),
  //   exampleResponse: question?.correctAnswer?.example
  //     ? `<div>${question?.correctAnswer?.example}</div>`
  //     : "<div><br></div>",
  // }).then(() => console.log(`succesfuly updated ${question?.id}`));
}

function updateMultipleChoice(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);
  const updatedAnswerChoices = [];
  question.answerChoices.forEach((choice) =>
    updatedAnswerChoices.push({
      id: generateRandomCode(4),
      text: `<div>${choice.answerChoice}</div>`,
      isCorrect: choice?.isCorrect || false,
    })
  );

  updateDoc(ref, {
    answerChoices: updatedAnswerChoices,
    attemptsPossible: 5,
    attemptsAllowed: deleteField(),
    auxillaryFiles: deleteField(),
    created: deleteField(),
    // dateCreated: question.created,
    dateEdited: serverTimestamp(),
    pointsPossible: 1,
    possiblePoints: deleteField(),
    lastEdited: deleteField(),
    scoringMethod: deleteField(),
  }).then(() => console.log(`succesfuly updated ${question?.id}`));

  //pointsPossible
}

function updateShortAnswerText(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);
  const values = {
    attemptsPossible: 5,
    correctAnswer: {
      text: question.correctAnswer.text,
    },
    scoring: {
      acceptAltCap: true,
      acceptAltSpacing: true,
    },
    dateCreated: question.created,
    pointsPossible: 1,
  };

  // const values = {
  //   attemptsAllowed: deleteField(),
  //   auxillaryFiles: deleteField(),
  //   created: deleteField(),
  //   possiblePoints: deleteField(),
  //   dateEdited: serverTimestamp(),
  // };

  updateDoc(ref, values).then(() =>
    console.log(`succesfuly updated ${question?.id}`)
  );

  console.log(values);
}

function updateShortAnswerMeasurement(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);
  const values = {
    attemptsPossible: 5,
    correctAnswer: {
      number: question.correctAnswer.number,
      unit: question.correctAnswer.unit,
    },
    scoring: {
      percentTolerance: "2",
    },
    // dateCreated: question.created,
    pointsPossible: 1,
  };

  // const values = {
  //   attemptsAllowed: deleteField(),
  //   auxillaryFiles: deleteField(),
  //   created: deleteField(),
  //   possiblePoints: deleteField(),
  //   dateEdited: serverTimestamp(),
  //   scoringMethod: deleteField(),
  // };

  updateDoc(ref, values).then(() =>
    console.log(`succesfuly updated ${question?.id}`)
  );

  console.log(values);
}

function updateShortAnswerNumber(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);
  // const values = {
  //   attemptsPossible: 5,
  //   correctAnswer: {
  //     number: question.correctAnswer.number,
  //   },
  //   scoring: {
  //     percentTolerance: "2",
  //   },
  //   // dateCreated: question.created,
  //   pointsPossible: 1,
  // };

  const values = {
    attemptsAllowed: deleteField(),
    auxillaryFiles: deleteField(),
    created: deleteField(),
    possiblePoints: deleteField(),
    dateEdited: serverTimestamp(),
    lastEdited: deleteField(),
    scoringMethod: deleteField(),
  };

  updateDoc(ref, values).then(() =>
    console.log(`succesfuly updated ${question?.id}`)
  );

  console.log(values);
}

function updateChapterProblemNumber(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);
  // const values = {
  //   attemptsPossible: 5,
  //   correctAnswer: {
  //     number: question.correctAnswer.number,
  //   },
  //   scoring: {
  //     percentTolerance: "2",
  //   },
  //   // dateCreated: question.created,
  //   pointsPossible: 1,
  // };

  const values = {
    chapterThenProblemNumber: deleteField(),
    correctWordOrPhrase: deleteField(),
    correctNumber: deleteField(),
    correctUnit: deleteField(),
  };

  updateDoc(ref, values).then(() =>
    console.log(`succesfuly updated ${question?.id}`)
  );

  console.log(values);
}

function deleteQuestion(library, question) {
  const ref = doc(db, "libraries", library?.id, "questions", question.id);
  deleteDoc(ref).then(() => console.log(`succesfully deleted ${question.id}`));
}
