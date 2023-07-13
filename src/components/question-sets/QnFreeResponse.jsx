import { useState, useEffect } from "react";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import {
  deleteQuestionSubmissions,
  saveQuestionResponse,
} from "../../utils/firestoreClient";
import {
  AttemptCounter,
  PromptPreview,
  CorrectIndicator,
  ExampleResponsePreview,
} from "./QSetSharedCpnts";
import { Box, CardContent, Divider, Link, Stack } from "@mui/material";
import { gradeResponse } from "../../utils/grading";
import { VertDivider } from "../common/Dividers";
import { getSubmissions } from "../../utils/questionSetUtils";
// import styles from "@/styles/QuestionSet.module.css";

export default function FreeResponse({ mode, qSet, question, user }) {
  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || [];
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  const [currentResponse, setCurrentResponse] = useState(lastResponse);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    const grade = gradeResponse(question, currentResponse);

    saveQuestionResponse(
      currentResponse,
      grade,
      submissions,
      question,
      qSet,
      user,
      setSubmitting
    );
  }

  function detectChange() {
    if (currentResponse.length > 0 && !lastSubmission) {
      return true;
    }

    if (
      currentResponse.length > 0 &&
      currentResponse.length !== lastResponse.length
    ) {
      return true;
    }

    if (currentResponse.some((el) => !lastResponse.includes(el))) {
      return true;
    }

    return false;
  }

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, qSet, user);
    setCurrentResponse([]);
  }

  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

  useEffect(
    () => setCurrentResponse(lastResponse),
    //eslint-disable-next-line
    [question.id]
  );

  if (mode === "preview") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 2 }} />
        <ExampleResponsePreview question={question} />
      </CardContent>
    );
  }

  if (mode === "test") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />
        <CorrectIndicator lastSubmission={lastSubmission} />

        <BtnContainer right>
          <Stack>
            <Box sx={{ mb: 1 }}>
              <AttemptCounter question={question} submissions={submissions} />
              <VertDivider color="text.secondary" />
              <Link
                color="text.secondary"
                underline="hover"
                sx={{ cursor: "pointer" }}
                onClick={handleClearSubmissions}
              >
                clear
              </Link>
            </Box>

            {!answeredCorrectly && (
              <SubmitBtn
                label="SUBMIT"
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
