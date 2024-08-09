import { useState, useEffect } from "react";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import { TagField } from "../common/InputFields.jsx";
import { updateAsgmtLabels } from "../../utils/firestoreClient.js";
import { alphabetize } from "../../utils/commonUtils.js";

export function AsgmtLabelForm({ course, handleClose, open, selAsgmt }) {
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleLabel(e) {
    setLabel(e.target.value);
  }

  function handleEnter(e) {
    if (e.code !== "Enter") return;
    if (!label) return;
    handleSubmit();
  }

  function handleSubmit() {
    const existingLabels = selAsgmt.labels || [];
    const updatedLabels = alphabetize([...existingLabels, label]);

    updateAsgmtLabels(
      course,
      selAsgmt,
      updatedLabels,
      handleClose,
      setSubmitting
    );
  }

  function resetForm() {
    setLabel("");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyUp={handleEnter}>
      <LightboxHeader title="Add Label" />
      <TagField onChange={handleLabel} value={label} />
      <br />
      <br />
      <BtnContainer right>
        <SubmitBtn
          label="SAVE"
          disabled={submitting || !label}
          onClick={handleSubmit}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
