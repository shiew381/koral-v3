import { useState, useEffect } from "react";
// import { TopicField } from "../common/InputFields.jsx";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import { TagField } from "../common/InputFields.jsx";
import { addTag } from "../../utils/firestoreClient.js";

export function TagsForm({ handleClose, libraryID, open, questionID }) {
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
    console.log("submitting");
    console.log(libraryID);
    console.log(questionID);
    addTag(tag, libraryID, questionID, handleClose, setSubmitting);
    //check if subject area already exists
    // addTopic(topic, subject, userInfo, handleClose, setSubmitting);
  }

  function resetForm() {
    setTag("");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyPress={handleKeyPress}>
      <LightboxHeader title="New Tag" />
      <TagField onChange={handleTag} value={tag} />
      <br />
      <br />
      <BtnContainer right>
        <SubmitBtn
          label="ADD"
          disabled={submitting}
          onClick={handleSubmit}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
