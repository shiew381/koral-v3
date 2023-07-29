import { useState, useEffect, useRef } from "react";
import {
  deleteQuestionSubmissions,
  saveQResponseFromCourse,
  saveQuestionResponse,
} from "../../utils/firestoreClient";
import { gradeResponse } from "../../utils/grading";
import {
  Box,
  Button,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { ShortTextField } from "../common/InputFields";
import { VertDivider } from "../common/Dividers";
import { NumberField } from "../common/NumberField";
import { UnitField } from "../common/UnitField";
import {
  AttemptCounter,
  ClearSubmissions,
  CorrectIndicator,
  PromptPreview,
} from "./QSetSharedCpnts";
import parse from "html-react-parser";

export default function ShortAnswer({
  adaptive,
  docRefParams,
  goForward,
  mode,
  nextDisabled,
  question,
  submissions,
  totalPointsAwarded,
}) {
  const subtype = question.subtype;
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || null;
  const attemptsExhausted = submissions?.length >= question?.attemptsPossible;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  const [submitting, setSubmitting] = useState(false);

  if (question.type !== "short answer") {
    return null;
  }

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
      {subtype === "text" && (
        <ShortAnswerText
          adaptive={adaptive}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
          totalPointsAwarded={totalPointsAwarded}
        />
      )}

      {subtype === "number" && (
        <ShortAnswerNumber
          adaptive={adaptive}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
          totalPointsAwarded={totalPointsAwarded}
        />
      )}
      {subtype === "measurement" && (
        <ShortAnswerMeasurement
          adaptive={adaptive}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
          totalPointsAwarded={totalPointsAwarded}
        />
      )}
    </CardContent>
  );
}

function ShortAnswerText({
  adaptive,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  question,
  setSubmitting,
  submissions,
  submitting,
  totalPointsAwarded,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const responseChanged = currentResponse?.text !== lastResponse?.text;
  const disabled = !responseChanged || submitting || attemptsExhausted;
  const showSubmitBtn = !answeredCorrectly && !attemptsExhausted;
  const showNextBtn = answeredCorrectly || attemptsExhausted;

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, docRefParams);
    setCurrentResponse({ text: "" });
  }

  function handleResponse(e) {
    setCurrentResponse({
      text: e.target.value,
    });
  }

  function handleSubmit() {
    const grade = gradeResponse(question, currentResponse);
    const updatedPointsAwarded = adaptive
      ? 0
      : totalPointsAwarded + grade.pointsAwarded;

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

  useEffect(
    () => {
      if (mode !== "preview" && submissions?.length > 0) {
        setCurrentResponse(lastResponse);
      } else {
        setCurrentResponse(null);
      }
    },
    //eslint-disable-next-line
    [question.id, mode]
  );

  if (mode === "preview") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          Response must match:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(question.correctAnswer?.text || "")}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "test" || mode === "course") {
    return (
      <>
        <div className="response-area">
          <div className="response-field-area">
            <div className="response-field-container">
              <ShortTextField
                disabled={answeredCorrectly}
                onChange={handleResponse}
                value={currentResponse?.text || ""}
              />
            </div>
          </div>
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
              <Button endIcon={<NavigateNextIcon />} onClick={goForward}>
                NEXT
              </Button>
            )}
          </Stack>
        </BtnContainer>
      </>
    );
  }
}

function ShortAnswerNumber({
  adaptive,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  question,
  setSubmitting,
  submissions,
  submitting,
  totalPointsAwarded,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting || attemptsExhausted;
  const showSubmitBtn = !answeredCorrectly && !attemptsExhausted;
  const showNextBtn = answeredCorrectly || attemptsExhausted;

  function detectChange() {
    if (currentResponse?.number === "") return false;
    if (!lastResponse?.number) return true;
    return currentResponse?.number !== lastResponse?.number;
  }

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, docRefParams);
    numberRef.current.innerHTML = "";
  }

  function handleSubmit() {
    numberRef.current?.normalize();
    const responseNumClone = numberRef.current.cloneNode(true);
    const responseNumStr = convertElemtoStr(responseNumClone);
    console.log("submitted num (str): " + responseNumStr);

    const tidiedResponse = { number: responseNumStr };

    const correctElem = document.createElement("div");
    correctElem.innerHTML = question.correctAnswer.number.slice();

    const correctNumStr = convertElemtoStr(correctElem);
    console.log("correct number (str): " + correctNumStr);

    const tidiedQuestion = {
      ...question,
      correctAnswer: { number: correctNumStr },
    };

    console.log(tidiedQuestion);

    const grade = gradeResponse(tidiedQuestion, tidiedResponse);
    const updatedPointsAwarded = adaptive
      ? 0
      : totalPointsAwarded + grade.pointsAwarded;

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

  useEffect(
    () => {
      if (mode !== "preview" && submissions?.length > 0) {
        numberRef.current.innerHTML = lastResponse.number;
      }
    },
    //eslint-disable-next-line
    [question.id, mode]
  );

  if (mode === "preview") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          Response must match:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(question.correctAnswer?.number || "")}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "test" || mode === "course") {
    return (
      <>
        <div className="response-area">
          <div className="response-field-area">
            <div className="response-field-container">
              <NumberField
                id={question?.id}
                currentResponse={currentResponse}
                numberRef={numberRef}
                setCurrentResponse={setCurrentResponse}
              />
            </div>
          </div>
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
              <Button endIcon={<NavigateNextIcon />} onClick={goForward}>
                NEXT
              </Button>
            )}
          </Stack>
        </BtnContainer>
      </>
    );
  }
}

