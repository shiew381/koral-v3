import { useState, useEffect } from "react";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { PointsField, TitleField } from "../common/InputFields";
import { addManualAsgmt } from "../../utils/firestoreClient";
import { Box } from "@mui/material";

export function AddManualGradeColumn({ course, open, handleClose }) {
  const [points, setPoints] = useState(10);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const disabled = !title || submitting;

  const values = {
    title: title,
    totalPointsPossible: points,
  };

  function handleTitle(e) {
    setTitle(e.target.value);
  }

  function handlePoints(e) {
    setPoints(e.target.value);
  }

  function handleSubmit() {
    console.log(values);
    addManualAsgmt(course, values, handleClose, setSubmitting);
  }

  function resetForm() {
    setTitle("");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title="New Gradebook Column" />

      <Box sx={{ maxWidth: "225px", marginTop: "25px" }}>
        <PointsField onChange={handlePoints} value={points} />
      </Box>
      <br />
      <TitleField onChange={handleTitle} value={title} />
      <br />

      <br />
      <BtnContainer right>
        <SubmitBtn
          label="ADD"
          onClick={handleSubmit}
          disabled={disabled}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
