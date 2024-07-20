import { useEffect, useRef } from "react";
import {
  cleanEditorHTML,
  convertSpecialTags,
} from "../../utils/questionSetUtils";
import { Editor } from "../common/Editor";
import { Box, Divider } from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";

export function FreeResponse({
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
        exampleResponse: selQuestion?.exampleResponse || "<div><br></div>",
      }
    : {
        prompt: "<div><br></div><div><br></div><div><br></div>",
        exampleResponse: "<div><br></div><div><br></div><div><br></div>",
      };
  const promptRef = useRef();
  const exampleResponseRef = useRef();

  function handleAutoSave() {
    const values = add
      ? {
          type: "free response",
          prompt: cleanEditorHTML(promptRef.current),
          exampleResponse: cleanEditorHTML(exampleResponseRef.current),
          pointsPossible: 1,
        }
      : {
          ...selQuestion,
          prompt: cleanEditorHTML(promptRef.current),
          exampleResponse: cleanEditorHTML(exampleResponseRef.current),
        };
    autoSaveQuestion(values);
  }

  function handleSave() {
    const values = add
      ? {
          type: "free response",
          prompt: cleanEditorHTML(promptRef.current),
          exampleResponse: cleanEditorHTML(exampleResponseRef.current),
          pointsPossible: 1,
        }
      : {
          ...selQuestion,
          prompt: cleanEditorHTML(promptRef.current),
          exampleResponse: cleanEditorHTML(exampleResponseRef.current),
        };

    saveQuestion(values);
  }

  useEffect(
    () => {
      if (!selQuestion) {
        promptRef.current.innerHTML = initVal.prompt;
        return;
      }

      promptRef.current.innerHTML = convertSpecialTags(initVal.prompt);
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
        imagePath={imagePath}
        label="prompt"
        onImageUploadSuccess={handleAutoSave}
        onImageDeleteSuccess={handleAutoSave}
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
          imagePath={imagePath}
          label="example response"
          onImageUploadSuccess={handleAutoSave}
          onImageDeleteSuccess={handleAutoSave}
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
          onClick={handleSave}
        />
      </BtnContainer>
    </>
  );
}
