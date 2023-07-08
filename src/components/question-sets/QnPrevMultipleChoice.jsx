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
} from "./QnPrevSharedCpnts";
import {
  Alert,
  Box,
  CardContent,
  Checkbox,
  Divider,
  Link,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import { gradeResponse } from "../../utils/grading";
import { VertDivider } from "../common/Dividers";
import parse from "html-react-parser";
import { getSubmissions } from "../../utils/questionSetUtils";
// import styles from "@/styles/QuestionSet.module.css";

export default function MultipleChoicePreview({
  mode,
  qSet,
  question,
  userCred,
}) {
  const answerChoices = question?.answerChoices || [];
  const numCorrect = answerChoices.filter((el) => el.isCorrect).length || 0;
  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || [];
  const attemptsExhausted = submissions?.length >= question?.attemptsPossible;
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
      userCred,
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

  function handleCurrentResponse(ind) {
    if (numCorrect === 1) {
      const updated = [ind];
      setCurrentResponse(updated);
    }

    if (numCorrect > 1) {
      const updated = currentResponse.includes(ind)
        ? currentResponse.filter((el) => el !== ind)
        : [...currentResponse, ind];
      setCurrentResponse(updated.sort());
    }
  }

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, qSet, userCred);
    setCurrentResponse([]);
  }

  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

  useEffect(
    () => setCurrentResponse(lastResponse),
    //eslint-disable-next-line
    [question.id]
  );

  if (mode === "build") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 2 }} />
        {numCorrect === 0 && (
          <Alert severity="warning">no correct answer selected</Alert>
        )}
        <div className="answer-choice-area">
          {answerChoices.map((el, ind) => (
            <Box className="answer-choice-row" key={`choice-${ind}`}>
              {numCorrect <= 1 && <Radio checked={el.isCorrect} disabled />}
              {numCorrect > 1 && <Checkbox checked={el.isCorrect} disabled />}
              <Typography>{parse(el.text)}</Typography>
            </Box>
          ))}
        </div>
      </CardContent>
    );
  }

  if (mode === "preview") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />
        <CorrectIndicator lastSubmission={lastSubmission} />
        {numCorrect === 0 && (
          <Alert severity="warning">no correct answer selected</Alert>
        )}
        <div className="answer-choice-area">
          {answerChoices.map((el, ind) => (
            <Box className="answer-choice-row" key={`choice-${ind}`}>
              {numCorrect <= 1 && (
                <Radio
                  checked={currentResponse.includes(ind) || false}
                  onChange={() => handleCurrentResponse(ind)}
                  disabled={attemptsExhausted}
                />
              )}
              {numCorrect > 1 && (
                <Checkbox
                  checked={currentResponse.includes(ind) || false}
                  onChange={() => handleCurrentResponse(ind)}
                  disabled={attemptsExhausted}
                />
              )}
              <Typography>{parse(el.text)}</Typography>
            </Box>
          ))}
        </div>

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
