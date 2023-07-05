import { useState, useEffect } from "react";
import { addUserQSet } from "../../utils/firestoreClient";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { TitleField } from "../common/InputFields";

export function AddQSetForm({ user, open, handleClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");

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
    addUserQSet(user, values, setSubmitting, handleClose);
  }

  function resetForm() {
    setTitle("");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyUp={handleKeyUp}>
      <LightboxHeader title="Question Set" />
      <TitleField onChange={handleTitle} value={title} />
      <BtnContainer right>
        <SubmitBtn
          label="ADD"
          onClick={handleSubmit}
          disabled={submitting}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
