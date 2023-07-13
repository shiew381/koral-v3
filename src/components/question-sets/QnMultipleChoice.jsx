import { useState, useEffect } from "react";
import parse from "html-react-parser";
import {
  deleteQuestionSubmissions,
  saveQResponseFromCourse,
  saveQuestionResponse,
} from "../../utils/firestoreClient";
import { gradeResponse } from "../../utils/grading";
import {
  AttemptCounter,
  PromptPreview,
  CorrectIndicator,
} from "./QSetSharedCpnts";
import {
  Alert,
  Box,
  CardContent,
  Checkbox,
  Divider,
  Link,
  Radio,
  Stack,
} from "@mui/material";
import { VertDivider } from "../common/Dividers";
import { BtnContainer, SubmitBtn } from "../common/Buttons";

export default function MultipleChoice({
  docRefParams,
  mode,
  question,
  submissions,
}) {
  const answerChoices = question?.answerChoices || [];
  const numCorrect = answerChoices.filter((el) => el.isCorrect).length || 0;
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || [];
  const attemptsExhausted = submissions?.length >= question?.attemptsPossible;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  const [currentResponse, setCurrentResponse] = useState(lastResponse);
  const [submitting, setSubmitting] = useState(false);

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

  function handleSubmit() {
    const grade = gradeResponse(question, currentResponse);

    if (mode === "course") {
      saveQResponseFromCourse(
        submissions,
        docRefParams,
        question,
        currentResponse,
        grade,
        setSubmitting
      );
    }

    if (mode === "test") {
      saveQuestionResponse(
        submissions,
        docRefParams,
        question,
        currentResponse,
        grade,
        setSubmitting
      );
    }
  }

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, docRefParams);
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
        {numCorrect === 0 && (
          <Alert severity="warning">no correct answer selected</Alert>
        )}
        <div className="answer-choice-area">
          {answerChoices.map((el, ind) => (
            <Box className="answer-choice-row" key={`choice-${ind}`}>
              {numCorrect <= 1 && <Radio checked={el.isCorrect} disabled />}
              {numCorrect > 1 && <Checkbox checked={el.isCorrect} disabled />}
              {parse(el.text)}
            </Box>
          ))}
        </div>
      </CardContent>
    );
  }

  if (mode === "test" || mode === "course") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />
        <CorrectIndicator
          lastSubmission={lastSubmission}
          submitting={submitting}
        />
        {numCorrect === 0 && (
          <Alert severity="warning">no correct answer selected</Alert>
        )}
        <div className="answer-choice-area">
          {answerChoices.map((el, ind) => (
            <Box className="answer-choice-row" key={`choice-${ind}`}>
              {numCorrect === 1 && (
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
              {parse(el.text)}
            </Box>
          ))}
        </div>

        <BtnContainer right>
          <Stack>
            <Box sx={{ mb: 1 }}>
              <AttemptCounter question={question} submissions={submissions} />
              {mode === "test" && <VertDivider color="text.secondary" show />}
              {mode == "test" && (
                <Link
                  color="text.secondary"
                  underline="hover"
                  sx={{ cursor: "pointer" }}
                  onClick={handleClearSubmissions}
                >
                  clear
                </Link>
              )}
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
