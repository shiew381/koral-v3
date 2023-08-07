import { useState, useEffect } from "react";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import { TitleField } from "../common/InputFields.jsx";
import {
  addUserQSet,
  copyLibrayQnToUser,
  getUserQSets,
} from "../../utils/firestoreClient.js";

export function QnImporter({ checkedQns, handleClose, open, user }) {
  const [target, setTarget] = useState("new");
  const [title, setTitle] = useState("");
  const [qSets, setQSets] = useState([]);
  const [selQSetID, setSelQSetID] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function isDisabled() {
    if (submitting) {
      return true;
    }

    if (target === "new" && !title) {
      return true;
    }

    if (target === "existing" && !selQSetID) {
      return true;
    }

    return false;
  }

  function handleTitle(e) {
    setTitle(e.target.value);
  }

  function handleType(e) {
    setTarget(e.target.value);
  }

  function handleSubmit() {
    if (target === "new") {
      const values = {
        title: title,
        questions: checkedQns,
      };
      addUserQSet(user, values, setSubmitting, handleClose);
    }

    if (target === "existing") {
      const foundQSet = qSets.find((qSet) => qSet.id === selQSetID);
      const questions = foundQSet.questions;
      const updatedQuestions = [...questions, ...checkedQns];
      const refParams = { userID: user.uid, qSetID: selQSetID };

      copyLibrayQnToUser(
        updatedQuestions,
        refParams,
        setSubmitting,
        handleClose
      );
    }
  }

  function resetForm() {
    setTarget("new");
  }

  function dummy() {
    console.log("skip");
  }

  function handleSelect(e) {
    setSelQSetID(e.target.value);
  }

  useEffect(
    () => {
      getUserQSets(user, setQSets, dummy);
    },
    //eslint-disable-next-line
    [target]
  );

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title="Copy Questions" />
      <FormControl sx={{ px: 2 }}>
        <FormLabel>copy to...</FormLabel>
        <RadioGroup value={target} onChange={handleType}>
          <FormControlLabel
            control={<Radio />}
            label="new question set"
            value="new"
          />
          <FormControlLabel
            control={<Radio />}
            label="existing question set"
            value="existing"
          />
        </RadioGroup>
      </FormControl>
      <br />
      <br />
      {target === "new" && (
        <Box sx={{ pl: 3 }}>
          <TitleField onChange={handleTitle} value={title} />
        </Box>
      )}

      {target === "existing" && (
        <Box sx={{ pl: 3 }}>
          <FormControl>
            <InputLabel>Question Set</InputLabel>
            <Select
              label="Question Set"
              onChange={handleSelect}
              sx={{ mr: "15px", minWidth: "160px" }}
              value={selQSetID}
            >
              {qSets.map((qSet) => (
                <MenuItem key={qSet.id} value={qSet.id}>
                  {qSet.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <br />
      <BtnContainer right>
        <SubmitBtn
          label="SAVE"
          disabled={isDisabled()}
          onClick={handleSubmit}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
