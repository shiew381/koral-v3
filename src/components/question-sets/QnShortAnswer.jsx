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
} from "./QnSharedCpnts";
import parse from "html-react-parser";

// import styles from "@/styles/QuestionSet.module.css";

export default function ShortAnswer({ mode, qSet, question, user }) {
  const subtype = question.subtype;
  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || null;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  // function handleClearSubmissions() {
  //   deleteQuestionSubmissions(question, qSet, user);
  // }

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
        <CorrectIndicator lastSubmission={lastSubmission} />

        {subtype === "text" && (
          <ShortAnswerText
            answeredCorrectly={answeredCorrectly}
            lastResponse={lastResponse}
            lastSubmission={lastSubmission}
            mode={mode}
            question={question}
            qSet={qSet}
            submissions={submissions}
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
  submissions,
  user,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
      <div className="correct-answer-area">
        <div className="correct-answer-field-container">
          {parse(question.correctAnswer?.text || "")}
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
  submissions,
  user,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, qSet, user);
    numberRef.current.innerHTML = "";
  }

  function detectChange() {
    if (currentResponse?.number === "") return false;
    if (!lastResponse?.number) return true;
    return currentResponse?.number !== lastResponse?.number;
  }

  function handleSubmit() {
    // setSubmitting(true);
    numberRef.current?.normalize();
    const clone = numberRef.current.cloneNode(true);
    const responseStringified = { number: convertElemtoStr(clone) };
    console.log("response stringified: " + responseStringified);

    const correctElem = document.createElement("div");
    correctElem.innerHTML = question.correctAnswer.number.slice();

    const correctNumberStringified = convertElemtoStr(correctElem);
    console.log("response stringified: " + correctNumberStringified);

    const questionUpdated = {
      ...question,
      correctAnswer: { number: correctNumberStringified },
    };

    const grade = gradeResponse(questionUpdated, responseStringified);

    saveQuestionResponse(
      { number: numberRef.current.innerHTML },
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
      <div className="correct-answer-area">
        <div className="correct-answer-field-container">
          {parse(question.correctAnswer?.number || "")}
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
  correctAnswer,
  lastResponse,
  mode,
  question,
  qSet,
  submissions,
  user,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const numberRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const responseChanged = true;
  const disabled = !responseChanged || submitting;

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, qSet, user);
    numberRef.current.innerHTML = "";
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

  if (mode === "test") {
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
