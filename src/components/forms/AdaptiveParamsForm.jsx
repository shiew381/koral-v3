import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { copyArray } from "../../utils/commonUtils";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import {
  Alert,
  Box,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import {
  CompletionThresholdField,
  ObjectiveField,
} from "../common/InputFields";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { updateAdaptiveParams } from "../../utils/firestoreClient";

function getAssignments(qSet, adaptiveParams) {
  const arr = [];
  const objectives = adaptiveParams.objectives;
  objectives.forEach((objective) => {
    const paired = objective.questionIDs.map((questionID) => ({
      id: questionID,
      name: objective.name,
    }));
    arr.push(paired);
  });
  const pairs = arr.flat();

  console.log(pairs);

  const arr2 = qSet.questions.map((question) =>
    pairs.find((pair) => pair.id === question.id)
  );

  const assignments = arr2.map((el) => el?.name || "unassigned");

  return assignments;
}

export default function AdaptiveParamsForm({ qSet, open, handleClose, user }) {
  const cleanObjective = {
    completionThreshold: 0,
    questionIDs: [],
    name: "",
  };

  const adaptiveParams = qSet.adaptiveParams || null;

  const initVal = adaptiveParams
    ? {
        objectives: adaptiveParams.objectives,
        assignments: getAssignments(qSet, adaptiveParams),
        rule: adaptiveParams.completionRule,
      }
    : {
        objectives: [cleanObjective],
        assignments: qSet?.questions?.map(() => "unassigned"),
        rule: "in a row",
      };

  const steps = [
    "Define Learing Objectives",
    "Group Questions",
    "Set Completion Criteria",
  ];

  const initialRule = "in a row";
  const [activeStep, setActiveStep] = useState(0);
  const [objectives, setObjectives] = useState(initVal.objectives);
  const [assignments, setAssignments] = useState(initVal.assignments);
  const [rule, setRule] = useState(initialRule);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleRule(e) {
    setRule(e.target.value);
  }

  function handleSubmit() {
    const updatedObjectives = mergeObjsWithIDs(objectives, assignments, qSet);

    const values = {
      adaptiveParams: {
        objectives: updatedObjectives,
        completionRule: rule,
      },
    };

    updateAdaptiveParams(user, qSet.id, values, setSubmitting, handleClose);
  }

  function handleText(e, ind) {
    const updated = copyArray(objectives);
    updated[ind].name = e.target.value;
    setObjectives(updated);
    setError(false);
    setErrorMessage("");
  }

  function handleCompletionThreshold(e, ind) {
    const updated = copyArray(objectives);
    updated[ind].completionThreshold = e.target.value;
    setObjectives(updated);
  }

  function selectSkill(e, qIndex) {
    const updated = copyArray(assignments);
    updated[qIndex] = e.target.value;
    setAssignments(updated);
  }

  function deleteObjective(e, ind) {
    const updated = copyArray(objectives);
    updated.splice(ind, 1);
    setObjectives(updated);
  }

  function goBack() {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }

  function goForward() {
    const objectiveNames = objectives.map((el) => el.name.trim());
    const noSkillsDefined = objectiveNames.join("").length === 0;

    if (activeStep === 0 && noSkillsDefined) {
      setError(true);
      setErrorMessage("Must define at least one learning objective");
      return;
    }

    if (activeStep === 0) {
      setError(false);
      setErrorMessage("");
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setObjectives(objectives.filter((el) => el.name));

      return;
    }

    if (activeStep === 1) {
      setError(false);
      setErrorMessage("");
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      return;
    }
  }

  function addObjective() {
    setObjectives([...objectives, cleanObjective]);
  }

  function resetForm() {
    setObjectives(initVal.objectives);
    setAssignments(initVal.assignments);
    setRule(initVal.rule);
    setActiveStep(0);
  }

  useEffect(
    resetForm,
    //eslint-disable-next-line
    [open]
  );

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      customStyle={{ maxWidth: "1000px" }}
    >
      <LightboxHeader title="Adaptive Parameters" center />
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <br />
      <DefineObjectives
        addObjective={addObjective}
        error={error}
        errorMessage={errorMessage}
        deleteObjective={deleteObjective}
        handleText={handleText}
        objectives={objectives}
        step={activeStep}
      />
      <GroupQuestions
        objectives={objectives}
        assignments={assignments}
        setAssignments={setAssignments}
        questions={qSet.questions}
        selectSkill={selectSkill}
        step={activeStep}
      />
      <GroupSkills
        assignments={assignments}
        handleCompletionThreshold={handleCompletionThreshold}
        handleRule={handleRule}
        handleSubmit={handleSubmit}
        objectives={objectives}
        rule={rule}
        step={activeStep}
        submitting={submitting}
      />

      <br />
      <br />
      <BtnContainer split>
        <BackButton step={activeStep} onClick={goBack} />
        <NextButton
          step={activeStep}
          onClick={goForward}
          objectives={objectives}
        />
      </BtnContainer>
    </Lightbox>
  );
}

