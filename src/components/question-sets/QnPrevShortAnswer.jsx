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
  TextField,
} from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { NumberField } from "../common/NumberField";
import { ShortTextField } from "../common/InputFields";
import { VertDivider } from "../common/Dividers";
import {
  AttemptCounter,
  CorrectIndicator,
  PromptPreview,
} from "./QnPrevSharedCpnts";
import parse from "html-react-parser";

// import styles from "@/styles/QuestionSet.module.css";

export default function ShortAnswerPreview({ mode, qSet, question, userCred }) {
  const subtype = question.subtype;
  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || null;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, qSet, userCred);
  }

  // useEffect(
  //   () => {
  //     if (submissions.length === 0) {
  //       setCurrentResponse(null);
  //     } else {
  //       setCurrentResponse(lastResponse);
  //     }
  //   },
  //   //eslint-disable-next-line
  //   [question.id, subtype]
  // );

  if (question.type !== "short answer") {
    return null;
  }

  if (mode === "build") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />

        {subtype == "text" && <ShortAnswerText build question={question} />}
        {subtype == "number" && <ShortAnswerNumber build question={question} />}
        {subtype === "measurement" && (
          <ShortAnswerMeasurement build question={question} />
        )}
      </CardContent>
    );
  }

  if (mode === "preview") {
    return (
      <CardContent className="question-content">
        <PromptPreview question={question} />
        <Divider sx={{ my: 1 }} />
        <CorrectIndicator lastSubmission={lastSubmission} />

        {subtype === "text" && (
          <ShortAnswerText
            answeredCorrectly={answeredCorrectly}
            handleClearSubmissions={handleClearSubmissions}
            lastResponse={lastResponse}
            lastSubmission={lastSubmission}
            question={question}
            qSet={qSet}
            submissions={submissions}
            userCred={userCred}
          />
        )}
        {subtype === "number" && (
          <ShortAnswerNumber
            answeredCorrectly={answeredCorrectly}
            handleClearSubmissions={handleClearSubmissions}
            lastResponse={lastResponse}
            question={question}
            qSet={qSet}
            submissions={submissions}
            userCred={userCred}
          />
        )}
        {subtype === "measurement" && (
          <ShortAnswerMeasurement
            answeredCorrectly={answeredCorrectly}
            handleClearSubmissions={handleClearSubmissions}
            lastResponse={lastResponse}
            question={question}
            qSet={qSet}
            submissions={submissions}
            userCred={userCred}
          />
        )}
      </CardContent>
    );
  }
}

function ShortAnswerText({
  answeredCorrectly,
  build,
  handleClearSubmissions,
  lastResponse,
  question,
  qSet,
  submissions,
  userCred,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const responseChanged = currentResponse?.text !== lastResponse?.text;
  const disabled = !responseChanged || submitting;

  useEffect(
    () => {
      !build && submissions?.length > 0
        ? setCurrentResponse(lastResponse)
        : setCurrentResponse(null);
    },
    //eslint-disable-next-line
    [question.id, build]
  );

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
      userCred
    );

    setTimeout(() => setSubmitting(false), 400);
  }

  if (build) {
    return (
      <div className="response-area">
        <div className="response-field-container">
          <TextField
            disabled
            fullWidth
            label="correct answer"
            value={question.correctAnswer?.text || ""}
          />
        </div>
      </div>
    );
  }

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
    </>
  );
}

function ShortAnswerNumber({
  answeredCorrectly,
  build,
  handleClearSubmissions,
  lastResponse,
  question,
  qSet,
  submissions,
  userCred,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

  function clearSubmisionsResetField() {
    handleClearSubmissions();
    numberRef.current.innerHTML = "";
  }

  function detectChange() {
    if (currentResponse?.number === "") return false;
    if (!lastResponse?.number) return true;
    return currentResponse?.number !== lastResponse?.number;
  }

  function handleSubmit() {
    setSubmitting(true);
    numberRef.current?.normalize();
    const clone = numberRef.current.cloneNode(true);
    const numberStringified = convertHTMLtoStr(clone);
    const stringifiedResponse = { number: numberStringified };

    const grade = gradeResponse(question, stringifiedResponse);

    saveQuestionResponse(
      { number: numberRef.current.innerHTML },
      grade,
      submissions,
      question,
      qSet,
      userCred
    );
    setSubmitting(false);
  }

  useEffect(
    () => {
      if (!build && submissions?.length > 0) {
        numberRef.current.innerHTML = lastResponse.number;
      }
    },
    //eslint-disable-next-line
    [question.id, build]
  );

  //TODO: replace textfield with parsed correct answer - number
  if (build) {
    return (
      <div className="response-area">
        <div className="response-field-container">
          {parse(question.correctAnswer?.number || "")}
          {/* <TextField
            disabled
            fullWidth
            label="correct answer"
            value={question.correctAnswer?.number || ""}
          /> */}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="response-area">
        <div className="response-field-container">
          <NumberField
            id={question?.id}
            numberRef={numberRef}
            setCurrentResponse={setCurrentResponse}
          />
        </div>
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
              onClick={clearSubmisionsResetField}
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

function ShortAnswerMeasurement({
  answeredCorrectly,
  build,
  correctAnswer,
  handleClearSubmissions,
  lastResponse,
  question,
  qSet,
  submissions,
  userCred,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const responseChanged = true;
  const disabled = !responseChanged || submitting;

  function handleSubmit() {
    setSubmitting(true);
    const grade = gradeResponse(question, currentResponse);

    saveQuestionResponse(
      currentResponse,
      grade,
      submissions,
      question,
      qSet,
      userCred
    );

    setTimeout(() => setSubmitting(false), 400);
  }

  useEffect(
    () => {
      !build && submissions?.length > 0
        ? setCurrentResponse(lastResponse)
        : setCurrentResponse(null);
    },
    //eslint-disable-next-line
    [question.id, build]
  );

  if (build) {
    return (
      <div className="repsonse-area">
        <div className="response-field-container">
          <TextField
            disabled
            fullWidth
            label="correct answer"
            value={correctAnswer?.number || ""}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="response-area">
        <div className="response-field-container">
          <NumberField id={question?.id} />
        </div>
      </div>

      {/* <UnitField value={currentResponse?.unit || ""} onChange={handleUnit} /> */}
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
    </>
  );
}

function convertHTMLtoStr(elem) {
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

  return stringifiedForm;
}
