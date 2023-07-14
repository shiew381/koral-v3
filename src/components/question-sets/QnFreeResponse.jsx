import { useState, useEffect, useRef } from "react";
import parse from "html-react-parser";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import {
  saveFreeResponse,
  saveFreeResponseFromCourse,
  // saveQResponseFromCourse,
  // saveQuestionResponse,
} from "../../utils/firestoreClient";
import { PromptPreview } from "./QSetSharedCpnts";
import {
  Box,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Editor } from "../common/Editor";
import { formatDate, formatTime } from "../../utils/dateUtils.js";

export default function FreeResponse({
  docRefParams,
  mode,
  qSet,
  question,
  submissions,
  user,
}) {
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || [];
  const lastSaved = lastSubmission
    ? formatDate(lastSubmission.dateSubmitted?.toDate()) +
      " at " +
      formatTime(lastSubmission.dateSubmitted?.toDate())
    : null;

  const [submitting, setSubmitting] = useState(false);

  const responseRef = useRef();

  function handleSubmit() {
    responseRef.current.normalize();
    const currentResponse = responseRef.current.innerHTML;

    if (mode === "course") {
      saveFreeResponseFromCourse(
        docRefParams,
        question,
        currentResponse,
        setSubmitting
      );
    }

    if (mode === "test") {
      saveFreeResponse(docRefParams, question, currentResponse, setSubmitting);
    }
  }

  function detectChange() {
    return true;
  }

  function handleClearSubmissions() {
    responseRef.current.innerHTML =
      "<div><br></div><div><br></div><div><br></div>";
  }

  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

  useEffect(
    () => {
      if (mode === "preview") {
        return;
      }

      if (!responseRef.current) {
        return;
      }

      if (submissions?.length > 0) {
        responseRef.current.innerHTML = lastResponse;
      }
      if (submissions?.length === 0) {
        responseRef.current.innerHTML =
          "<div><br></div><div><br></div><div><br></div>";
      }
    },
    //eslint-disable-next-line
    [question.id, mode]
  );

  if (mode === "preview") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 2 }} />
        <Box sx={{ p: 5 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            example response
          </Typography>
          <Box className="example-free-response">
            {parse(question.exampleResponse)}
          </Box>
        </Box>
      </CardContent>
    );
  }

  if (mode === "test" || mode === "course") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />

        <div className="flex flex-col flex-grow">
          <br />
          <Editor
            editorRef={responseRef}
            id="free-response"
            label="response"
            // handleAutoSave={handleAutoSave}
            // handleAutoAdd={handleAutoAdd}
            qSet={qSet}
            selQuestion={question}
            toolbarOptions={[
              "font style",
              "superscript/subscript",
              "list",
              "equation",
              "image",
            ]}
            user={user}
          />
          <BtnContainer right>
            <Link
              color="text.secondary"
              underline="hover"
              sx={{ cursor: "pointer", p: 1 }}
              onClick={handleClearSubmissions}
            >
              clear
            </Link>
          </BtnContainer>
        </div>
        <BtnContainer right>
          <Stack>
            {lastSaved && (
              <Box sx={{ mb: 1 }}>
                <Typography>saved {lastSaved} </Typography>
              </Box>
            )}
            {responseChanged && (
              <SubmitBtn
                label="SAVE"
                onClick={handleSubmit}
                submitting={submitting}
                disabled={disabled}
              />
            )}
          </Stack>
        </BtnContainer>
      </CardContent>
    );
  }
}
