import { useState, useEffect, useRef } from "react";
import { autoAddQueston, autoSaveQuestion } from "../..//utils/firestoreClient";
import { cleanEditorHTML } from "../../utils/questionSetUtils";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  Select,
} from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { NumberField } from "../common/NumberField";
import { PercentToleranceField } from "../common/InputFields";
import { Editor } from "../common/Editor";
import { UnitField } from "../common/UnitField";
import { generateRandomCode } from "../../utils/commonUtils";

export function ShortAnswer({
  edit,
  handleAddQuestion,
  handleUpdateQuestion,
  qSet,
  selQuestion,
  setEdit,
  setSelQuestion,
  submitting,
  user,
}) {
  const add = !edit;
  const questionID = edit ? selQuestion?.id : generateRandomCode(8);
  const initVal = edit
    ? {
        subtype: selQuestion?.subtype,
        prompt: selQuestion?.prompt,
        scoring: selQuestion?.scoring,
      }
    : {
        subtype: "text",
        prompt: "<div><br></div><div><br></div><div><br></div>",
        scoring: {
          acceptAltCap: true,
          acceptAltSpacing: true,
        },
      };

  const promptRef = useRef();
  const [subtype, setSubtype] = useState(initVal.subtype);
  const [scoring, setScoring] = useState(initVal.scoring);

  function handleAutoAdd() {
    const values = {
      type: "short answer",
      subtype: subtype,
      prompt: cleanEditorHTML(promptRef.current),
      scoring: scoring,
      correctAnswer: {},
      pointsPossible: 1,
      attemptsPossible: 1,
    };
    autoAddQueston(values, questionID, qSet, user, setEdit, setSelQuestion);
  }

  function handleAutoSave() {
    const values = {
      ...selQuestion,
      prompt: cleanEditorHTML(promptRef.current),
      scoring: scoring,
    };
    autoSaveQuestion(values, questionID, qSet, user, setSelQuestion);
  }

  function handleSubmit(e, correctAnswer) {
    if (add) {
      const values = {
        type: "short answer",
        subtype: subtype,
        prompt: cleanEditorHTML(promptRef.current),
        correctAnswer: correctAnswer,
        scoring: scoring,
        pointsPossible: 1,
        attemptsPossible: 5,
      };
      handleAddQuestion(values);
      return;
    }

    if (edit) {
      const values = {
        ...selQuestion,
        prompt: cleanEditorHTML(promptRef.current),
        correctAnswer: correctAnswer,
        scoring: scoring,
      };
      handleUpdateQuestion(values);
      return;
    }
  }

  function handleSubtype(e) {
    setSubtype(e.target.value);
  }

  useEffect(
    () => {
      promptRef.current.innerHTML = initVal.prompt;
    },
    //eslint-disable-next-line
    [selQuestion?.id]
  );

  return (
    <>
      <FormControl>
        <InputLabel>Subtype</InputLabel>
        <Select
          disabled={edit}
          label="Subtype"
          onChange={handleSubtype}
          sx={{ minWidth: "160px" }}
          value={subtype}
        >
          <MenuItem value={"text"}>Text</MenuItem>
          <MenuItem value={"number"}>Number</MenuItem>
          <MenuItem value={"measurement"}>Measurement</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Editor
        editorRef={promptRef}
        id="prompt"
        imagePath={`users/${user?.uid}/question-sets/${qSet?.id}/${questionID}}`}
        label="prompt"
        onImageUploadSuccess={edit ? handleAutoSave : handleAutoAdd}
        onImageDeleteSuccess={edit ? handleAutoSave : handleAutoAdd}
        toolbarOptions={[
          "font style",
          "superscript/subscript",
          "list",
          "equation",
          "image",
        ]}
      />
      <Box sx={{ p: 3 }}>
        {subtype == "text" && (
          <Text
            edit={edit}
            handleSubmit={handleSubmit}
            scoring={scoring}
            selQuestion={selQuestion}
            setScoring={setScoring}
            submitting={submitting}
          />
        )}
        {subtype === "number" && (
          <Number
            edit={edit}
            handleSubmit={handleSubmit}
            scoring={scoring}
            selQuestion={selQuestion}
            setScoring={setScoring}
            submitting={submitting}
          />
        )}

        {subtype === "measurement" && (
          <Measurement
            edit={edit}
            handleSubmit={handleSubmit}
            scoring={scoring}
            selQuestion={selQuestion}
            setScoring={setScoring}
            submitting={submitting}
          />
        )}
      </Box>
    </>
  );
}

