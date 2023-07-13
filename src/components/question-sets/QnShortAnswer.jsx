import { useState, useEffect, useRef } from "react";
import {
  deleteQuestionSubmissions,
  saveQuestionResponse,
} from "../../utils/firestoreClient";
import { gradeResponse } from "../../utils/grading";
import { getSubmissions } from "../../utils/questionSetUtils";
import {
  Box,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { NumberField } from "../common/NumberField";
import { ShortTextField } from "../common/InputFields";
import { VertDivider } from "../common/Dividers";
import {
  AttemptCounter,
  CorrectIndicator,
  PromptPreview,
} from "./QSetSharedCpnts";
import parse from "html-react-parser";
import { UnitField } from "../common/UnitField";

// import styles from "@/styles/QuestionSet.module.css";

export default function ShortAnswer({ mode, qSet, question, user }) {
  const subtype = question.subtype;
  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || null;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  const [submitting, setSubmitting] = useState(false);

  if (question.type !== "short answer") {
    return null;
  }

  if (mode === "preview") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />

        {subtype == "text" && (
          <ShortAnswerText mode={mode} question={question} />
        )}
        {subtype == "number" && (
          <ShortAnswerNumber mode={mode} question={question} />
        )}
        {subtype === "measurement" && (
          <ShortAnswerMeasurement mode={mode} question={question} />
        )}
      </CardContent>
    );
  }

  if (mode === "test") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />
        <CorrectIndicator
          lastSubmission={lastSubmission}
          submitting={submitting}
        />

        {subtype === "text" && (
          <ShortAnswerText
            answeredCorrectly={answeredCorrectly}
            lastResponse={lastResponse}
            lastSubmission={lastSubmission}
            mode={mode}
            question={question}
            qSet={qSet}
            submissions={submissions}
            submitting={submitting}
            setSubmitting={setSubmitting}
            user={user}
          />
        )}
        {subtype === "number" && (
          <ShortAnswerNumber
            answeredCorrectly={answeredCorrectly}
            lastResponse={lastResponse}
            mode={mode}
            question={question}
            qSet={qSet}
            submissions={submissions}
            submitting={submitting}
            setSubmitting={setSubmitting}
            user={user}
          />
        )}
        {subtype === "measurement" && (
          <ShortAnswerMeasurement
            answeredCorrectly={answeredCorrectly}
            lastResponse={lastResponse}
            mode={mode}
            question={question}
            qSet={qSet}
            submissions={submissions}
            submitting={submitting}
            setSubmitting={setSubmitting}
            user={user}
          />
        )}
      </CardContent>
    );
  }
}

function ShortAnswerText({
  answeredCorrectly,
  lastResponse,
  mode,
  question,
  qSet,
  setSubmitting,
  submissions,
  submitting,
  user,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const responseChanged = currentResponse?.text !== lastResponse?.text;
  const disabled = !responseChanged || submitting;

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, qSet, user);
    setCurrentResponse({ text: "" });
  }

  function handleResponse(e) {
    setCurrentResponse({
      text: e.target.value,
    });
  }

  function handleSubmit() {
    setSubmitting(true);
    const grade = gradeResponse(question, currentResponse);

    saveQuestionResponse(
      currentResponse,
      grade,
      submissions,
      question,
      qSet,
      user
    );

    setTimeout(() => setSubmitting(false), 400);
  }

  useEffect(
    () => {
      if (mode === "test" && submissions?.length > 0) {
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
          sx={{ position: "relative", top: "70px", left: "100px" }}
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

  if (mode === "test") {
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
              <VertDivider color="text.secondary" show />
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
      </>
    );
  }
}

function ShortAnswerNumber({
  answeredCorrectly,
  lastResponse,
  mode,
  question,
  qSet,
  setSubmitting,
  submissions,
  submitting,
  user,
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
    deleteQuestionSubmissions(question, qSet, user);
    numberRef.current.innerHTML = "";
  }

  function handleSubmit() {
    setSubmitting(true);
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

    saveQuestionResponse(
      currentResponse,
      grade,
      submissions,
      question,
      qSet,
      user
    );
    setSubmitting(false);
  }

  useEffect(
    () => {
      if (mode === "test" && submissions?.length > 0) {
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
          sx={{ position: "relative", top: "70px", left: "100px" }}
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

  if (mode === "test") {
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
              <VertDivider color="text.secondary" show />
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
      </>
    );
  }
}

function ShortAnswerMeasurement({
  answeredCorrectly,
  lastResponse,
  mode,
  question,
  qSet,
  setSubmitting,
  submissions,
  submitting,
  user,
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
    deleteQuestionSubmissions(question, qSet, user);
    numberRef.current.innerHTML = "";
    unitRef.current.innerHTML = "";
  }

  function handleSubmit() {
    setSubmitting(true);
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

    setTimeout(() => {
      saveQuestionResponse(
        currentResponse,
        grade,
        submissions,
        question,
        qSet,
        user
      );
      setSubmitting(false);
    }, 600);
  }

  useEffect(
    () => {
      if (mode === "test" && submissions?.length > 0) {
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

  if (mode === "test") {
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
              <VertDivider color="text.secondary" show />
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
