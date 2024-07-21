import { useState } from "react";
import {
  EditorLabel,
  EquationTab,
  FractionTemplateBtn,
  SqrtTemplateBtn,
  Symbols,
} from "./EditorCpnts";
import { Box } from "@mui/material";
import {
  backspaceEqElem,
  deleteEqElem,
  handleArrowLeft,
  handleArrowRight,
  insertChar,
  insertFraction,
  insertSqrt,
} from "../../utils/editorUtils";
import { transcendentals } from "../../lists/transcendentals";
import "../../css/Editor.css";

export function NumberField({
  id,
  currentResponse,
  numberRef,
  setCurrentResponse,
}) {
  //TODO: currentResponse does not update when inserting symbols...need to handle button press
  const [editorActive, setEditorActive] = useState(false);

  function handleBlur(e) {
    if (e.relatedTarget?.classList?.contains("editor-btn")) {
      return;
    }
    setEditorActive(false);
  }

  function handleClear() {
    numberRef.current.innerHTML = "";
    numberRef.current.focus();
  }

  function handleFocus() {
    setEditorActive(true);
  }

  function handleKeyUp() {
    setCurrentResponse({
      ...currentResponse,
      number: numberRef.current?.innerHTML,
    });
  }

  function handleKeyDown(e) {
    const selection = document.getSelection();
    const anchorNode = selection.anchorNode;
    const parent = anchorNode?.parentElement;
    const grandParent = parent?.parentElement;
    const greatGrandParent = grandParent?.parentElement;
    const anchorOffset = selection.anchorOffset;

    switch (e.code) {
      case "Backspace": {
        const prevElem = anchorNode.previousSibling;
        backspaceEqElem(anchorNode, anchorOffset, prevElem);
        return;
      }
      case "Delete": {
        const nextElem = anchorNode.nextSibling;
        deleteEqElem(anchorNode, anchorOffset, nextElem);
        return;
      }
      case "ArrowRight": {
        if (
          parent.tagName === "SUP" ||
          parent.tagName === "SUB" ||
          parent.classList?.contains("eq-fraction")
        ) {
          const elem = parent;
          handleArrowRight(anchorNode, anchorOffset, elem);
          return;
        }

        if (
          parent.classList?.contains("eq-numerator") ||
          parent.classList?.contains("eq-denominator") ||
          parent.classList?.contains("eq-sqrt-main")
        ) {
          const elem = grandParent;
          handleArrowRight(anchorNode, anchorOffset, elem);
          return;
        }

        if (parent.classList?.contains("eq-sqrt-arg")) {
          const elem = greatGrandParent;
          handleArrowRight(anchorNode, anchorOffset, elem);
          return;
        }

        return;
      }
      case "ArrowLeft": {
        if (
          parent.tagName === "SUP" ||
          parent.tagName === "SUB" ||
          parent.classList?.contains("eq-fraction")
        ) {
          const elem = parent;
          handleArrowLeft(anchorNode, anchorOffset, elem);
          return;
        }

        if (
          parent.classList?.contains("eq-numerator") ||
          parent.classList?.contains("eq-denominator") ||
          parent.classList?.contains("eq-sqrt-main")
        ) {
          const elem = grandParent;
          handleArrowLeft(anchorNode, anchorOffset, elem);
          return;
        }

        if (parent.classList?.contains("eq-sqrt-arg")) {
          const elem = greatGrandParent;
          handleArrowLeft(anchorNode, anchorOffset, elem);
          return;
        }

        return;
      }
      case "Space": {
        const anchorNode = selection.anchorNode;
        const anchorOffset = selection.anchorOffset;

        const preCaretText = anchorNode.data?.slice(0, anchorOffset);
        const postCaretText = anchorNode.data?.slice(
          anchorOffset,
          anchorNode.data.length
        );
        const superscripts = preCaretText?.match(/\^(\w|−)+/);
        const subscripts = preCaretText?.match(/_(\w|−)+/);

        if (superscripts?.length > 0) {
          e.preventDefault();
          const range = new Range();
          const argText = superscripts[0];
          const argIndex = preCaretText.indexOf(argText);
          const preArgText = preCaretText.slice(0, argIndex);
          const postArgText = preCaretText.slice(
            argIndex + argText.length,
            preCaretText.length
          );
          const argTextNode = document.createTextNode(
            argText.slice(1).replace("-", "−")
          );
          const preArgTextNode = document.createTextNode(preArgText);
          const postArgTextNode = document.createTextNode(postArgText);
          const postCaretTextNode =
            postCaretText.length > 0
              ? document.createTextNode(postCaretText)
              : document.createTextNode("\u00A0");

          const newSup = document.createElement("sup");
          newSup.appendChild(argTextNode);
          anchorNode.replaceWith(preArgTextNode);
          preArgTextNode.after(newSup);
          newSup.after(postArgTextNode);
          postArgTextNode.after(postCaretTextNode);

          range.setStart(postArgTextNode, postArgText.length);
          range.setEnd(postArgTextNode, postArgText.length);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }

        if (subscripts?.length > 0) {
          e.preventDefault();
          const range = new Range();
          const argText = subscripts[0];
          const argIndex = preCaretText.indexOf(argText);
          const preArgText = preCaretText.slice(0, argIndex);
          const postArgText = preCaretText.slice(
            argIndex + argText.length,
            preCaretText.length
          );
          const argTextNode = document.createTextNode(argText.slice(1));
          const preArgTextNode = document.createTextNode(preArgText);
          const postArgTextNode = document.createTextNode(postArgText);
          const postCaretTextNode =
            postCaretText.length > 0
              ? document.createTextNode(postCaretText)
              : document.createTextNode("\u00A0");

          const newSub = document.createElement("sub");
          newSub.appendChild(argTextNode);
          anchorNode.replaceWith(preArgTextNode);
          preArgTextNode.after(newSub);
          newSub.after(postArgTextNode);
          postArgTextNode.after(postCaretTextNode);

          range.setStart(postArgTextNode, postArgText.length);
          range.setEnd(postArgTextNode, postArgText.length);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        return;
      }
      case "Enter": {
        e.preventDefault();
        return;
      }
      case "Minus": {
        if (!e.shiftKey) {
          e.preventDefault();
          insertChar("−");
        }
        return;
      }
      case "KeyX": {
        e.preventDefault();
        insertChar("×");
        return;
      }
      default:
        return;
    }
  }

  return (
    <>
      <NumberToolbar
        disabled={!editorActive}
        setCurrentResponse={setCurrentResponse}
        numberRef={numberRef}
      />
      <Box
        className="editor-container"
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <EditorLabel label="number" />
        <div
          className={`editor-content-area editor-content number-field equation-container`}
          contentEditable
          ref={numberRef}
          id={id}
          key={id}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          suppressContentEditableWarning
        ></div>
        <div className="clear-field" onClick={handleClear}>
          clear
        </div>
      </Box>
    </>
  );
}

function NumberToolbar({ disabled, numberRef, setCurrentResponse }) {
  //TODO: return focus to numberfield on tab change
  const [tab, setTab] = useState("templates");

  function handleTab(event) {
    const value = event.target.attributes.value.nodeValue;
    setTab(value);
    numberRef.current.focus();
  }

  if (disabled) {
    return null;
  }

  return (
    <div style={{ position: "absolute", top: "-90px" }}>
      <div>
        <EquationTab handleTab={handleTab} tab={tab} value="templates" />
        <EquationTab handleTab={handleTab} tab={tab} value="symbols" />
      </div>
      {tab === "templates" && (
        <div className="eq-symbols-container">
          <FractionTemplateBtn
            caption="fraction"
            onClick={() => {
              insertFraction();
              setCurrentResponse({ number: numberRef.current.innerHTML });
            }}
          />
          <SqrtTemplateBtn caption="square root" onClick={insertSqrt} />
        </div>
      )}
      {tab === "symbols" && (
        <Symbols
          chars={[...transcendentals, { symbol: "°", caption: "degrees" }]}
          insertChar={insertChar}
        />
      )}
    </div>
  );
}
