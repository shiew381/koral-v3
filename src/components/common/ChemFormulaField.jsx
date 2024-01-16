import { useState } from "react";
import { handleArrowLeft } from "../../utils/editorUtils.js";
import { BtnGroupScript, EditorLabel } from "./EditorCpnts";

import { Box } from "@mui/material";
import "../../css/Editor.css";

export function ChemFormulaField({
  currentResponse,
  fieldRef,
  id,
  label,
  setCurrentResponse,
  toolbarOptions,
}) {
  const [editorActive, setEditorActive] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  function handleBlur(e) {
    if (e.relatedTarget?.classList?.contains("editor-btn")) {
      return;
    }
    setEditorActive(false);
    setActiveGroup(null);
  }

  function handleFocus() {
    setEditorActive(true);
  }

  function handleFormat(tagName) {
    const sel = document.getSelection();
    const selRange = sel.getRangeAt(0);
    const startContainer = selRange.startContainer;
    const startOffset = selRange.startOffset;
    const endContainer = selRange.endContainer;
    const endOffset = selRange.endOffset;
    const commonAncestorContainer = selRange.commonAncestorContainer;
    const isSingleTextNode = commonAncestorContainer.nodeType === 3;
    const formatted = startContainer.parentElement.tagName === tagName;

    if (selRange.collapsed && formatted) {
      const nodeData = startContainer.data;
      const preText = nodeData.substring(0, sel.anchorOffset);
      const postText = nodeData.substring(sel.focusOffset, nodeData.length);

      const textNode = document.createTextNode(" ");

      startContainer.parentElement.replaceWith(textNode);

      if (preText) {
        const preElem = document.createElement(tagName);
        preElem.append(preText);
        textNode.before(preElem);
      }

      if (postText) {
        const postElem = document.createElement(tagName);
        const nextSibling = textNode.nextSibling;
        postElem.append(postText);
        textNode.parentElement.insertBefore(postElem, nextSibling);
      }

      selectNewRange(textNode);

      textNode.parentElement.normalize();
      return;
    }

    if (selRange.collapsed) {
      return;
    }

    if (isSingleTextNode) {
      const touchesStart = startOffset === 0;
      const touchesEnd = selRange.endOffset === endContainer.length;

      if (!formatted) {
        const selText = selRange.toString();
        const prevSibling = startContainer.previousSibling;
        const nextSibling = endContainer.nextSibling;
        const prevSiblingSharesTag = prevSibling?.tagName === tagName;
        const nextSiblingSharesTag = nextSibling?.tagName === tagName;
        const newElem = document.createElement(tagName);

        if (!touchesStart && !touchesEnd) {
          selRange.surroundContents(newElem);
          selectNewRange(newElem.firstChild);
          return;
        }

        if (touchesEnd && !nextSiblingSharesTag) {
          selRange.surroundContents(newElem);
          selectNewRange(newElem.firstChild);
          return;
        }

        if (touchesStart && !prevSiblingSharesTag) {
          selRange.surroundContents(newElem);
          selectNewRange(newElem.firstChild);
          return;
        }

        if (
          touchesStart &&
          touchesEnd &&
          nextSiblingSharesTag &&
          prevSiblingSharesTag
        ) {
          const combinedText =
            prevSibling?.innerText + selText + nextSibling?.innerText;
          const startPos = prevSibling?.innerText.length;
          const endPos = prevSibling?.innerText.length + selText.length;
          newElem.append(combinedText);
          prevSibling?.replaceWith(newElem);
          nextSibling?.remove();
          selRange.deleteContents();
          selectNewRange(newElem.firstChild, startPos, endPos);
          return;
        }

        if (touchesStart && !touchesEnd && prevSiblingSharesTag) {
          const combinedText = prevSibling?.innerText + selText;
          const startPos = prevSibling?.innerText.length;
          const endPos = combinedText.length;
          newElem.append(combinedText);
          prevSibling?.replaceWith(newElem);
          selRange.deleteContents();
          selectNewRange(newElem.firstChild, startPos, endPos);
          return;
        }

        if (!touchesStart && touchesEnd && nextSiblingSharesTag) {
          const combinedText = selText + nextSibling?.innerText;
          const startPos = 0;
          const endPos = selText.length;
          newElem.append(combinedText);
          nextSibling?.replaceWith(newElem);
          selRange.deleteContents();
          selectNewRange(newElem.firstChild, startPos, endPos);
          return;
        }

        return;
      }

      if (formatted) {
        const nodeData = startContainer.data;
        const preText = nodeData.substring(0, sel.anchorOffset);
        const postText = nodeData.substring(sel.focusOffset, nodeData.length);
        const selText = selRange.toString();
        const textNode = document.createTextNode(selText);

        startContainer.parentElement.replaceWith(textNode);

        if (preText) {
          const preElem = document.createElement(tagName);
          preElem.append(preText);
          textNode.before(preElem);
        }

        if (postText) {
          const postElem = document.createElement(tagName);
          const nextSibling = textNode.nextSibling;
          postElem.append(postText);
          textNode.parentElement.insertBefore(postElem, nextSibling);
        }

        selectNewRange(textNode);
        textNode.parentElement.normalize();
        return;
      }
    }

    if (!isSingleTextNode) {
      const invalidSelection =
        startContainer.nodeType !== 3 ||
        endContainer.nodeType !== 3 ||
        commonAncestorContainer.firstChild.tagName === "DIV";

      if (invalidSelection) {
        return;
      }

      const startSharesWrapper =
        startContainer?.parentElement?.tagName === tagName;
      const endSharesWrapper = endContainer?.parentElement?.tagName === tagName;
      const originalLength = selRange.toString().length;

      if (startSharesWrapper) {
        selRange.setStartBefore(startContainer);
      } else {
        selRange.setStart(startContainer, startOffset);
      }

      if (endSharesWrapper) {
        selRange.setEndAfter(endContainer);
      } else {
        selRange.setEnd(endContainer, endOffset);
      }

      const newElem = document.createElement(tagName);
      const newString = selRange.toString();
      newElem.append(newString);

      if (startSharesWrapper) {
        const startPos = startOffset;
        const endPos = newString.length;

        selRange.startContainer.previousSibling.after(newElem);
        selRange.deleteContents();
        selectNewRange(newElem.firstChild, startPos, endPos);
        removeEmptyTags(tagName);
        return;
      }

      if (!startSharesWrapper) {
        const fragment = startContainer.splitText(startOffset);
        const prevSibling = fragment.previousSibling;
        const startPos = 0;
        const endPos = originalLength;

        selRange.deleteContents();
        prevSibling.after(newElem);
        selectNewRange(newElem.firstChild, startPos, endPos);
        removeEmptyTags(tagName);
        return;
      }
    }
  }

  function handleArrowRight(anchorNode, anchorOffset, elem) {
    const nextElem = elem.nextSibling;
    // const newTextNode = document.createTextNode("");
    const newTextNode = document.createTextNode("\u00A0");
    const newSpan = document.createElement("span");
    newSpan.appendChild(newTextNode);
    // newSpan.style.backgroundColor = "red";
    newSpan.style.position = "relative";
    newSpan.style.left = "-4px";
    newSpan.classList.add("temp-input-elem");

    if (anchorOffset < anchorNode.data?.length) {
      return;
    }

    if (nextElem?.nodeType !== 3) {
      return;
    } else if (nextElem?.nodeType === 3 && nextElem?.data.length === 0) {
      elem.after(newSpan);
    } else {
      return;
    }
  }

  function handleKeyDown(e) {
    const selection = document.getSelection();
    const anchorNode = selection.anchorNode;
    const parent = anchorNode?.parentElement;
    const anchorOffset = selection.anchorOffset;

    // skip if e.key is Tab, CapsLock, or other non-character key
    if (e.key.length === 1 && parent.nodeName === "SPAN") {
      const newTextNode = document.createTextNode(e.key);
      const range = new Range();
      const sel = document.getSelection();
      e.preventDefault();
      parent.after(newTextNode);
      parent.remove();
      range.setStart(newTextNode, 1);
      range.setEnd(newTextNode, 1);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }

    switch (e.code) {
      case "Backspace": {
        return;
      }
      case "ArrowRight": {
        if (parent.tagName === "SUP" || parent.tagName === "SUB") {
          const elem = parent;
          //   e.preventDefault();
          handleArrowRight(anchorNode, anchorOffset, elem);
          return;
        }

        return;
      }
      case "ArrowLeft": {
        if (parent.tagName === "SUP" || parent.tagName === "SUB") {
          const elem = parent;
          handleArrowLeft(anchorNode, anchorOffset, elem);
          return;
        }
        return;
      }
      case "Space": {
        const preCaretText = anchorNode.data?.slice(0, anchorOffset);
        const superscripts = preCaretText.match(/\^(\w|-|\+)+/);
        const subscripts = preCaretText.match(/_(\w|-)+/);
        const longUnderline = preCaretText.match(/_{2,10}/);

        // return if long series of underscores (user probably intends fill-in-the-blank)
        if (longUnderline?.length > 0) {
          return;
        }

        if (superscripts?.length > 0) {
          e.preventDefault();
          const textFragment = superscripts[0].slice(1);
          const tempNode = anchorNode.splitText(
            anchorOffset - textFragment.length - 1
          );
          const endNode = tempNode.splitText(textFragment.length + 1);
          endNode.previousSibling.remove();
          const newElem = document.createElement("sup");
          newElem.innerText = textFragment.replace("-", "−");
          endNode.before(newElem);

          const range = new Range();
          range.setStart(newElem.firstChild, textFragment.length);
          range.setEnd(newElem.firstChild, textFragment.length);
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
          newElem.innerText = textFragment.replace("-", "−");
          endNode.before(newElem);

          const range = new Range();
          //lastChild is the text node within the new sub element
          range.setStart(newElem.firstChild, textFragment.length);
          range.setEnd(newElem.firstChild, textFragment.length);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        return;
      }
      case "Enter": {
        //prevent new line
        e.preventDefault();
        return;
      }
      case "Minus": {
        return;
      }
      default: {
        return;
      }
    }
  }

  function handleKeyUp() {
    setCurrentResponse({
      ...currentResponse,
      formula: fieldRef.current?.innerHTML,
    });
  }

  function removeEmptyTags(tagName) {
    const nodeList = fieldRef.current.querySelectorAll(tagName);
    nodeList.forEach((node) => {
      if (!node.innerText) {
        node.remove();
      }
    });

    fieldRef.current.normalize();
  }

  function selectNewRange(elem, startPos, endPos) {
    const selection = document.getSelection();
    const range = new Range();

    if (!startPos && !endPos) {
      range.selectNodeContents(elem);
    }

    if (typeof startPos === "number" && typeof endPos === "number") {
      range.setStart(elem, startPos);
      range.setEnd(elem, endPos);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  return (
    <>
      <Toolbar
        activeGroup={activeGroup}
        disabled={!editorActive}
        handleFormat={handleFormat}
        toolbarOptions={toolbarOptions}
      />
      <Box
        className="editor-container"
        onBlur={handleBlur}
        onFocus={handleFocus}
      >
        <EditorLabel label={label} handleClick={() => setActiveGroup(null)} />
        <div
          className="editor-content-area editor-content"
          contentEditable
          ref={fieldRef}
          id={id}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          suppressContentEditableWarning
        ></div>
      </Box>
    </>
  );
}

function Toolbar({ activeGroup, disabled, handleFormat, toolbarOptions }) {
  const showScript =
    !activeGroup && toolbarOptions.includes("superscript/subscript");

  return (
    <div>
      {showScript && (
        <BtnGroupScript disabled={disabled} handleFormat={handleFormat} />
      )}
    </div>
  );
}
