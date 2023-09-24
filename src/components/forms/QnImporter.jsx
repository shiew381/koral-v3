import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { TitleField } from "../common/InputFields.jsx";
import {
  addUserQSet,
  copyLibrayQnToUser,
  getNewestQSet,
  getUserQSets,
} from "../../utils/firestoreClient.js";

export function QnImporter({ checkedQns, handleClose, open, user }) {
  const navigate = useNavigate();
  const [target, setTarget] = useState("new");
  const [title, setTitle] = useState("");
  const [qSets, setQSets] = useState([]);
  const [selQSetID, setSelQSetID] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  function handleSuccess() {
    setSuccess(true);
  }

  function handleSubmit() {
    if (target === "new") {
      const values = {
        title: title,
        questions: checkedQns,
      };
      addUserQSet(user, values, setSubmitting, handleSuccess);
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
        handleSuccess
      );
    }
  }

  async function redirectToQSet() {
    if (target === "existing") {
      const targetQSet = qSets.find((qSet) => qSet.id === selQSetID);
      const targetTitle = encodeURI(targetQSet?.title.replace(/\s/g, "-"));
      const targetID = targetQSet?.id;
      const path = `/content/question-sets/${targetTitle}/${targetID}`;
      navigate(path);
    }

    if (target === "new") {
      getNewestQSet(user.uid).then((qSet) => {
        const targetTitle = encodeURI(qSet?.title.replace(/\s/g, "-"));
        const targetID = qSet?.id;
        const path = `/content/question-sets/${targetTitle}/${targetID}`;
        navigate(path);
      });
    }
  }

  function resetForm() {
    setTarget("new");
    setTitle("");
    setSuccess(false);
  }

  function logMessage() {
    console.log("fetched question sets");
  }

  function handleSelect(e) {
    setSelQSetID(e.target.value);
  }

  useEffect(
    () => {
      getUserQSets(user, setQSets, logMessage);
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
            control={<Radio disabled={success} />}
            label="new question set"
            value="new"
          />
          <FormControlLabel
            control={<Radio disabled={success} />}
            label="existing question set"
            value="existing"
          />
        </RadioGroup>
      </FormControl>
      <br />
      {!success && <br />}
      {target === "new" && !success && (
        <Box sx={{ pl: 3 }}>
          <TitleField onChange={handleTitle} value={title} />
        </Box>
      )}

      {target === "existing" && !success && (
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

      {success ? (
        <Alert>Import successful!</Alert>
      ) : (
        <BtnContainer right>
          <SubmitBtn
            label="SAVE"
            disabled={isDisabled()}
            onClick={handleSubmit}
            submitting={submitting}
          />
        </BtnContainer>
      )}
      {success && (
        <BtnContainer center>
          <Button endIcon={<NavigateNextIcon />} onClick={redirectToQSet}>
            View Question Set
          </Button>
        </BtnContainer>
      )}
    </Lightbox>
  );
}
