import { useState, useEffect } from "react";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { DescriptionField, TitleField, UrlField } from "../common/InputFields";
import { addUserLink } from "../../utils/firestoreClient";

export function AddLinkForm({ user, open, handleClose }) {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const values = {
    url,
    title,
    description,
  };

  function handleTitle(e) {
    setTitle(e.target.value);
  }

  function handleDescription(e) {
    setDescription(e.target.value);
  }

  function handleUrl(e) {
    setUrl(e.target.value);
  }

  function handleSubmit() {
    console.log("hello");

    addUserLink(user, values, setSubmitting, handleClose);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setUrl("");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title="Link" />
      <UrlField onChange={handleUrl} value={url} />
      <TitleField onChange={handleTitle} value={title} />
      <DescriptionField onChange={handleDescription} value={description} />
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
