import { useState, useEffect, useRef } from "react";
import { generateRandomCode } from "../../utils/commonUtils";
import {
  cleanEditorHTML,
  convertSpecialTags,
} from "../../utils/questionSetUtils";
import { Editor } from "../common/Editor";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Box, Button, Checkbox, IconButton, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";

export function MultipleChoice({
  autoSaveQuestion,
  edit,
  imagePath,
  saveQuestion,
  selQuestion,
  submitting,
}) {
  const add = !edit;
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

  function handleAutoSave() {
    const values = add
      ? {
          type: "multiple choice",
          prompt: cleanEditorHTML(promptRef.current),
          answerChoices: tidyAnswerChoices(),
          pointsPossible: 1,
          attemptsPossible: 5,
        }
      : {
          ...selQuestion,
          prompt: cleanEditorHTML(promptRef.current),
          answerChoices: tidyAnswerChoices(),
        };

    autoSaveQuestion(values);
  }

  function handleSave() {
    const values = add
      ? {
          type: "multiple choice",
          prompt: cleanEditorHTML(promptRef.current),
          answerChoices: tidyAnswerChoices(),
          pointsPossible: 1,
          attemptsPossible: 5,
        }
      : {
          ...selQuestion,
          prompt: cleanEditorHTML(promptRef.current),
          answerChoices: tidyAnswerChoices(),
        };

    saveQuestion(values);
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

  function addAnswerChoice() {
    const updatedAnswerChoices = [
      ...answerChoices,
      { id: generateRandomCode(4), text: "<div><br></div>", isCorrect: false },
    ];

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

      tidiedAnswerChoices.push({
        id: el.id,
        text: cleanEditorHTML(elem),
        isCorrect: el.isCorrect,
      });
    });
    return tidiedAnswerChoices;
  }

  useEffect(
    () => {
      if (!selQuestion) {
        promptRef.current.innerHTML = initVal.prompt;
        return;
      }

      promptRef.current.innerHTML = convertSpecialTags(initVal.prompt);

      answerChoices.forEach((el, ind) => {
        const elem = document.getElementById(el.id);
        elem.innerHTML = convertSpecialTags(initVal.answerChoices[ind].text);
      });
    },
    //eslint-disable-next-line
    [selQuestion?.id]
  );

  useEffect(
    () => {
      answerChoices.forEach((el) => {
        const elem = document.getElementById(el.id);

        if (elem.innerHTML === "") {
          elem.innerHTML = "<div><br></div>";
        }
      });
    },
    //eslint-disable-next-line
    [answerChoices.length]
  );

  return (
    <>
      <br />
      <br />
      <Editor
        editorRef={promptRef}
        id="prompt"
        imagePath={imagePath}
        label="prompt"
        onImageUploadSuccess={handleAutoSave}
        onImageDeleteSuccess={handleAutoSave}
        toolbarOptions={[
          "font style",
          "superscript/subscript",
          "list",
          "image",
          "equation",
          "TeX",
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
              imagePath={imagePath}
              handleAutoSave={handleAutoSave}
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
          onClick={handleSave}
        />
      </BtnContainer>
    </>
  );
}

function AnswerChoiceField({ id, imagePath, handleAutoSave }) {
  const editorRef = useRef();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Editor
        editorRef={editorRef}
        id={id}
        imagePath={imagePath}
        inlineTeXOnly
        label="answer choice"
        onImageUploadSuccess={handleAutoSave}
        onImageDeleteSuccess={handleAutoSave}
        toolbarOptions={["superscript/subscript", "image", "TeX"]}
      />
    </Box>
  );
}
