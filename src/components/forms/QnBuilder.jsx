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
import {
  addUserQn,
  addLibraryQn,
  autoAddUserQn,
  autoSaveUserQn,
  saveUserQn,
  autoAddLibraryQn,
  saveLibraryQn,
  autoSaveLibraryQn,
} from "../../utils/firestoreClient";
import { MultipleChoice } from "./QnBuilderMultipleChoice";
import { ShortAnswer } from "./QnBuilderShortAnswer";
import { FreeResponse } from "./QnBuilderFreeResponse";
import { generateRandomCode } from "../../utils/commonUtils";

export function QnBuilder({
  collection,
  edit,
  handleClose,
  incrementQnCount,
  libID,
  open,
  qSet,
  selQuestion,
  setEdit,
  setSelQuestion,
  user,
}) {
  const add = !edit;
  const [type, setType] = useState("multiple choice");
  const [submitting, setSubmitting] = useState(false);
  const qID = add ? generateRandomCode(8) : selQuestion?.id;
  const libQID = add ? generateRandomCode(20) : selQuestion?.id;
  const imagePath =
    collection === "library"
      ? `libraries/${libID}/questions/${libQID}`
      : `users/${user?.uid}/question-sets/${qSet?.id}/${qID}`;

  function handleType(e) {
    setType(e.target.value);
  }

  function autoSaveQuestion(values) {
    if (collection === "library" && add) {
      autoAddLibraryQn(values, libID, libQID, setEdit, setSelQuestion);
      incrementQnCount();
      return;
    }

    if (collection === "library" && edit) {
      autoSaveLibraryQn(values, libID, libQID, setSelQuestion);
      return;
    }

    if (collection === "user") {
      add
        ? autoAddUserQn(values, qID, qSet, user, setEdit, setSelQuestion)
        : autoSaveUserQn(values, qID, qSet, user, setSelQuestion);
      return;
    }
  }

  function saveQuestion(values) {
    if (collection === "library" && add) {
      addLibraryQn(values, libID, handleClose, setSubmitting);
      incrementQnCount();
    }

    if (collection === "library" && edit) {
      saveLibraryQn(values, libID, handleClose, setSubmitting);
      return;
    }

    if (collection === "user") {
      const refParams = { userID: user.uid, qSetID: qSet.id };
      add
        ? addUserQn(
            values,
            refParams,
            setSubmitting,
            setSelQuestion,
            handleClose
          )
        : saveUserQn(
            values,
            selQuestion,
            qSet,
            refParams,
            setSubmitting,
            setSelQuestion,
            handleClose
          );
      return;
    }
  }

  useEffect(
    () => {
      if (edit) {
        setType(() => selQuestion?.type);
      }
    },
    //eslint-disable-next-line
    [selQuestion?.id, open]
  );

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      customStyle={{ maxWidth: "600px" }}
    >
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
          autoSaveQuestion={autoSaveQuestion}
          edit={edit}
          imagePath={imagePath}
          saveQuestion={saveQuestion}
          selQuestion={selQuestion}
          submitting={submitting}
        />
      )}
      {type === "short answer" && (
        <ShortAnswer
          autoSaveQuestion={autoSaveQuestion}
          edit={edit}
          imagePath={imagePath}
          saveQuestion={saveQuestion}
          selQuestion={selQuestion}
          submitting={submitting}
        />
      )}
      {type === "free response" && (
        <FreeResponse
          autoSaveQuestion={autoSaveQuestion}
          edit={edit}
          imagePath={imagePath}
          saveQuestion={saveQuestion}
          selQuestion={selQuestion}
          submitting={submitting}
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
  const refParams = { userID: user.uid, qSetID: qSet.id };
  const initVal = {
    attempts: selQuestion?.attemptsPossible || 5,
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
      saveUserQn(
        values,
        selQuestion,
        qSet,
        refParams,
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
  const refParams = { userID: user.uid, qSetID: qSet.id };
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
      saveUserQn(
        values,
        selQuestion,
        qSet,
        refParams,
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
