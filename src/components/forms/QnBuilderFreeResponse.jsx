import { useEffect, useRef } from "react";
import { autoAddQueston, autoSaveQuestion } from "../../utils/firestoreClient";
import { cleanEditorHTML } from "../../utils/questionSetUtils";
import { Editor } from "../common/Editor";
import { BtnContainer, SubmitBtn } from "../common/Buttons";

import { Box, Divider } from "@mui/material";
import { generateRandomCode } from "../../utils/commonUtils";

export function FreeResponse({
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
        exampleResponse: selQuestion?.exampleResponse || "<div><br></div>",
      }
    : {
        prompt: "<div><br></div><div><br></div><div><br></div>",
        exampleResponse: "<div><br></div><div><br></div><div><br></div>",
      };
  const promptRef = useRef();
  const exampleResponseRef = useRef();

  function handleAutoAdd() {
    const values = {
      type: "free response",
      prompt: cleanEditorHTML(promptRef.current),
      exampleResponse: cleanEditorHTML(exampleResponseRef.current),
      pointsPossible: 1,
    };
    console.log("auto adding...");
    autoAddQueston(values, questionID, qSet, user, setEdit, setSelQuestion);
  }

  function handleAutoSave() {
    const values = {
      ...selQuestion,
      prompt: cleanEditorHTML(promptRef.current),
    };
    console.log("auto saving...");
    autoSaveQuestion(values, questionID, qSet, user, setSelQuestion);
  }

  function handleSubmit() {
    if (add) {
      const values = {
        type: "free response",
        prompt: cleanEditorHTML(promptRef.current),
        exampleResponse: cleanEditorHTML(exampleResponseRef.current),
        pointsPossible: 1,
      };
      handleAddQuestion(values);
      return;
    }

    if (edit) {
      const values = {
        ...selQuestion,
        prompt: cleanEditorHTML(promptRef.current),
      };
      handleUpdateQuestion(values);
      return;
    }
  }

  useEffect(
    () => {
      promptRef.current.innerHTML = initVal.prompt;
      exampleResponseRef.current.innerHTML = initVal.exampleResponse;
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
        imagePath={`users/${user?.uid}/question-sets/${qSet?.id}/${questionID}}`}
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
      <Divider sx={{ my: 3 }} />
      <Box sx={{ p: 3 }}>
        <Editor
          editorRef={exampleResponseRef}
          id="response"
          imagePath={`users/${user?.uid}/question-sets/${qSet?.id}/${questionID}}`}
          label="example response"
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
      </Box>
      <br />
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
