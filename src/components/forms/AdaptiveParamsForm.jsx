import { useEffect, useState } from "react";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import {
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
import { CompletionValueField, SkillField } from "../common/InputFields";
import { copyArray } from "../../utils/commonUtils";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { updateAdaptiveParams } from "../../utils/firestoreClient";

export default function AdaptiveParamsForm({ qSet, open, handleClose, user }) {
  const initialSkillValues = {
    completionValue: 0,
    difficulty: 1,
    questionIDs: [],
    name: "",
  };

  const steps = ["Define Skills", "Group Questions", "Completion Criteria"];

  const initialAssignments = qSet?.questions?.map(() => "unassigned");
  const initialRule = "unassigned";
  const [activeStep, setActiveStep] = useState(0);

  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([initialSkillValues]);
  const [skillAssignments, setSkillAssignments] = useState(initialAssignments);
  const [rule, setRule] = useState(initialRule);
  const [submitting, setSubmitting] = useState(false);

  const handleRule = (e) => setRule(e.target.value);

  function resetForm() {
    setStep(1);
    setSkills([initialSkillValues]);
    setSkillAssignments(initialAssignments);
    setRule(initialRule);
    setActiveStep(0);
  }

  function handleText(e, ind) {
    const updated = copyArray(skills);
    updated[ind].name = e.target.value;
    setSkills(updated);
  }

  function handleCompletionValue(e, ind) {
    const updated = copyArray(skills);
    updated[ind].completionValue = e.target.value;
    setSkills(updated);
  }

  function selectSkill(e, qIndex) {
    const updated = copyArray(skillAssignments);
    updated[qIndex] = e.target.value;
    setSkillAssignments(updated);
  }

  function deleteSkill(e, ind) {
    const updated = copyArray(skills);
    updated.splice(ind, 1);
    setSkills(updated);
  }

  function goBack() {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }

  function goForward() {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }

  //   const goBack = () => setStep(step - 1);
  //   const goForward = () => {
  //     if (step === 1) setSkills(skills.filter((skill) => skill.name !== ""));
  //     setStep(step + 1);
  //   };

  function addSkill() {
    setSkills([...skills, initialSkillValues]);
  }

  function handleSubmit() {
    const updatedSkills = mergeSkillsWithIDs(skills, skillAssignments, qSet);

    const values = {
      completionRule: rule,
      adaptiveParams: {
        skills: updatedSkills,
      },
    };
    updateAdaptiveParams(user, qSet.id, values, setSubmitting, handleClose);
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
      customStyle={{ maxWidth: "600px" }}
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

      <DefineSkills
        addSkill={addSkill}
        deleteSkill={deleteSkill}
        handleText={handleText}
        skills={skills}
        step={activeStep}
      />
      <SkillGroupTable
        skills={skills}
        skillAssignments={skillAssignments}
        setSkillAssignments={setSkillAssignments}
        questions={qSet.questions}
        selectSkill={selectSkill}
        step={activeStep}
      />
      <GroupSkills
        rule={rule}
        handleRule={handleRule}
        handleCompletionValue={handleCompletionValue}
        skills={skills}
        skillAssignments={skillAssignments}
        step={activeStep}
      />
      {activeStep === 3 && (
        <BtnContainer center>
          <SubmitBtn
            disabled={submitting}
            onClick={handleSubmit}
            label="SAVE"
            submitting={submitting}
          />
        </BtnContainer>
      )}
      <pre>{JSON.stringify(skills, null, 2)}</pre>
      <BtnContainer split>
        <BackButton step={activeStep} onClick={goBack} />
        <NextButton step={activeStep} onClick={goForward} skills={skills} />
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

function NextButton({ step, onClick, skills }) {
  const skillNames = skills.map((el) => el.name);
  const noSkillsDefined = skillNames.join("").length === 0;
  const disabled = noSkillsDefined || step === 2;

  return (
    <Button disabled={disabled} onClick={onClick}>
      Next
    </Button>
  );
}

function DefineSkills({ step, skills, addSkill, handleText, deleteSkill }) {
  if (step !== 0) return null;

  return (
    <Box className="flex flex-col">
      {skills.map((skill, ind) => (
        <Stack key={`skill-${ind}`} direction="row">
          <SkillField
            index={ind}
            onChange={(e) => handleText(e, ind)}
            value={skill.name}
          />
          <IconButton
            disabled={skills.length <= 1}
            onClick={(e) => deleteSkill(e, ind)}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ))}
      <BtnContainer center>
        <Button startIcon={<AddIcon />} fullWidth onClick={addSkill}>
          ADD A SKILL
        </Button>
      </BtnContainer>
    </Box>
  );
}

function SkillGroupTable({
  selectSkill,
  questions,
  skills,
  step,
  skillAssignments,
}) {
  const cellStyle = { textAlign: "center", padding: "3px" };
  if (skills.length === 0) return null;
  if (step !== 1) return null;
  return (
    <table style={{ width: "800px" }}>
      <thead>
        <tr>
          <th style={{ width: "15%" }}>
            <Typography>Queston #</Typography>
          </th>
          <th style={{ width: "60%" }}>
            <Typography>Prompt / Header</Typography>
          </th>
          <th style={{ width: "25%" }}>
            <Typography>Skill Group</Typography>
          </th>
        </tr>
      </thead>

      <tbody>
        {questions?.map((question, qIndex) => (
          <tr key={question.id}>
            <td style={cellStyle}>
              <Typography>{qIndex + 1}</Typography>
            </td>
            <td style={cellStyle}>
              <Typography>
                {question.prompt || null}
                {/* {parseHTMLandTeX(question?.prompt || question.header || "")} */}
              </Typography>
              <Typography>{question.id}</Typography>
            </td>
            <td style={cellStyle}>
              <FormControl fullWidth>
                <InputLabel>Skill</InputLabel>
                <Select
                  value={skillAssignments[qIndex]}
                  label="Skill"
                  onChange={(e) => selectSkill(e, qIndex)}
                >
                  <MenuItem value="unassigned">
                    <Typography color="textSecondary">unassigned</Typography>
                  </MenuItem>
                  {skills.map((skill, skillIndex) => (
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
  );
}

function GroupSkills({
  step,
  rule,
  handleRule,
  skills,
  skillAssignments,
  handleCompletionValue,
}) {
  const cellStyle = { textAlign: "center", padding: "2px" };
  if (step !== 2) return null;
  return (
    <Box width="800px">
      <FormControl>
        <InputLabel>Completion Rule</InputLabel>
        <Select
          value={rule}
          label="Completion Rule"
          onChange={handleRule}
          sx={{ width: "200px" }}
        >
          <MenuItem value="unassigned">
            <Typography color="textSecondary">unassigned</Typography>
          </MenuItem>
          <MenuItem value="inARow">
            <Typography>in a row</Typography>
          </MenuItem>
          <MenuItem value="totalCorrect">
            <Typography>total correct</Typography>
          </MenuItem>
        </Select>
      </FormControl>
      <Box display="inline-block" width="600px" sx={{ pt: 1 }}>
        <Typography color="primary" sx={{ ml: 2 }}>
          {getHelperText(rule)}
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ mt: 3 }}>
        Threshold Values
      </Typography>
      <table style={{ width: "700px" }}>
        <thead>
          <tr>
            <th style={{ width: "50%" }}>
              <Typography>Skill</Typography>
            </th>
            <th style={{ width: "25%" }}>
              <Typography># Questions</Typography>
            </th>
            <th style={{ width: "25%" }}>
              <Typography>Advance After</Typography>
            </th>
          </tr>
        </thead>

        {skills.map((skill, ind) => (
          <tr key={skill} className="padding-light">
            <td style={cellStyle}>
              <Typography>{skill.name}</Typography>
            </td>
            <td style={cellStyle}>
              <Typography>
                {countAssignedQuestions(skill.name, skillAssignments)}
              </Typography>
            </td>
            <td style={cellStyle}>
              <CompletionValueField
                questionCount={countAssignedQuestions(
                  skill.name,
                  skillAssignments
                )}
                value={skill.completionValue}
                onChange={(e) => handleCompletionValue(e, ind)}
              />
            </td>
          </tr>
        ))}
        <tr className="padding-light" style={{ height: "45px" }}>
          <td style={cellStyle}>
            <Typography>unassigned*</Typography>
          </td>
          <td style={cellStyle}>
            <Typography>
              {countUnassignedQuestions(skillAssignments)}
            </Typography>
          </td>
          <td style={cellStyle}></td>
        </tr>
      </table>
    </Box>
  );
}

function countAssignedQuestions(skillTitle, skillAssignments) {
  if (!Array.isArray(skillAssignments)) return 0;
  const numAssigned = skillAssignments.filter((skill) => skill === skillTitle);
  return numAssigned.length;
}

function countUnassignedQuestions(skillAssignments) {
  if (!Array.isArray(skillAssignments)) return 0;
  const numUnassigned = skillAssignments.filter(
    (skill) => skill === "placeholder"
  );
  return numUnassigned.length;
}

function getHelperText(completeRule) {
  switch (completeRule) {
    case "totalCorrect":
      return "Students must answer a set number of question correctly to advance.";
    case "inARow":
      return "Students must correctly answer some number of questions in a row to advance. Progress restarts when the student answer incorrectly.";
    default:
      return "";
  }
}

function mergeSkillsWithIDs(skills, skillAssignments, qSet) {
  const updatedSkills = skills.map((skill) => {
    const assignedIDs = skillAssignments.map((skillName, ind) =>
      skill.name === skillName ? qSet.questions[ind].id : null
    );
    return {
      ...skill,
      questionIDs: assignedIDs.filter((id) => id), //filter to remove null values
    };
  });

  return updatedSkills;
}
