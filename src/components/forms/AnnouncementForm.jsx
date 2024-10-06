import { useState, useEffect } from "react";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { MessageField } from "../common/InputFields";
import {
  addAnnouncement,
  updateAnnouncement,
} from "../../utils/firestoreClient";

export function AnnouncementForm({
  course,
  edit,
  handleClose,
  open,
  selAnncmt,
}) {
  const initVal = edit
    ? {
        message: selAnncmt?.message,
      }
    : { message: "" };

  const add = !edit;
  const [message, setMessage] = useState(initVal.message);
  const [submitting, setSubmitting] = useState(false);

  const values = {
    message: message,
  };

  function handleSubmit() {
    if (add) {
      addAnnouncement(course, values, handleClose, setSubmitting);
    }

    if (edit) {
      updateAnnouncement(course, selAnncmt, values, handleClose, setSubmitting);
    }
  }

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  function resetForm() {
    setMessage(initVal.message);
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader
        title={edit ? "Update Announcement" : "New Announcement"}
      />
      <MessageField value={message} onChange={handleMessage} />
      <br />
      <br />
      <BtnContainer right>
        <SubmitBtn
          label={edit ? "SAVE" : "POST"}
          onClick={handleSubmit}
          disabled={submitting}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}
