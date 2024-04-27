import { useState, useEffect, useRef } from "react";
import {
  cleanChemField,
  cleanEditorHTML,
  convertSpecialTags,
  toChemFormulaStr,
} from "../../utils/questionSetUtils";
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
import { ChemFormulaField } from "../common/ChemFormulaField";
import { generateRandomCode } from "../../utils/commonUtils";

export function ShortAnswer({
  autoSaveQuestion,
  edit,
  imagePath,
  saveQuestion,
  selQuestion,
  submitting,
}) {
  const add = !edit;

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

  function handleAutoSave() {
    const values = add
      ? {
          type: "short answer",
          subtype: subtype,
          prompt: cleanEditorHTML(promptRef.current),
          scoring: scoring,
          correctAnswer: {},
          pointsPossible: 1,
          attemptsPossible: 5,
        }
      : {
          ...selQuestion,
          prompt: cleanEditorHTML(promptRef.current),
          scoring: scoring,
        };
    autoSaveQuestion(values);
  }

  function handleSave(e, correctAnswer) {
    const values = add
      ? {
          type: "short answer",
          subtype: subtype,
          prompt: cleanEditorHTML(promptRef.current),
          correctAnswer: correctAnswer,
          scoring: scoring,
          pointsPossible: 1,
          attemptsPossible: 5,
        }
      : {
          ...selQuestion,
          prompt: cleanEditorHTML(promptRef.current),
          correctAnswer: correctAnswer,
          scoring: scoring,
        };

    saveQuestion(values);
  }

  function handleSubtype(e) {
    setSubtype(e.target.value);
  }

  useEffect(
    () => {
      promptRef.current.innerHTML = convertSpecialTags(initVal.prompt);
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
          <MenuItem value={"chemical formula"}>Chemical Formula</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <Editor
        editorRef={promptRef}
        id="prompt"
        imagePath={imagePath}
        label="prompt"
        onImageUploadSuccess={handleAutoSave}
        onImageDeleteSuccess={handleAutoSave}
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
            handleSubmit={handleSave}
            scoring={scoring}
            selQuestion={selQuestion}
            setScoring={setScoring}
            submitting={submitting}
          />
        )}
        {subtype === "number" && (
          <Number
            edit={edit}
            handleSubmit={handleSave}
            scoring={scoring}
            selQuestion={selQuestion}
            setScoring={setScoring}
            submitting={submitting}
          />
        )}
        {subtype === "measurement" && (
          <Measurement
            edit={edit}
            handleSubmit={handleSave}
            scoring={scoring}
            selQuestion={selQuestion}
            setScoring={setScoring}
            submitting={submitting}
          />
        )}
        {subtype === "chemical formula" && (
          <ChemicalFormula
            edit={edit}
            handleSubmit={handleSave}
            selQuestion={selQuestion}
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
      <Typography color="text.secondary" sx={{ px: "5%", mb: "20px" }}>
        Response must match:
      </Typography>
      <div className="response-area">
        <div className="response-field-area">
          <div className="response-field-container">
            <NumberField
              id={`${selQuestion?.id}-number`}
              numberRef={numberRef}
              setCurrentResponse={() => console.log("skip")}
            />
          </div>
        </div>
      </div>

      <Typography color="text.secondary" sx={{ px: "5%", mb: "5px" }}>
        Options
      </Typography>

      <div className="percent-tolerance-field-container">
        {!loading && (
          <PercentToleranceField
            value={scoring?.percentTolerance}
            onChange={handlePercentTolerance}
          />
        )}
      </div>

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
      <Typography color="text.secondary" sx={{ px: "5%", mb: "20px" }}>
        Response must match:
      </Typography>
      <div className="response-area">
        <div className="response-field-area">
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
      </div>

      <Typography color="text.secondary" sx={{ px: "5%" }}>
        Options
      </Typography>

      <div className="percent-tolerance-field-container">
        {!loading && (
          <PercentToleranceField
            value={scoring?.percentTolerance}
            onChange={handlePercentTolerance}
          />
        )}
      </div>

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

function ChemicalFormula({ edit, handleSubmit, selQuestion, submitting }) {
  const add = !edit;
  const questionID = edit ? selQuestion?.id : generateRandomCode(6);
  const fieldRef = useRef();

  useEffect(
    () => {
      if (add) {
        fieldRef.current.innerHTML = "";
      }

      if (edit) {
        fieldRef.current.innerHTML = selQuestion.correctAnswer.formula;
      }
    },
    //eslint-disable-next-line
    []
  );

  return (
    <>
      <Typography color="text.secondary" sx={{ px: "5%", mb: "20px" }}>
        Response must match:
      </Typography>
      <div className="response-area-b">
        <div className="response-field-area">
          <div className="response-field-container">
            <ChemFormulaField
              fieldRef={fieldRef}
              id={`${questionID}-number`}
              label="chemical formula"
              toolbarOptions={["superscript/subscript"]}
              setCurrentResponse={() => console.log("skip")}
            />
          </div>
        </div>
      </div>

      <BtnContainer right>
        <SubmitBtn
          disabled={submitting}
          label="SAVE"
          onClick={(e) =>
            handleSubmit(e, {
              formula: toChemFormulaStr(cleanChemField(fieldRef.current)),
            })
          }
          submitting={submitting}
        />
      </BtnContainer>
    </>
  );
}
