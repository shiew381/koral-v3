import { Chip, Tab, Tabs } from "@mui/material";
import { useState } from "react";

export default function HelperTextOptions({
  id,
  options,
  inputRef,
  mode,
  setCurrentResponse,
}) {
  // value referes to the current text in the input field
  const categories = options.map((option) => option.category);
  const uniqueCategories = [...new Set(categories)];
  const [tabIndex, setTabIndex] = useState(0);
  const selCategory = uniqueCategories[tabIndex];
  const shownOptions = options
    .filter((option) => option.category === selCategory)
    .map((el) => el.value);

  function selectTab(e, newIndex) {
    setTabIndex(newIndex);
  }

  function handleInsert(textFrag) {
    const value = inputRef.current.value;

    const elem = document.getElementById(id);
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

  return (
    <div>
      <Tabs
        indicatorColor=""
        value={tabIndex}
        onChange={selectTab}
        variant="scrollable"
      >
        {uniqueCategories.map((category) => (
          <Tab label={category} key={category} />
        ))}
      </Tabs>

      <div style={{ paddingTop: "10px" }}>
        {shownOptions.map((option) => (
          <Chip
            label={option}
            key={option}
            onClick={() => handleInsert(option)}
            sx={{ mb: "3px", mr: "3px" }}
          />
        ))}
      </div>
    </div>
  );
}