function Text({
  edit,
  handleSubmit,
  scoring,
  selQuestion,
  setScoring,
  submitting,
}) {
  const add = !edit;
  const textRef = useRef();
  const [loading, setLoading] = useState(true);
  const defaultScoring = {
    acceptAltCap: true,
    acceptAltSpacing: true,
  };

  function handleAcceptAltCap(e) {
    const scoringCopy = { ...scoring };
    setScoring({
      acceptAltCap: e.target.checked,
      acceptAltSpacing: scoringCopy.acceptAltSpacing,
    });
  }

  function handleAcceptAltSpacing(e) {
    const scoringCopy = { ...scoring };
    setScoring({
      acceptAltCap: scoringCopy.acceptAltCap,
      acceptAltSpacing: e.target.checked,
    });
  }

  useEffect(
    () => {
      if (add) {
        setScoring(defaultScoring);
        textRef.current.value = "";
      }

      if (edit) {
        setScoring(selQuestion.scoring);
        textRef.current.value = selQuestion.correctAnswer.text;
      }
    },
    //eslint-disable-next-line
    []
  );

  useEffect(() => setLoading(false), []);

  return (
    <>
      <Box sx={{ px: "5%" }}>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Response must match:
        </Typography>

        <TextField
          inputRef={textRef}
          autoComplete="off"
          fullWidth
          placeholder="type answer here"
          variant="filled"
        />
      </Box>
      <br />
      <br />
      <Box sx={{ px: "5%" }}>
        <Typography sx={{ mb: 1 }} color="text.secondary">
          Options
        </Typography>

        {!loading && (
          <FormControlLabel
            label="accept alternate capitalization"
            control={
              <Checkbox
                checked={scoring.acceptAltCap}
                onChange={handleAcceptAltCap}
              />
            }
          />
        )}

        {!loading && (
          <FormControlLabel
            label="accept alternate spacing"
            control={
              <Checkbox
                checked={scoring.acceptAltSpacing}
                onChange={handleAcceptAltSpacing}
              />
            }
          />
        )}
      </Box>
      <BtnContainer right>
        <SubmitBtn
          disabled={submitting}
          label="SAVE"
          onClick={(e) => handleSubmit(e, { text: textRef.current.value })}
          submitting={submitting}
        />
      </BtnContainer>
    </>
  );
}

function Number({
  edit,
  handleSubmit,
  scoring,
  selQuestion,
  setScoring,
  submitting,
}) {
  const [loading, setLoading] = useState(true);

  const add = !edit;
  const numberRef = useRef();
  const defaultScoring = { percentTolerance: "2" };

  function handlePercentTolerance(e) {
    setScoring({ percentTolerance: e.target.value });
  }

  useEffect(
    () => {
      if (add) {
        setScoring(defaultScoring);
        numberRef.current.innerHTML = "";
      }

      if (edit) {
        setScoring(selQuestion.scoring);
        numberRef.current.innerHTML = selQuestion.correctAnswer.number;
      }
    },
    //eslint-disable-next-line
    []
  );

  useEffect(() => {
    const elems = numberRef.current.querySelectorAll(".eq-field");
    elems.forEach((elem) => (elem.contentEditable = "true"));
  });

  useEffect(() => setLoading(false), []);

  return (
    <>
      <Box sx={{ px: "5%" }}>
        <Typography sx={{ mb: "100px" }} color="text.secondary">
          Response must match:
        </Typography>
        <div className="response-area">
          <div className="response-field-container">
            <NumberField
              id={`${selQuestion?.id}-number`}
              numberRef={numberRef}
              setCurrentResponse={() => console.log("skip")}
            />
          </div>
        </div>
      </Box>
      <br />
      <Box sx={{ px: "5%" }}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          Options
        </Typography>
        <Box sx={{ px: "35px" }}>
          {!loading && (
            <PercentToleranceField
              value={scoring?.percentTolerance}
              onChange={handlePercentTolerance}
            />
          )}
        </Box>
      </Box>
      <BtnContainer right>
        <SubmitBtn
          disabled={submitting}
          label="SAVE"
          onClick={(e) =>
            handleSubmit(e, { number: cleanEditorHTML(numberRef.current) })
          }
          submitting={submitting}
        />
      </BtnContainer>
    </>
  );
}

function Measurement({
  edit,
  handleSubmit,
  scoring,
  selQuestion,
  setScoring,
  submitting,
}) {
  const [loading, setLoading] = useState(true);

  const add = !edit;
  const numberRef = useRef();
  const unitRef = useRef();
  const defaultScoring = { percentTolerance: "2" };

  function handlePercentTolerance(e) {
    setScoring({ percentTolerance: e.target.value });
  }

  useEffect(
    () => {
      if (add) {
        setScoring(defaultScoring);
        numberRef.current.innerHTML = "";
        unitRef.current.innerHTML = "";
      }

      if (edit) {
        setScoring(selQuestion.scoring);
        numberRef.current.innerHTML = selQuestion.correctAnswer.number;
        unitRef.current.innerHTML = selQuestion.correctAnswer.unit;
      }
    },
    //eslint-disable-next-line
    []
  );

  useEffect(() => {
    const numberElems = numberRef.current.querySelectorAll(".eq-field");
    numberElems.forEach((elem) => (elem.contentEditable = "true"));

    const unitElems = unitRef.current.querySelectorAll(".eq-field");
    unitElems.forEach((elem) => (elem.contentEditable = "true"));
  });

  useEffect(() => setLoading(false), []);

  return (
    <>
      <Box sx={{ px: "5%" }}>
        <Typography sx={{ mb: "100px" }} color="text.secondary">
          Response must match:
        </Typography>
        <div className="response-area">
          <div className="response-field-container">
            <NumberField
              id={`${selQuestion?.id}-number`}
              numberRef={numberRef}
              setCurrentResponse={() => console.log("skip")}
            />
          </div>
          <div className="response-field-container">
            <UnitField
              id={`${selQuestion?.id}-unit`}
              unitRef={unitRef}
              setCurrentResponse={() => console.log("skip")}
            />
          </div>
        </div>
        <br />
        <br />
      </Box>
      <br />
      <Box sx={{ px: "5%" }}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          Options
        </Typography>

        <Box sx={{ px: "35px" }}>
          {!loading && (
            <PercentToleranceField
              value={scoring?.percentTolerance}
              onChange={handlePercentTolerance}
            />
          )}
        </Box>
      </Box>
      <BtnContainer right>
        <SubmitBtn
          disabled={submitting}
          label="SAVE"
          onClick={(e) =>
            handleSubmit(e, {
              number: cleanEditorHTML(numberRef.current),
              unit: cleanEditorHTML(unitRef.current),
            })
          }
          submitting={submitting}
        />
      </BtnContainer>
    </>
  );
}
