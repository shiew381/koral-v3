import { useState, useEffect, useRef } from "react";
import {
  deleteQuestionSubmissions,
  getChemElemList,
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
  CircularProgress,
  Divider,
  Stack,
  TextField,
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
import { fullParse } from "../../utils/customParsers";
import { ChemFormulaField } from "../common/ChemFormulaField";
import {
  checkIfNumBrktMatch,
  checkIfNumParenMatch,
  cleanChemField,
  convertElemtoStr,
  findChemSymbols,
  findMalformedChemSymbols,
  findUnknownChemSymbols,
  toChemFormulaStr,
} from "../../utils/questionSetUtils";
import HelperTextOptions from "../common/InputHelpers";

export default function ShortAnswer({
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
          adaptiveParams={adaptiveParams}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          oneToCompletion={oneToCompletion}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
          totalPointsAwarded={totalPointsAwarded}
        />
      )}
      {subtype === "text with options" && (
        <ShortAnswerTextWOptions
          adaptive={adaptive}
          adaptiveParams={adaptiveParams}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          oneToCompletion={oneToCompletion}
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
          adaptiveParams={adaptiveParams}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          oneToCompletion={oneToCompletion}
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
          adaptiveParams={adaptiveParams}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          oneToCompletion={oneToCompletion}
          question={question}
          submissions={submissions}
          submitting={submitting}
          setSubmitting={setSubmitting}
          totalPointsAwarded={totalPointsAwarded}
        />
      )}
      {subtype === "chemical formula" && (
        <ShortAnswerChemFormula
          adaptive={adaptive}
          adaptiveParams={adaptiveParams}
          answeredCorrectly={answeredCorrectly}
          attemptsExhausted={attemptsExhausted}
          docRefParams={docRefParams}
          goForward={goForward}
          lastResponse={lastResponse}
          mode={mode}
          nextDisabled={nextDisabled}
          oneToCompletion={oneToCompletion}
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
  adaptiveParams,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  oneToCompletion,
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

  useEffect(
    () => {
      if (
        mode !== "preview" &&
        mode !== "gradebook" &&
        submissions?.length > 0
      ) {
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
            {fullParse(question.correctAnswer?.text || "")}
          </div>
        </div>
      </div>
    );
  }

  if (mode == "gradebook") {
    return (
      <div className="correct-answer-preview-area">
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(lastResponse?.text || "")}
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

function ShortAnswerTextWOptions({
  adaptive,
  adaptiveParams,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  oneToCompletion,
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
  const textRef = useRef();

  function handleClearSubmissions() {
    deleteQuestionSubmissions(question, docRefParams);
    setCurrentResponse({ text: "" });
    textRef.current.value = "";
  }

  function handleResponse(e) {
    setCurrentResponse({
      text: e.target.value,
    });
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

  useEffect(
    () => {
      if (
        mode !== "preview" &&
        mode !== "gradebook" &&
        submissions?.length > 0
      ) {
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
            {fullParse(question.correctAnswer?.text || "")}
          </div>
        </div>
        <HelperTextOptions
          inputId={`${question?.id}-preview`}
          inputRef={textRef}
          options={question?.options || []}
          setCurrentResponse={setCurrentResponse}
          mode={mode}
        />
      </div>
    );
  }

  if (mode == "gradebook") {
    return (
      <div className="correct-answer-preview-area">
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(lastResponse?.text || "")}
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
              <TextField
                id={`${question?.id}-input`}
                inputRef={textRef}
                autoComplete="off"
                onChange={handleResponse}
                fullWidth
                placeholder="word / phrase"
                variant="filled"
              />
            </div>
          </div>
          <br />
          <HelperTextOptions
            inputId={`${question?.id}-input`}
            inputRef={textRef}
            options={question?.options || []}
            setCurrentResponse={setCurrentResponse}
            mode={mode}
          />
        </div>
        <br />
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
  adaptiveParams,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  oneToCompletion,
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
    // console.log("correct number (str): " + correctNumStr);

    const tidiedQuestion = {
      ...question,
      correctAnswer: { number: correctNumStr },
    };

    const grade = gradeResponse(tidiedQuestion, tidiedResponse);

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

  useEffect(
    () => {
      if (
        mode !== "preview" &&
        mode !== "gradebook" &&
        submissions?.length > 0
      ) {
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

  if (mode === "gradebook") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          submitted response:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(lastResponse?.number || "")}
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
  adaptiveParams,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  oneToCompletion,
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
    // console.log("correct number (str): " + correctNumStr);
    const correctUnitStr = convertElemtoStr(correctUnitElem);
    // console.log("correct unit: " + correctUnitStr);

    const tidiedQuestion = {
      ...question,
      correctAnswer: {
        number: correctNumStr,
        unit: correctUnitStr,
      },
    };

    const grade = gradeResponse(tidiedQuestion, tidiedResponse);

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

  //TODO: check if innerHTML of fields is resetting properly

  useEffect(
    () => {
      if (
        mode !== "preview" &&
        mode !== "gradebook" &&
        submissions?.length > 0
      ) {
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

  if (mode === "gradebook") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          submitted response:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(lastResponse?.number || "")}
          </div>
          <div className="correct-answer-field-container">
            {parse(lastResponse?.unit || "")}
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

function ShortAnswerChemFormula({
  adaptive,
  adaptiveParams,
  answeredCorrectly,
  attemptsExhausted,
  docRefParams,
  goForward,
  lastResponse,
  mode,
  oneToCompletion,
  question,
  setSubmitting,
  submissions,
  submitting,
  totalPointsAwarded,
}) {
  const [currentResponse, setCurrentResponse] = useState(null);
  const fieldRef = useRef();
  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting || attemptsExhausted;
  const showSubmitBtn = !answeredCorrectly && !attemptsExhausted;
  const showNextBtn = answeredCorrectly || attemptsExhausted;
  const [elemList, setElemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputError, setInputError] = useState(false);
  const [inputErrorMessage, setInputErrorMessage] = useState("");

  function detectChange() {
    if (currentResponse?.formula === "") return false;
    if (!lastResponse?.formula) return true;
    return currentResponse?.formula !== lastResponse?.formula;
  }

  function handleClearSubmissions() {
    setInputError(false);
    setInputErrorMessage("");
    deleteQuestionSubmissions(question, docRefParams);
    setCurrentResponse({
      formula: "",
    });
    fieldRef.current.innerHTML = "";
  }

  function checkInputFormatting(tidiedResponse) {
    let formula = tidiedResponse.formula
      .replaceAll("<sub>", "")
      .replaceAll("</sub>", "")
      .replaceAll("<sup>", "")
      .replaceAll("</sup>", "")
      .replaceAll("&nbsp;", "");

    const numParenMatch = checkIfNumParenMatch(formula);
    const numBrakMatch = checkIfNumBrktMatch(formula);
    const malFormedChemSymbols = findMalformedChemSymbols(formula);
    const chemSymbols = findChemSymbols(formula);
    const unknownChemSymbols = findUnknownChemSymbols(chemSymbols, elemList);

    if (!numParenMatch) {
      setInputErrorMessage("number of parentheses must match");
      return false;
    }

    if (!numBrakMatch) {
      setInputErrorMessage("number of brackets must match");
      return false;
    }

    if (malFormedChemSymbols?.length > 0) {
      const name = malFormedChemSymbols[0];
      setInputErrorMessage(name + " is not a recognized element");
      return false;
    }

    if (unknownChemSymbols?.length > 0) {
      const name = unknownChemSymbols[0];
      setInputErrorMessage(name + " is not a recognized element");
      return false;
    }

    return true;
  }

  function handleSubmit() {
    const tidiedQuestion = { ...question };
    const tidiedResponse = {
      formula: toChemFormulaStr(cleanChemField(fieldRef.current)),
    };

    const inputCorrectlyFormatted = checkInputFormatting(tidiedResponse);

    if (!inputCorrectlyFormatted) {
      setInputError(true);
      return;
    }

    const grade = gradeResponse(tidiedQuestion, tidiedResponse);

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

  useEffect(
    () => {
      if (
        mode !== "preview" &&
        mode !== "gradebook" &&
        submissions?.length > 0
      ) {
        fieldRef.current.innerHTML = lastResponse.formula;
      }
    },
    //eslint-disable-next-line
    [question.id, mode]
  );

  useEffect(() => {
    getChemElemList(setElemList, setLoading);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-center">
        <CircularProgress />
      </div>
    );
  }

  if (mode === "preview") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          Response must match:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container-b">
            {parse(question.correctAnswer?.formula || "")}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "gradebook") {
    return (
      <div className="correct-answer-preview-area">
        <Typography color="text.secondary" sx={{ px: "20%" }}>
          submitted response:
        </Typography>
        <div className="correct-answer-field-area">
          <div className="correct-answer-field-container">
            {parse(lastResponse?.formula || "")}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "test" || mode === "course") {
    return (
      <>
        {inputError && <Alert severity="info">{inputErrorMessage}</Alert>}
        <div className="response-area">
          <div className="response-field-area">
            <div className="response-field-container">
              <ChemFormulaField
                currentResponse={currentResponse}
                fieldRef={fieldRef}
                id={question?.id}
                label="chemical formula"
                setCurrentResponse={setCurrentResponse}
                setInputError={setInputError}
                toolbarOptions={["superscript/subscript"]}
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
