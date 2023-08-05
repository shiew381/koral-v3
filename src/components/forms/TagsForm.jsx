import { useState, useEffect } from "react";
// import { TopicField } from "../common/InputFields.jsx";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import { TagField } from "../common/InputFields.jsx";
import { addTags } from "../../utils/firestoreClient.js";
import { alphabetize } from "../../utils/commonUtils.js";

export function TagsForm({
  handleClose,
  libraryID,
  open,
  questionID,
  selQuestion,
}) {
  const [tag, setTag] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleTag(e) {
    setTag(e.target.value);
  }

  function handleKeyPress(e) {
    if (e.code !== "Enter") return;
    if (!tag) return;
    handleSubmit();
  }

  function handleSubmit() {
    const existingTags = selQuestion.tags || [];
    const updatedTags = alphabetize([...existingTags, tag]);

    addTags(updatedTags, libraryID, questionID, handleClose, setSubmitting);
  }

  function resetForm() {
    setTag("");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyPress={handleKeyPress}>
      <LightboxHeader title="Add Tag" />
      <TagField onChange={handleTag} value={tag} />
      <br />
      <br />
      <BtnContainer right>
        <SubmitBtn
          label="SAVE"
          disabled={submitting}
          onClick={handleSubmit}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
