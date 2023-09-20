import { useState, useEffect } from "react";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { SimplePointsField } from "../common/InputFields";

import { Alert, Box, Typography } from "@mui/material";
import { saveManualGrade } from "../../utils/firestoreClient";

export function EditManualGrade({ asgmt, course, open, handleClose }) {
  const initVal = {
    totalPointsAwarded: asgmt?.totalPointsAwarded || 0,
  };
  const [points, setPoints] = useState(initVal.totalPointsAwarded);
  const [submitting, setSubmitting] = useState(false);

  const totalPointsPossible = asgmt?.totalPointsPossible || 10;
  const percentAwarded = (points / totalPointsPossible) * 100;

  const disabled = submitting;

  const docRefParams = {
    courseID: course?.id,
    asgmtID: asgmt?.id,
    userID: asgmt?.userID,
  };

  const values = {
    totalPointsAwarded: points,
    totalPointsPossible: asgmt?.totalPointsPossible,
    type: "manual entry",
  };

  function handlePoints(e) {
    setPoints(e.target.value);
  }

  function handleSubmit() {
    saveManualGrade(docRefParams, values, handleClose, setSubmitting);
  }

  function resetForm() {
    setPoints(initVal.totalPointsAwarded);
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title="Edit Points" />
      <Typography variant="h6" sx={{ pl: "10px" }}>
        {asgmt?.title}
      </Typography>
      <Typography sx={{ pl: "10px" }}>{asgmt?.userDisplayName}</Typography>
      <br />
      {percentAwarded > 100 && (
        <Alert severity="info">Points awarded exceeds points possible</Alert>
      )}

      <br />
      <Box className="flex flex-row flex-center">
        <SimplePointsField onChange={handlePoints} value={points} />
        <Typography
          color="text.secondary"
          sx={{ fontSize: "25px", mx: "18px" }}
        >
          /
        </Typography>
        <Typography>{asgmt?.totalPointsPossible}</Typography>
      </Box>
      <br />

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
