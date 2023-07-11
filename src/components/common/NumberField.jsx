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
        const superscripts = preCaretText?.match(/\^(\w|−)+/);
        const subscripts = preCaretText?.match(/_(\w|−)+/);

        if (superscripts?.length > 0) {
          e.preventDefault();
          const textFragment = superscripts[0].slice(1);
          const tempNode = anchorNode.splitText(
            anchorOffset - textFragment.length - 1
          );
          const endNode = tempNode.splitText(textFragment.length + 1);
          endNode.previousSibling.remove();
          const newElem = document.createElement("sup");
          newElem.innerText = textFragment;
          endNode.before(newElem);

          const range = new Range();
          //lastChild is the text node within the new sup element
          range.setStart(newElem.lastChild, newElem.lastChild.data.length);
          range.setEnd(newElem.lastChild, newElem.lastChild.data.length);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }

        if (subscripts?.length > 0) {
          e.preventDefault();
          const textFragment = subscripts[0].slice(1);
          const tempNode = anchorNode.splitText(
            anchorOffset - textFragment.length - 1
          );
          const endNode = tempNode.splitText(textFragment.length + 1);
          endNode.previousSibling.remove();
          const newElem = document.createElement("sub");
          newElem.innerText = textFragment;
          endNode.before(newElem);

          const range = new Range();
          //lastChild is the text node within the new sup element
          range.setStart(newElem.lastChild, newElem.lastChild.data.length);
          range.setEnd(newElem.lastChild, newElem.lastChild.data.length);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        return;
      }
      case "Enter": {
        return;
      }
      case "Minus": {
        if (!e.shiftKey) {
          e.preventDefault();
          insertChar("−");
        }
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
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          suppressContentEditableWarning
        ></div>
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