function BackButton({ step, onClick }) {
  return (
    <Button onClick={onClick} disabled={step === 0}>
      Back
    </Button>
  );
}

function NextButton({ step, onClick }) {
  const disabled = step === 2;

  return (
    <Button disabled={disabled} onClick={onClick}>
      Next
    </Button>
  );
}

function DefineObjectives({
  addObjective,
  deleteObjective,
  error,
  errorMessage,
  handleText,
  step,
  objectives,
}) {
  if (step !== 0) return null;

  return (
    <Box className="flex flex-col flex-center" sx={{ mt: "20px" }}>
      <Box sx={{ width: "450px", position: "relative", left: "20px" }}>
        {objectives.map((skill, ind) => (
          <Stack key={`skill-${ind}`} direction="row">
            <ObjectiveField
              index={ind}
              onChange={(e) => handleText(e, ind)}
              value={skill.name}
            />
            <IconButton
              disabled={objectives.length <= 1}
              onClick={(e) => deleteObjective(e, ind)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        {error && <Alert severity="error">{errorMessage}</Alert>}
      </Box>
      <BtnContainer center>
        <Button startIcon={<AddIcon />} fullWidth onClick={addObjective}>
          ADD LEARNING OBJECTIVE
        </Button>
      </BtnContainer>
    </Box>
  );
}

function GroupQuestions({
  selectSkill,
  questions,
  objectives,
  step,
  assignments,
}) {
  const headerCellStyle = {
    backgroundColor: "rgba(95,161,181,0.3)",
    paddingTop: "20px",
    paddingBottom: "20px",
  };
  const cellStyle = { padding: "20px", textAlign: "center" };

  if (objectives.length === 0) return null;
  if (step !== 1) return null;

  return (
    <Box className="flex flex-center flex-col">
      <table style={{ width: "850px", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ width: "5%", ...headerCellStyle }}>
              <Typography fontStyle="italic">#</Typography>
            </th>
            <th style={{ width: "60%", ...headerCellStyle }}>
              <Typography fontStyle="italic">Prompt </Typography>
            </th>
            <th style={{ width: "35%", ...headerCellStyle }}>
              <Typography fontStyle="italic">Objective</Typography>
            </th>
          </tr>
        </thead>

        <tbody>
          {questions?.map((question, qIndex) => (
            <tr
              key={question.id}
              style={{
                backgroundColor:
                  qIndex % 2 === 0 ? "rgba(95,161,181,0.1)" : "transparent",
              }}
            >
              <td style={cellStyle}>
                <Typography>{qIndex + 1}</Typography>
              </td>
              <td style={cellStyle}>
                <Typography>{parse(question?.prompt)}</Typography>
              </td>
              <td style={cellStyle}>
                <FormControl fullWidth>
                  <InputLabel>Objective</InputLabel>
                  <Select
                    value={assignments[qIndex]}
                    label="Objective"
                    onChange={(e) => selectSkill(e, qIndex)}
                  >
                    <MenuItem value="unassigned">
                      <Typography color="textSecondary">unassigned</Typography>
                    </MenuItem>
                    {objectives.map((skill, skillIndex) => (
                      <MenuItem
                        key={`skill-${qIndex}-${skillIndex}`}
                        value={skill.name}
                      >
                        {skill.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

function GroupSkills({
  assignments,
  handleRule,
  handleCompletionThreshold,
  objectives,
  rule,
  step,
  submitting,
  handleSubmit,
}) {
  const cellStyle = { textAlign: "center", padding: "2px" };
  if (step !== 2) return null;
  return (
    <Box className="flex flex-col flex-center" sx={{ pt: "20px" }}>
      <Box className="flex flex-row flex-align-center" sx={{ width: "600px" }}>
        <Box>
          <FormControl>
            <InputLabel>Completion Rule</InputLabel>
            <Select
              value={rule}
              label="Completion Rule"
              onChange={handleRule}
              sx={{ minWidth: "200px" }}
            >
              <MenuItem value="in a row">
                <Typography>in a row</Typography>
              </MenuItem>
              <MenuItem value="total correct">
                <Typography>total correct</Typography>
              </MenuItem>
              <MenuItem value="chutes and ladders">
                <Typography>chutes and ladders</Typography>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography color="primary" sx={{ ml: "20px" }}>
          {getHelperText(rule)}
        </Typography>
      </Box>
      <br />
      <br />

      <table style={{ width: "700px", marginBottom: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "rgba(95,161,181,0.3)" }}>
            <th style={{ width: "30%" }}>
              <Typography>Learning Objective</Typography>
            </th>
            <th style={{ width: "40%" }}>
              <Typography># Questions</Typography>
            </th>
            <th style={{ width: "35%" }}>
              <Typography>Advance After</Typography>
            </th>
          </tr>
        </thead>

        {[...objectives, { name: "unassigned" }].map((skill, ind) => (
          <tr
            key={skill.name}
            className="padding-light"
            style={{
              backgroundColor:
                ind % 2 === 0 ? "rgba(95,161,181,0.1)" : "transparent",
            }}
          >
            <td style={cellStyle}>
              <Typography>{skill.name}</Typography>
            </td>
            <td style={cellStyle}>
              <Typography>
                {countAssignedQuestions(skill.name, assignments)}
              </Typography>
            </td>
            <td style={cellStyle}>
              {skill.name == "unassigned" ? (
                "N/A"
              ) : (
                <CompletionThresholdField
                  questionCount={countAssignedQuestions(
                    skill.name,
                    assignments
                  )}
                  value={skill.completionThreshold}
                  onChange={(e) => handleCompletionThreshold(e, ind)}
                />
              )}
            </td>
          </tr>
        ))}
      </table>
      <SubmitBtn
        disabled={submitting}
        onClick={handleSubmit}
        label="SAVE PARAMETERS"
        submitting={submitting}
      />
    </Box>
  );
}

function countAssignedQuestions(objective, asgmts) {
  if (!Array.isArray(asgmts)) return 0;
  const numAssigned = asgmts.filter((asgmt) => asgmt === objective);
  return numAssigned.length;
}

function getHelperText(completeRule) {
  switch (completeRule) {
    case "total correct":
      return "Students must answer a defined number of question correctly.";
    case "in a row":
      return "Students must answer a defined number of questions in-a-row correctly. Progress resets whenever the student answer incorrectly.";
    case "chutes and ladders":
      return "Student's progress bar advances after each correctly answered question, but regresses after each incorrectly answered question";
    default:
      return "";
  }
}

function mergeObjsWithIDs(skills, assignments, qSet) {
  const updatedSkills = skills.map((skill) => {
    const assignedIDs = assignments.map((skillName, ind) =>
      skill.name === skillName ? qSet.questions[ind].id : null
    );
    return {
      ...skill,
      questionIDs: assignedIDs.filter((id) => id), //filter to remove null values
    };
  });

  return updatedSkills;
}