function ShortAnswerMeasurement({
  adaptive,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  question,
  setSubmitting,
  submissions,
  submitting,
  totalPointsAwarded,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const unitRef = useRef();

  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting || attemptsExhausted;
  const showSubmitBtn = !answeredCorrectly && !attemptsExhausted;
  const showNextBtn = answeredCorrectly || attemptsExhausted;

  function detectChange() {
    if (currentResponse?.number === "") return false;
    if (currentResponse?.unit === "") return false;
    if (!lastResponse?.number) return true;
    if (!lastResponse?.unit) return true;
    return (
      currentResponse?.number !== lastResponse?.number ||
      currentResponse?.unit !== lastResponse?.unit
    );
  }

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, docRefParams);
    numberRef.current.innerHTML = "";
    unitRef.current.innerHTML = "";
  }

  function handleSubmit() {
    numberRef.current?.normalize();

    const responseNumClone = numberRef.current.cloneNode(true);
    const responseNumStr = convertElemtoStr(responseNumClone);
    console.log("submitted number (str): " + responseNumStr);

    const responseUnitClone = unitRef.current.cloneNode(true);
    const responseUnitStr = convertElemtoStr(responseUnitClone);
    console.log("submitted unit (str): " + responseUnitStr);

    const tidiedResponse = { number: responseNumStr, unit: responseUnitStr };

    const correctNumElem = document.createElement("div");
    correctNumElem.innerHTML = question.correctAnswer.number.slice();
    const correctUnitElem = document.createElement("div");
    correctUnitElem.innerHTML = question.correctAnswer.unit.slice();

    const correctNumStr = convertElemtoStr(correctNumElem);
    console.log("correct number (str): " + correctNumStr);
    const correctUnitStr = convertElemtoStr(correctUnitElem);
    console.log("correct unit: " + correctUnitStr);

    const tidiedQuestion = {
      ...question,
      correctAnswer: {
        number: correctNumStr,
        unit: correctUnitStr,
      },
    };

    const grade = gradeResponse(tidiedQuestion, tidiedResponse);
    const updatedPointsAwarded = adaptive
      ? 0
      : totalPointsAwarded + grade.pointsAwarded;

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

  //TODO: check if innerHTML of fields is resetting properly

  useEffect(
    () => {
      if (mode !== "preview" && submissions?.length > 0) {
        numberRef.current.innerHTML = lastResponse.number;
        unitRef.current.innerHTML = lastResponse.unit;
      }
    },
    //eslint-disable-next-line
    [question.id, mode]
  );

  if (mode === "preview") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          Response must match:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(question.correctAnswer?.number || "")}
          </div>
          <div className="correct-answer-field-container">
            {parse(question.correctAnswer?.unit || "")}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "test" || mode === "course") {
    return (
      <>
        <div className="response-area">
          <div className="response-field-area">
            <div className="response-field-container">
              <NumberField
                id={`${question?.id}-number`}
                currentResponse={currentResponse}
                setCurrentResponse={setCurrentResponse}
                numberRef={numberRef}
              />
            </div>
            <div className="response-field-container">
              <UnitField
                id={`${question?.id}-unit`}
                currentResponse={currentResponse}
                setCurrentResponse={setCurrentResponse}
                unitRef={unitRef}
              />
            </div>
          </div>
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
              <Button endIcon={<NavigateNextIcon />} onClick={goForward}>
                NEXT
              </Button>
            )}
          </Stack>
        </BtnContainer>
      </>
    );
  }
}

function convertElemtoStr(elem) {
  let stringifiedForm = "";

  //quick check - if no templates used return early
  const eqFields = elem.querySelectorAll(".eq-field");
  if (eqFields.length === 0) {
    console.log("no templates used");
    stringifiedForm = elem.innerText;
    return stringifiedForm;
  }

  for (let i = 0; i < 5; i++) {
    const superscripts = elem.querySelectorAll("sup");
    superscripts.forEach((superscript) => {
      const stringEquivalent = "^" + superscript.innerText;
      superscript.replaceWith(stringEquivalent);
    });

    const sqrts = elem.querySelectorAll(".eq-sqrt");
    sqrts.forEach((sqrt) => {
      const arg = sqrt.querySelector(".eq-sqrt-arg");
      const nestedFields = arg.querySelectorAll(".eq-field");
      if (nestedFields.length > 0) {
        console.log(
          "found nested fields in square root, scanning other fields..."
        );
        return;
      } else {
        const stringEquivalent = " sqrt" + "(" + arg.innerText.trim() + ") ";
        console.log("stringifying square root");
        console.log(stringEquivalent);
        sqrt.replaceWith(stringEquivalent);
      }
    });

    const fractions = elem.querySelectorAll(".eq-fraction");
    fractions.forEach((fraction) => {
      const numerator = fraction.querySelector(".eq-numerator");
      const nestedFieldsNum = numerator.querySelectorAll(".eq-field");

      const denominator = fraction.querySelector(".eq-denominator");
      const nestedFieldsDenom = denominator.querySelectorAll(".eq-field");

      if (nestedFieldsDenom.length > 0 || nestedFieldsNum.length > 0) {
        console.log("found nested fields in square root, skipping...");
        return;
      }

      const stringEquivalent =
        "(" + numerator.innerText + "/" + denominator.innerText + ")";
      console.log("stringifying fraction");
      console.log(stringEquivalent);
      fraction.replaceWith(stringEquivalent.trim());
    });
    stringifiedForm = elem.innerText;
  }

  return stringifiedForm.trim();
}
