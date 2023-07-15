import { useState, useEffect, useRef } from "react";
import {
  deleteQuestionSubmissions,
  saveQResponseFromCourse,
  saveQuestionResponse,
} from "../../utils/firestoreClient";
import { gradeResponse } from "../../utils/grading";
import { Box, CardContent, Divider, Stack, Typography } from "@mui/material";
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
  docRefParams,
  mode,
  question,
  submissions,
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
        submitting={submitting}
      />
      {subtype === "text" && (
        <ShortAnswerText
          answeredCorrectly={answeredCorrectly}
          docRefParams={docRefParams}
          lastResponse={lastResponse}
          mode={mode}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {subtype === "number" && (
        <ShortAnswerNumber
          answeredCorrectly={answeredCorrectly}
          docRefParams={docRefParams}
          lastResponse={lastResponse}
          mode={mode}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}
      {subtype === "measurement" && (
        <ShortAnswerMeasurement
          answeredCorrectly={answeredCorrectly}
          docRefParams={docRefParams}
          lastResponse={lastResponse}
          mode={mode}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}
    </CardContent>
  );
}

function ShortAnswerText({
  answeredCorrectly,
  docRefParams,
  lastResponse,
  mode,
  question,
  setSubmitting,
  submissions,
  submitting,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const responseChanged = currentResponse?.text !== lastResponse?.text;
  const disabled = !responseChanged || submitting;

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
      <div className="flex flex-col flex-grow">
        <Typography
          sx={{ position: "relative", top: "50px", left: "100px" }}
          color="text.secondary"
        >
          Response must match:
        </Typography>
        <div className="correct-answer-area">
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
          <div className="response-field-container">
            <ShortTextField
              onChange={handleResponse}
              value={currentResponse?.text || ""}
            />
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
            {(submitting || !answeredCorrectly) && (
              <SubmitBtn
                label="SUBMIT"
                onClick={handleSubmit}
                submitting={submitting}
                disabled={disabled}
              />
            )}
          </Stack>
        </BtnContainer>
      </>
    );
  }
}

function ShortAnswerNumber({
  answeredCorrectly,
  docRefParams,
  lastResponse,
  mode,
  question,
  setSubmitting,
  submissions,
  submitting,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

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
      <div className="flex flex-col flex-grow">
        <Typography
          sx={{ position: "relative", top: "50px", left: "100px" }}
          color="text.secondary"
        >
          Response must match:
        </Typography>
        <div className="correct-answer-area">
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
          <div className="response-field-container">
            <NumberField
              id={question?.id}
              currentResponse={currentResponse}
              numberRef={numberRef}
              setCurrentResponse={setCurrentResponse}
            />
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
            {(submitting || !answeredCorrectly) && (
              <SubmitBtn
                label="SUBMIT"
                onClick={handleSubmit}
                submitting={submitting}
                disabled={disabled}
              />
            )}
          </Stack>
        </BtnContainer>
      </>
    );
  }
}

function ShortAnswerMeasurement({
  answeredCorrectly,
  docRefParams,
  lastResponse,
  mode,
  question,
  setSubmitting,
  submissions,
  submitting,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const unitRef = useRef();

  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

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
      <div className="flex flex-col flex-grow">
        <Typography
          sx={{ position: "relative", top: "70px", left: "100px" }}
          color="text.secondary"
        >
          Response must match:
        </Typography>
        <div className="correct-answer-area">
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

        <BtnContainer right>
          <Stack>
            <Box sx={{ mb: 1 }}>
              <AttemptCounter question={question} submissions={submissions} />
              {mode === "test" && <VertDivider />}
              {mode == "test" && (
                <ClearSubmissions handleClick={handleClearSubmissions} />
              )}
            </Box>
            {(submitting || !answeredCorrectly) && (
              <SubmitBtn
                label="SUBMIT"
                onClick={handleSubmit}
                submitting={submitting}
                disabled={disabled}
              />
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
