import { useState, useEffect } from "react";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import { alphabetize } from "../../utils/commonUtils.js";
import { Alert, Chip, Typography } from "@mui/material";
import { LabelField } from "../common/InputFields.jsx";
import { updateAsgmtLabels } from "../../utils/firestoreClient.js";

export function AsgmtLabelsForm({ course, asgmt, handleClose, open }) {
  const [labels, setLabels] = useState(asgmt?.labels || []);
  const [newLabel, setNewLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const unchanged = asgmt?.labels?.join("") === labels.join("");

  function handleLabel(e) {
    setNewLabel(e.target.value);
    setError(false);
  }

  function handleDelete(selIndex) {
    const updatedLabels = labels.filter((el, ind) => ind !== selIndex);
    setLabels(updatedLabels);
    setError(false);
  }

  function handleClick() {
    const labelsCopy = [...labels];
    const tagAlreadyExists = labelsCopy.includes(newLabel);

    if (tagAlreadyExists) {
      setError(true);
      return;
    } else {
      setLabels(alphabetize([...labelsCopy, newLabel]));
      setNewLabel("");
    }
  }

  function handleEnter(e) {
    const labelsCopy = [...labels];
    const tagAlreadyExists = labelsCopy.includes(newLabel);
    if (e.key === "Enter" && tagAlreadyExists) {
      setError(true);
      return;
    }

    if (e.key === "Enter") {
      setLabels(alphabetize([...labelsCopy, newLabel]));
      setNewLabel("");
    }
  }

  function handleSubmit() {
    const values = {
      labels: labels,
    };

    console.log(values);
    console.log(course);

    updateAsgmtLabels(course, asgmt, values, handleClose, setSubmitting);
  }

  useEffect(() => setLabels(asgmt?.labels || []), [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyUp={handleEnter}>
      <LightboxHeader title="Edit Labels" />
      <LabelField
        value={newLabel}
        onChange={handleLabel}
        handleClick={handleClick}
      />

      {labels?.length > 0 ? (
        <div>
          {labels?.map((label, ind) => (
            <Chip
              key={label}
              label={label}
              onDelete={() => handleDelete(ind)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </div>
      ) : (
        <div style={{ padding: "6px" }}>
          <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
            no labels yet
          </Typography>
        </div>
      )}

      {error ? (
        <Alert severity="info" sx={{ my: 2 }}>
          <strong>{newLabel}</strong> already exists
        </Alert>
      ) : (
        <div style={{ height: "20px" }}></div>
      )}
      <br />
      <BtnContainer right>
        <SubmitBtn
          disabled={unchanged || submitting}
          label="SAVE"
          onClick={handleSubmit}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
