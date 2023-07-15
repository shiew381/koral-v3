import { useState, useEffect, useRef } from "react";
import { autoAddQueston, autoSaveQuestion } from "../../utils/firestoreClient";
import { generateRandomCode } from "../../utils/commonUtils";
import { cleanEditorHTML } from "../../utils/questionSetUtils";
import { Editor } from "../common/Editor";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Box, Button, Checkbox, IconButton, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";

export function MultipleChoice({
  edit,
  handleAddQuestion,
  handleUpdateQuestion,
  qSet,
  selQuestion,
  setEdit,
  setSelQuestion,
  submitting,
  user,
}) {
  const add = !edit;
  const questionID = edit ? selQuestion?.id : generateRandomCode(8);
  const initVal = edit
    ? {
        prompt: selQuestion?.prompt || "<div><br></div>",
        answerChoices: selQuestion?.answerChoices || [],
      }
    : {
        prompt: "<div><br></div><div><br></div><div><br></div>",
        answerChoices: [
          {
            id: generateRandomCode(4),
            text: "<div><br></div>",
            isCorrect: false,
          },
          {
            id: generateRandomCode(4),
            text: "<div><br></div>",
            isCorrect: false,
          },
          {
            id: generateRandomCode(4),
            text: "<div><br></div>",
            isCorrect: false,
          },
          {
            id: generateRandomCode(4),
            text: "<div><br></div>",
            isCorrect: false,
          },
        ],
      };

  const promptRef = useRef();
  const [answerChoices, setAnswerChoices] = useState(initVal.answerChoices);

  function addAnswerChoice() {
    const updatedAnswerChoices = [
      ...answerChoices,
      { id: generateRandomCode(4), text: "", isCorrect: false },
    ];

    setAnswerChoices(updatedAnswerChoices);
  }

  function handleAutoAdd() {
    const values = {
      type: "multiple choice",
      prompt: cleanEditorHTML(promptRef.current),
      answerChoices: answerChoices,
      pointsPossible: 1,
      attemptsPossible: 1,
    };
    autoAddQueston(values, questionID, qSet, user, setEdit, setSelQuestion);
  }

  function handleAutoSave() {
    const values = {
      ...selQuestion,
      prompt: cleanEditorHTML(promptRef.current),
      answerChoices: answerChoices,
    };
    autoSaveQuestion(values, questionID, qSet, user, setSelQuestion);
  }

  function handleCheckbox(e, ind) {
    const updatedState = e.target.checked;
    const updatedAnswerChoice = {
      ...answerChoices[ind],
      isCorrect: updatedState,
    };
    const updatedAnswerChoices = answerChoices.map((el, index) =>
      ind === index ? updatedAnswerChoice : el
    );
    setAnswerChoices(updatedAnswerChoices);
  }

  function deleteAnswerChoice(ind) {
    const updatedAnswerChoices = answerChoices.filter(
      (el, index) => ind !== index
    );
    setAnswerChoices(updatedAnswerChoices);
  }

  function tidyAnswerChoices() {
    const tidiedAnswerChoices = [];

    answerChoices.forEach((el) => {
      const elem = document.getElementById(el.id);
      cleanEditorHTML(elem);
      tidiedAnswerChoices.push({
        id: el.id,
        text: elem?.innerHTML,
        isCorrect: el.isCorrect,
      });
    });
    return tidiedAnswerChoices;
  }

  function handleSubmit() {
    if (add) {
      const values = {
        type: "multiple choice",
        prompt: cleanEditorHTML(promptRef.current),
        answerChoices: tidyAnswerChoices(),
        pointsPossible: 1,
        attemptsPossible: 5,
      };
      handleAddQuestion(values);
      return;
    }

    if (edit) {
      const values = {
        ...selQuestion,
        prompt: cleanEditorHTML(promptRef.current),
        answerChoices: tidyAnswerChoices(),
      };
      handleUpdateQuestion(values);
      return;
    }
  }

  useEffect(
    () => {
      promptRef.current.innerHTML = initVal.prompt;
      answerChoices.forEach((el) => {
        const elem = document.getElementById(el.id);
        elem.innerHTML = el.text;
      });
    },
    //eslint-disable-next-line
    [selQuestion?.id]
  );

  return (
    <>
      <br />
      <br />
      <Editor
        editorRef={promptRef}
        id="prompt"
        imagePath={`users/${user?.uid}/question-sets/${qSet?.id}/${questionID}`}
        label="prompt"
        onImageUploadSuccess={edit ? handleAutoSave : handleAutoAdd}
        onImageDeleteSuccess={edit ? handleAutoSave : handleAutoAdd}
        toolbarOptions={[
          "font style",
          "superscript/subscript",
          "list",
          "equation",
          "image",
        ]}
      />
      <Box className="answer-choices-container">
        <Typography align="right" variant="subtitle2" sx={{ mr: 1 }}>
          correct
        </Typography>
        {answerChoices?.map((el, ind) => (
          <Box key={el.id} className="answer-choice-row">
            <Box sx={{ paddingTop: "60px" }}>
              <IconButton
                onClick={() => deleteAnswerChoice(ind)}
                sx={{ p: "5px" }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>

            <AnswerChoiceField
              id={el.id}
              handleAutoSave={handleAutoSave}
              handleAutoAdd={handleAutoAdd}
              qSet={qSet}
              selQuestion={selQuestion}
              user={user}
            />
            <Box sx={{ paddingTop: "60px" }}>
              <Checkbox
                sx={{ ml: 2, mr: 1, height: "40px" }}
                checked={answerChoices[ind].isCorrect}
                onChange={(e) => handleCheckbox(e, ind)}
              />
            </Box>
          </Box>
        ))}
        <Box className="add-answer-choice">
          <Button fullWidth onClick={addAnswerChoice} startIcon={<AddIcon />}>
            ADD ANSWER CHOICE
          </Button>
        </Box>
      </Box>
      <BtnContainer right>
        <SubmitBtn
          disabled={submitting}
          submitting={submitting}
          label="SAVE"
          onClick={handleSubmit}
        />
      </BtnContainer>
    </>
  );
}

function AnswerChoiceField({
  id,
  handleAutoSave,
  handleAutoAdd,
  qSet,
  selQuestion,
  user,
}) {
  const editorRef = useRef();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Editor
        editorRef={editorRef}
        id={id}
        label="answer choice"
        handleAutoSave={handleAutoSave}
        handleAutoAdd={handleAutoAdd}
        qSet={qSet}
        selQuestion={selQuestion}
        toolbarOptions={["subscript/superscript", "equation", "image"]}
        user={user}
      />
    </Box>
  );
}
