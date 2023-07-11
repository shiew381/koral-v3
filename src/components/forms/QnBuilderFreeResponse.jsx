import { useEffect, useRef } from "react";
import { autoAddQueston, autoSaveQuestion } from "../../utils/firestoreClient";
import { cleanEditorHTML } from "../../utils/questionSetUtils";
import { Editor } from "../common/Editor";
import { BtnContainer, SubmitBtn } from "../common/Buttons";

import { Box, Divider } from "@mui/material";

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
  const initVal = {
    prompt:
      selQuestion?.prompt || "<div><br></div><div><br></div><div><br></div>",
    exampleResponse:
      selQuestion?.exampleResponse ||
      "<div><br></div><div><br></div><div><br></div>",
  };
  const promptRef = useRef();
  const exampleResponseRef = useRef();

  function handleAutoAdd(newID) {
    const values = {
      type: "free response",
      prompt: cleanEditorHTML(promptRef.current),
      exampleResponse: cleanEditorHTML(exampleResponseRef.current),
      pointsPossible: 1,
    };
    autoAddQueston(values, newID, qSet, user, setEdit, setSelQuestion);
  }

  function handleAutoSave() {
    const values = {
      ...selQuestion,
      prompt: cleanEditorHTML(promptRef.current),
    };
    autoSaveQuestion(values, selQuestion, qSet, user, setSelQuestion);
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
        label="prompt"
        handleAutoSave={handleAutoSave}
        handleAutoAdd={handleAutoAdd}
        qSet={qSet}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
        toolbarOptions={[
          "font style",
          "superscript/subscript",
          "list",
          "equation",
          "image",
        ]}
        user={user}
      />
      <Divider sx={{ my: 3 }} />
      <Box sx={{ p: 3 }}>
        <Editor
          editorRef={exampleResponseRef}
          id="response"
          label="example response"
          handleAutoSave={handleAutoSave}
          handleAutoAdd={handleAutoAdd}
          qSet={qSet}
          selQuestion={selQuestion}
          setSelQuestion={setSelQuestion}
          toolbarOptions={[
            "font style",
            "superscript/subscript",
            "list",
            "equation",
            "image",
          ]}
          user={user}
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
