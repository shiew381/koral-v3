import { useState, useEffect } from "react";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import { TagField } from "../common/InputFields.jsx";
import { updateSearchSuggestions } from "../../utils/firestoreClient.js";
import { alphabetize } from "../../utils/commonUtils.js";

export function SearchSuggestionForm({
  handleClose,
  libID,
  open,
  searchTerm,
  suggestions,
}) {
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSuggestion(e) {
    setSuggestion(e.target.value);
  }

  function handleKeyPress(e) {
    if (e.code !== "Enter") return;
    if (!suggestion) return;
    handleSubmit();
  }

  function handleSubmit() {
    console.log(suggestion);
    console.log(suggestions);

    const updatedSuggestions = alphabetize([suggestion, ...suggestions]);

    updateSearchSuggestions(
      updatedSuggestions,
      libID,
      setSubmitting,
      handleClose
    );

    setTimeout(() => setSearchFocused(false), 800);
  }

  function resetForm() {
    setSuggestion(searchTerm);
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyPress={handleKeyPress}>
      <LightboxHeader title="Add Search Suggestion" />
      <TagField onChange={handleSuggestion} value={suggestion} />
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
