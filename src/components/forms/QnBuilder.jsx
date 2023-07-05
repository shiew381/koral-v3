import { useState, useEffect } from "react";
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { AttemptsField, PointsField } from "../common/InputFields";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { addQuestion, updateQuestion } from "../../utils/firestoreClient";
import { MultipleChoice } from "./QnBuilderMultipleChoice";
// import { MultipleChoice } from "./QnBuilderMultipleChoice.";
// import { ShortAnswer } from "./QnBuilderShortAnswer";
// import { FreeResponse } from "./QnBuilderFreeResponse";

export function QuestionBuilder({
  edit,
  open,
  handleClose,
  qSet,
  selQuestion,
  setEdit,
  setSelQuestion,
  user,
}) {
  const [type, setType] = useState("multiple choice");

  const [submitting, setSubmitting] = useState(false);

  function handleType(e) {
    setType(e.target.value);
  }

  function handleAddQuestion(values) {
    console.log("pressed");
    addQuestion(values, qSet, user, setSubmitting, setSelQuestion, handleClose);
  }

  function handleUpdateQuestion(values) {
    updateQuestion(
      values,
      selQuestion,
      qSet,
      user,
      setSubmitting,
      setSelQuestion,
      handleClose
    );
  }

  useEffect(
    () => {
      if (edit) {
        setType(() => selQuestion?.type);
      }
    },
    //eslint-disable-next-line
    [selQuestion?.id]
  );

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title={edit ? "Edit Question" : "Add Question"} />
      <FormControl>
        <InputLabel>Type</InputLabel>
        <Select
          disabled={edit}
          label="Type"
          onChange={handleType}
          sx={{ mr: "15px", minWidth: "160px" }}
          value={type}
        >
          <MenuItem value={"multiple choice"}>Multiple Choice</MenuItem>
          <MenuItem value={"short answer"}>Short Answer</MenuItem>
          <MenuItem value={"free response"}>Free Response</MenuItem>
        </Select>
      </FormControl>
      {type === "multiple choice" && (
        <MultipleChoice
          edit={edit}
          handleAddQuestion={handleAddQuestion}
          handleUpdateQuestion={handleUpdateQuestion}
          qSet={qSet}
          selQuestion={selQuestion}
          setEdit={setEdit}
          setSelQuestion={setSelQuestion}
          submitting={submitting}
          user={user}
        />
      )}
    </Lightbox>
  );
}

export function AttemptsForm({
  handleClose,
  open,
  qSet,
  selQuestion,
  setSelQuestion,
  user,
}) {
  const initVal = {
    attempts: selQuestion?.attemptsPossible || 1,
  };
  const [attempts, setAttempts] = useState(initVal.attempts);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabled = submitting || attempts === selQuestion?.attemptsPossible;

  const values = {
    ...selQuestion,
    attemptsPossible: Number(attempts),
  };

  function handleAttempts(e) {
    setAttempts(e.target.value);
  }

  function handleKeyPress(e) {
    if (e.code !== "Enter") return;
    handleSubmit();
  }

  function handleSubmit() {
    if (attempts > 20) {
      setErrorMessage("maximum of 20 attempts allowed");
    } else if (attempts < 1) {
      setErrorMessage("number of attempts must equal 1 or greater");
    } else if (!Number.isInteger(Number(attempts))) {
      setErrorMessage("Must be an integer");
    } else {
      updateQuestion(
        values,
        selQuestion,
        qSet,
        user,
        setSubmitting,
        setSelQuestion,
        handleClose
      );
    }
  }

  function resetForm() {
    setAttempts(initVal.attempts);
    setErrorMessage("");
  }

  useEffect(
    resetForm,
    //eslint-disable-next-line
    [open]
  );

  return (
    <Lightbox
      customStyle={{ maxWidth: "400px" }}
      handleKeyPress={handleKeyPress}
      open={open}
      onClose={handleClose}
    >
      <LightboxHeader title="Attempts" />
      {errorMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <AttemptsField value={attempts} onChange={handleAttempts} />
      <br />

      <BtnContainer right>
        <SubmitBtn
          label="SAVE"
          onClick={handleSubmit}
          disabled={disabled}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}

export function PointsForm({
  handleClose,
  open,
  qSet,
  selQuestion,
  setSelQuestion,
  user,
}) {
  const initVal = {
    points: selQuestion?.pointsPossible || 1,
  };
  const [points, setPoints] = useState(initVal.points);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabled = submitting || points === initVal.points;

  const values = {
    ...selQuestion,
    pointsPossible: Number(points),
  };

  function handleKeyPress(e) {
    if (e.code !== "Enter") return;
    handleSubmit();
  }

  function handlePoints(e) {
    setPoints(e.target.value);
  }

  function handleSubmit() {
    if (points > 100) {
      setErrorMessage("point value cannot exceed 100");
    } else if (points < 1) {
      setErrorMessage("point value must be 1 or greater");
    } else if (!Number.isInteger(Number(points))) {
      setErrorMessage("Must be an integer");
    } else {
      updateQuestion(
        values,
        selQuestion,
        qSet,
        user,
        setSubmitting,
        setSelQuestion,
        handleClose
      );
    }
  }

  function resetForm() {
    setPoints(initVal.points);
    setErrorMessage("");
  }

  useEffect(
    resetForm,
    //eslint-disable-next-line
    [open]
  );

  return (
    <Lightbox
      customStyle={{ maxWidth: "400px" }}
      handleKeyPress={handleKeyPress}
      open={open}
      onClose={handleClose}
    >
      <LightboxHeader title="Points" />
      {errorMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <PointsField value={points} onChange={handlePoints} />
      <br />

      <BtnContainer right>
        <SubmitBtn
          label="SAVE"
          onClick={handleSubmit}
          disabled={disabled}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
