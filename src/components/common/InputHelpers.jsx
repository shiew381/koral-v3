import { Chip, Tab, Tabs, TextField } from "@mui/material";
import { useState } from "react";
import { alphabetize } from "../../utils/commonUtils";

function sortOptions(options, selCategory) {
  const filtered =
    options
      ?.filter((option) => option.category === selCategory)
      ?.map((el) => el.value) || [];

  return alphabetize(filtered);
}

export default function HelperTextOptions({
  inputId,
  inputRef,
  mode,
  options,
  setCurrentResponse,
  setHelperOptions,
}) {
  // value refers to the current text in the input field

  const [tabIndex, setTabIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const categories = options.map((option) => option.category);
  const uniqueCategories = [...new Set(categories)];
  const selCategory = uniqueCategories[tabIndex];

  const shownOptions = sortOptions(options, selCategory);

  function selectTab(e, newIndex) {
    if (mode !== "preview") {
      const elem = document.getElementById(inputId);
      const selStart = elem.selectionStart;
      const selEnd = elem.selectionEnd;
      elem.setSelectionRange(selStart, selEnd);
      elem.focus();
    }

    setTabIndex(newIndex);
  }

  function handleDelete(selOption) {
    const updatedOptions = options.filter(
      (option) =>
        !(option.category === selCategory && option.value === selOption)
    );
    setHelperOptions(updatedOptions);
  }

  function handleInsert(textFrag) {
    const value = inputRef.current.value;

    const elem = document.getElementById(inputId);
    const selStart = elem.selectionStart;
    const selEnd = elem.selectionEnd;
    const textBefore = value.slice(0, selStart);
    const textAfter = value.slice(selEnd, value.length - 1);
    const newSelPos = textBefore.length + textFrag.length;

    inputRef.current.value = textBefore + textFrag + textAfter;
    if (mode === "test" || mode === "course") {
      setCurrentResponse({ text: textBefore + textFrag + textAfter });
    }

    elem.setSelectionRange(newSelPos, newSelPos);
    elem.focus();
  }

  function handleKeyUp(e) {
    console.log(e.target.value);
    const elem = document.getElementById("new-helper-option");
    console.dir(elem.value);
    if (e.key === "Enter") {
      setHelperOptions((prev) => [
        ...prev,
        { value: e.target.value, category: selCategory },
      ]);
      elem.value = "";
      setAdding(false);
    }
  }

  return (
    <div>
      <Tabs
        centered
        indicatorColor={false}
        value={tabIndex}
        onChange={selectTab}
      >
        {uniqueCategories.map((category) => (
          <Tab label={category} key={category} />
        ))}
      </Tabs>

      <div style={{ paddingTop: "10px", textAlign: "center" }}>
        {shownOptions.map((option) => (
          <Chip
            disabled={mode === "preview"}
            label={option}
            key={option}
            onClick={mode === "builder" ? null : () => handleInsert(option)}
            onDelete={mode === "builder" ? () => handleDelete(option) : null}
            sx={{ mb: "3px", mr: "3px" }}
          />
        ))}
        {mode === "builder" && !adding ? (
          <Chip
            color="primary"
            label="+ option"
            variant="outlined"
            onClick={() => setAdding(true)}
          />
        ) : null}
        {mode === "builder" && adding ? (
          <TextField
            sx={{ width: "130px", ml: "5px" }}
            id="new-helper-option"
            onKeyUp={handleKeyUp}
            variant="standard"
          />
        ) : null}
      </div>
    </div>
  );
}
