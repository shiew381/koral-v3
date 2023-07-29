import { useState, useEffect } from "react";
import { updateUserQSet } from "../../utils/firestoreClient";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { TitleField } from "../common/InputFields";

export function EditQSetTitleForm({ user, open, qSet, handleClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(qSet?.title);

  const disabled = !title || submitting;

  const values = {
    title,
  };

  function handleKeyUp(e) {
    if (e.code === "Enter") {
      handleSubmit();
    }
  }

  function handleTitle(e) {
    setTitle(e.target.value);
  }

  function handleSubmit() {
    if (!title) return;
    updateUserQSet(user, qSet, values, setSubmitting, handleClose);
  }

  function resetForm() {
    setTitle(qSet?.title);
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyUp={handleKeyUp}>
      <LightboxHeader title="Edit Title" />
      <TitleField onChange={handleTitle} value={title} />
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
