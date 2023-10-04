import { useState, useEffect } from "react";
import parse from "html-react-parser";
import {
  deleteQuestionSubmissions,
  saveQResponseFromCourse,
  saveQuestionResponse,
} from "../../utils/firestoreClient";
import { gradeResponse } from "../../utils/grading";
import { getPointsAwarded } from "../../utils/gradeUtils";
import {
  Alert,
  Box,
  Button,
  CardContent,
  Checkbox,
  Divider,
  Radio,
  Stack,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { VertDivider } from "../common/Dividers";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import {
  AttemptCounter,
  PromptPreview,
  CorrectIndicator,
  ClearSubmissions,
} from "./QSetSharedCpnts";

export default function MultipleChoice({
  adaptive,
  adaptiveParams,
  docRefParams,
  goForward,
  mode,
  nextDisabled,
  oneToCompletion,
  question,
  submissions,
  totalPointsAwarded,
}) {
  const answerChoices = question?.answerChoices || [];
  const numCorrect = answerChoices.filter((el) => el.isCorrect).length || 0;
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || [];
  const attemptsExhausted = submissions?.length >= question?.attemptsPossible;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;
  const showSubmitBtn = !answeredCorrectly && !attemptsExhausted;
  const showNextBtn = answeredCorrectly || attemptsExhausted;

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

    const updatedPointsAwarded = getPointsAwarded(
      grade,
      totalPointsAwarded,
      adaptive,
      adaptiveParams,
      oneToCompletion
    );

    if (mode === "course") {
      saveQResponseFromCourse(
        submissions,
        docRefParams,
        question,
        currentResponse,
        grade,
        updatedPointsAwarded,
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
  const disabled = !responseChanged || submitting || attemptsExhausted;

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
            <Box className="answer-choice-preview" key={`choice-${ind}`}>
              {numCorrect <= 1 && (
                <Radio
                  className="multiple-choice-radio"
                  checked={
                    mode === "gradebook"
                      ? lastResponse.includes(ind)
                      : el.isCorrect
                  }
                  disabled
                />
              )}
              {numCorrect > 1 && (
                <Checkbox
                  className="multiple-choice-checkbox"
                  checked={
                    mode === "gradebook"
                      ? lastResponse.includes(ind)
                      : el.isCorrect
                  }
                  disabled
                />
              )}
              <Box className="answer-choice-text">{parse(el.text)}</Box>
            </Box>
          ))}
        </div>
      </CardContent>
    );
  }

  if (mode == "gradebook") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 2 }} />
        <CorrectIndicator
          attemptsExhausted={attemptsExhausted}
          lastSubmission={lastSubmission}
          mode={mode}
          submitting={submitting}
        />
        {numCorrect === 0 && (
          <Alert severity="warning">no correct answer selected</Alert>
        )}
        <div className="answer-choice-area">
          {answerChoices.map((el, ind) => (
            <Box className="answer-choice-preview" key={`choice-${ind}`}>
              {numCorrect <= 1 && (
                <Radio
                  className="multiple-choice-radio"
                  checked={lastResponse.includes(ind)}
                  disabled
                />
              )}
              {numCorrect > 1 && (
                <Checkbox
                  className="multiple-choice-checkbox"
                  checked={lastResponse.includes(ind)}
                  disabled
                />
              )}
              <Box className="answer-choice-text">{parse(el.text)}</Box>
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
          attemptsExhausted={attemptsExhausted}
          lastSubmission={lastSubmission}
          mode={mode}
          submitting={submitting}
        />
        {numCorrect === 0 && (
          <Alert severity="warning">
            no correct answer
            {mode === "course" ? " - please contact your instructor" : null}
          </Alert>
        )}
        <div className="answer-choice-area">
          {answerChoices.map((el, ind) => (
            <Box className="answer-choice-preview" key={`choice-${ind}`}>
              {numCorrect === 1 && (
                <Radio
                  className="multiple-choice-radio"
                  checked={currentResponse.includes(ind) || false}
                  onChange={() => handleCurrentResponse(ind)}
                  disabled={attemptsExhausted || answeredCorrectly}
                />
              )}
              {numCorrect > 1 && (
                <Checkbox
                  className="multiple-choice-checkbox"
                  checked={currentResponse.includes(ind) || false}
                  onChange={() => handleCurrentResponse(ind)}
                  disabled={attemptsExhausted || answeredCorrectly}
                />
              )}
              <Box className="answer-choice-text">{parse(el.text)}</Box>
            </Box>
          ))}
        </div>

        <BtnContainer right>
          <Stack>
            <Box sx={{ mb: 1 }}>
              <AttemptCounter question={question} submissions={submissions} />
              {mode === "test" && <VertDivider />}
              {mode == "test" && (
                <ClearSubmissions handleClick={handleClearSubmissions} />
              )}
            </Box>

            {showSubmitBtn && (
              <SubmitBtn
                label="SUBMIT"
                onClick={handleSubmit}
                submitting={submitting}
                disabled={disabled}
              />
            )}
            {showNextBtn && (
              <Button
                endIcon={<NavigateNextIcon />}
                disabled={nextDisabled}
                onClick={goForward}
              >
                NEXT
              </Button>
            )}
          </Stack>
        </BtnContainer>
      </CardContent>
    );
  }
}
