import { useState, useEffect } from "react";
import { useStorage } from "../../hooks/useStorage.js";
import { storage } from "../../config/firebaseConfig.js";
import { ref, deleteObject } from "firebase/storage";
import { getFileExtension } from "../../utils/fileUtils.js";
import {
  backspaceEqElem,
  deleteEqElem,
  handleArrowLeft,
  handleArrowRight,
  insertChar,
  insertImage,
  insertEquation,
  insertFraction,
  insertList,
  insertParentheses,
  insertSqrt,
  insertVector,
} from "../../utils/editorUtils.js";
import {
  BtnGroupEquation,
  BtnGroupFontStyle,
  BtnGroupImage,
  BtnGroupList,
  BtnGroupScript,
  EquationTab,
  FractionTemplateBtn,
  ParenTemplateBtn,
  SqrtTemplateBtn,
  Symbols,
  VectorTemplateBtn,
  EditorLabel,
} from "./EditorCpnts";
import { greekLowercase, greekUppercase } from "../../lists/greekLetters.js";
import { arrows } from "../../lists/arrows";
import { mathSymbols } from "../../lists/mathSymbols";
import { Box, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../css/Editor.css";

export function Editor({
  editorRef,
  id,
  imagePath,
  label,
  onImageDeleteSuccess,
  onImageUploadSuccess,
  toolbarOptions,
}) {
  const [editorActive, setEditorActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  // const [error, setError] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);
  const [action, setAction] = useState("");
  const [initParam, setInitParam] = useState(null);
  const [initCoord, setInitCoord] = useState(null);
  const [currentCoord, setCurrentCoord] = useState(null);
  const dX = currentCoord?.x - initCoord?.x;
  const dY = currentCoord?.y - initCoord?.y;

  function deleteImage() {
    const imgElem = editorRef.current.querySelector(`#${activeGroup.id}-img`);
    const url = imgElem.getAttribute("src");

    const storageRef = ref(storage, url);

    deleteObject(storageRef)
      .then(() => console.log("object deleted from storage"))
      .then(() => imgElem.parentElement.remove())
      .then(() => setTimeout(() => onImageDeleteSuccess(), 200))
      .catch((error) => console.log(error));
    setActiveGroup(null);
    setActiveTarget(null);
  }

  function displayImageResizeHandles(target) {
    const groupID = target.id.slice(0, 4);

    function applyHandleAttributes(element) {
      element.classList.add("img-resize-handle");
      element.classList.add(groupID);
    }

    const imgElem = target;
    const imgContainerElem = target.parentElement;
    const containerWidth = imgContainerElem.clientWidth;
    const imgWidth = imgElem.clientWidth;
    const imgHeight = imgElem.clientHeight;

    const leftMargin = (containerWidth - imgWidth) / 2;

    const initPos = {
      top: "0px",
      bottom: `${imgHeight - 4}px`,
      left: `${leftMargin - 13}px`,
      right: `${leftMargin + imgWidth - 16}px`,
    };

    const newHandle1 = document.createElement("div");
    newHandle1.setAttribute("id", `${groupID}-1`);
    newHandle1.style.top = initPos.top;
    newHandle1.style.left = initPos.left;
    newHandle1.style.cursor = "nw-resize";
    applyHandleAttributes(newHandle1);

    const newHandle2 = document.createElement("div");
    newHandle2.setAttribute("id", `${groupID}-2`);

    newHandle2.style.top = initPos.top;
    newHandle2.style.left = initPos.right;
    newHandle2.style.cursor = "sw-resize";
    applyHandleAttributes(newHandle2);

    const newHandle3 = document.createElement("div");
    newHandle3.setAttribute("id", `${groupID}-3`);
    newHandle3.style.top = initPos.bottom;
    newHandle3.style.left = initPos.left;
    newHandle3.style.cursor = "sw-resize";
    applyHandleAttributes(newHandle3);

    const newHandle4 = document.createElement("div");
    newHandle4.setAttribute("id", `${groupID}-4`);
    newHandle4.style.top = initPos.bottom;
    newHandle4.style.left = initPos.right;
    newHandle4.style.cursor = "nw-resize";
    applyHandleAttributes(newHandle4);

    imgElem.after(newHandle4);
    imgElem.after(newHandle3);
    imgElem.after(newHandle2);
    imgElem.after(newHandle1);
  }

  function handleBlur(e) {
    if (
      activeGroup?.type === "equation" &&
      e.relatedTarget?.classList?.contains("editor-btn")
    ) {
      const selection = window.getSelection();

      const anchorNode = selection.anchorNode;
      const anchorOffset = selection.anchorOffset;

      const range = new Range();
      range.setStart(anchorNode, anchorOffset);
      range.setEnd(anchorNode, anchorOffset);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    if (activeGroup?.type === "equation") {
      return;
    }

    if (e.relatedTarget?.classList?.contains("editor-btn")) {
      return;
    }

    setEditorActive(false);
    removeImageResizeHandles();
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

    if (selRange.collapsed) {
      return;
    }

    if (isSingleTextNode) {
      const formatted = startContainer.parentElement.tagName === tagName;
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

  function handleKeyDown(e) {
    const selection = document.getSelection();
    const anchorNode = selection.anchorNode;
    const parent = anchorNode?.parentElement;
    const grandParent = parent?.parentElement;
    const greatGrandParent = grandParent?.parentElement;
    const anchorOffset = selection.anchorOffset;

    switch (e.code) {
      case "Backspace": {
        const prevElem = anchorNode?.previousSibling;

        if (prevElem?.classList?.contains("equation-container")) {
          prevElem.remove();
          return;
        }

        if (prevElem?.classList?.contains("img-container")) {
          const groupID = prevElem.id.slice(0, 4);
          e.preventDefault();
          selectImageGroup(groupID);
          displayImageResizeHandles(prevElem.firstChild);
          return;
        }
        if (prevElem?.classList?.contains("eq-elem")) {
          backspaceEqElem(anchorNode, anchorOffset, prevElem);
          return;
        }
        return;
      }
      case "Delete": {
        const nextElem = anchorNode?.nextSibling;
        if (nextElem?.classList?.contains("equation-container")) {
          nextElem.remove();
          return;
        }

        //TODO - image gets deleted when caret is at end of previous div
        if (nextElem?.classList?.contains("img-container")) {
          const groupID = nextElem.id.slice(0, 4);
          e.preventDefault();
          selectImageGroup(groupID);
          displayImageResizeHandles(nextElem.firstChild);
          return;
        }
        if (nextElem?.classList?.contains("eq-elem")) {
          deleteEqElem(anchorNode, anchorOffset, nextElem);
          return;
        }
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
        const preCaretText = anchorNode.data?.slice(0, anchorOffset);
        const superscripts = preCaretText.match(/\^(\w|−)+/);
        const subscripts = preCaretText.match(/_(\w|−)+/);

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
          newElem.innerText = textFragment;
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
        if (
          anchorNode.classList?.contains("equation") ||
          anchorNode.classList?.contains("eq-elem") ||
          anchorNode.parentElement?.classList?.contains("equation") ||
          anchorNode.parentElement?.classList?.contains("eq-elem")
        ) {
          e.preventDefault();
          return;
        }

        return;
      }
      case "Minus": {
        if (activeGroup?.type === "equation" && !e.shiftKey) {
          e.preventDefault();
          insertChar("−");
        }
        return;
      }
      default:
        return;
    }
  }

  function handleMouseDown(e) {
    if (e.target.classList.contains("img-resize-handle")) {
      const groupID = e.target.id.slice(0, 4);
      setActiveGroup({
        id: groupID,
        type: "image",
      });
      setActiveTarget(e.target);
      setAction("resizing image");
      setInitParam({
        top: e.target.style.top,
        left: e.target.style.left,
      });
      setInitCoord({ x: e.clientX, y: e.clientY });
      return;
    }
  }

  function handleMouseMove(e) {
    if (action === "resizing image") {
      moveImageResizeHandles(e);
    }
  }

  function handleMouseUp(e) {
    if (action === "resizing image") {
      updateImageSize(e);
      setAction("");
      setInitCoord(null);
      setCurrentCoord(null);
      setInitParam(null);
      setActiveTarget(null);
      return;
    }

    const classList = e.target.classList;
    const parentClassList = e.target.parentElement?.classList;

    if (classList?.contains("editor-img")) {
      const groupID = e.target.id.slice(0, 4);
      selectImageGroup(groupID);
      removeImageResizeHandles();
      displayImageResizeHandles(e.target);
      return;
    }

    if (activeGroup?.type === "image" && !classList?.contains("editor-img")) {
      setActiveGroup(null);
      setAction("");
      removeImageResizeHandles();
      return;
    }

    if (
      classList?.contains("equation") ||
      classList?.contains("eq-elem") ||
      parentClassList?.contains("eq-elem") ||
      parentClassList?.contains("equation")
    ) {
      const groupID = e.target.id.slice(0, 4);
      selectEquationGroup(groupID);
      return;
    }

    if (
      activeGroup?.type === "equation" &&
      !classList?.contains("equation") &&
      !classList?.contains("eq-elem") &&
      !parentClassList?.contains("eq-elem") &&
      !parentClassList?.contains("equation")
    ) {
      setActiveGroup(null);
      setAction("");
      window.getSelection().removeAllRanges();
      return;
    }
  }

  function handleSelectFile(e) {
    let selectedFile = e.target.files[0];
    const fileType = selectedFile?.type;
    const fileExtension = getFileExtension(selectedFile);
    const acceptedTypes = ["image/png", "image/jpeg"];
    const acceptedExtensions = ["PNG", "jpeg"];

    const validFile =
      selectedFile &&
      (acceptedTypes.includes(fileType) ||
        acceptedExtensions.includes(fileExtension));

    if (!validFile) {
      // setError(true);
      // setErrorMessage("please select an image file (PNG or JPG)");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // setError(false);
    // setErrorMessage("");
  }

  function handleUploadSuccess(url) {
    insertImage(url);
    setTimeout(() => onImageUploadSuccess(), 200);
  }

  function moveImageResizeHandles(e) {
    setCurrentCoord({ x: e.clientX, y: e.clientY });

    const targetID = activeTarget.id;

    const groupID = activeGroup.id;

    const topOffset = Number(initParam.top.slice(0, -2)) + dY;
    const leftOffset = Number(initParam.left.slice(0, -2)) + dX;

    activeTarget.style.top = `${topOffset}px`;
    activeTarget.style.left = `${leftOffset}px`;

    const containerElem = e.target.parentElement;
    const containerWidth = containerElem.clientWidth;

    switch (targetID.slice(-1)) {
      case "1": {
        const siblingElem = document.getElementById(`${groupID}-3`);
        const mirrorElem = document.getElementById(`${groupID}-2`);
        const diagonalElem = document.getElementById(`${groupID}-4`);

        siblingElem.style.left = `${leftOffset}px`;
        mirrorElem.style.top = `${topOffset}px`;
        mirrorElem.style.left = `${containerWidth - leftOffset - 24}px`;
        diagonalElem.style.left = `${containerWidth - leftOffset - 24}px`;

        break;
      }
      case "2": {
        const siblingElem = document.getElementById(`${groupID}-4`);
        const mirrorElem = document.getElementById(`${groupID}-1`);
        const diagonalElem = document.getElementById(`${groupID}-3`);

        siblingElem.style.left = `${leftOffset}px`;
        mirrorElem.style.top = `${topOffset}px`;
        mirrorElem.style.left = `${containerWidth - leftOffset - 24}px`;
        diagonalElem.style.left = `${containerWidth - leftOffset - 24}px`;

        break;
      }
      case "3": {
        const mirrorElem = document.getElementById(`${groupID}-4`);
        const siblingElem = document.getElementById(`${groupID}-1`);
        const diagonalElem = document.getElementById(`${groupID}-2`);

        siblingElem.style.left = `${leftOffset}px`;
        mirrorElem.style.top = `${topOffset}px`;
        mirrorElem.style.left = `${containerWidth - leftOffset - 24}px`;
        diagonalElem.style.left = `${containerWidth - leftOffset - 24}px`;
        break;
      }
      case "4": {
        const siblingElem = document.getElementById(`${groupID}-2`);
        const mirrorElem = document.getElementById(`${groupID}-3`);
        const diagonalElem = document.getElementById(`${groupID}-1`);

        siblingElem.style.left = `${leftOffset}px`;
        mirrorElem.style.top = `${topOffset}px`;
        mirrorElem.style.left = `${containerWidth - leftOffset - 24}px`;
        diagonalElem.style.left = `${containerWidth - leftOffset - 24}px`;
        break;
      }

      default:
        break;
    }
  }

  function removeImageResizeHandles() {
    const resizeHandles = document.querySelectorAll("div.img-resize-handle");
    if (resizeHandles.length === 0) {
      return;
    } else {
      resizeHandles.forEach((handle) => handle.remove());
    }
  }

  function removeEmptyTags(tagName) {
    const nodeList = editorRef.current.querySelectorAll(tagName);
    nodeList.forEach((node) => {
      if (!node.innerText) {
        node.remove();
      }
    });

    editorRef.current.normalize();
  }

  function selectEquationGroup(groupID) {
    const eqElems = editorRef.current.querySelectorAll(".eq-field");
    eqElems.forEach((elem) => (elem.contentEditable = "true"));

    setActiveGroup({
      id: groupID,
      type: "equation",
    });
    const eqNode = document.getElementById(`${groupID}-equation`);

    if (eqNode?.firstChild?.tagName == "BR") {
      eqNode?.firstChild?.remove();
      const newTextNode = document.createTextNode("\u00A0");
      eqNode.appendChild(newTextNode);
      const selection = window.getSelection();
      const range = new Range();
      range.setStart(eqNode, 0);
      range.setEnd(eqNode, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  function selectImageGroup(groupID) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    setActiveGroup({
      id: groupID,
      type: "image",
    });
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

  function updateImageSize(e) {
    const groupID = activeGroup.id;

    const handle1 = document.getElementById(`${groupID}-1`);
    const handle2 = document.getElementById(`${groupID}-2`);
    const handle3 = document.getElementById(`${groupID}-3`);
    const handle4 = document.getElementById(`${groupID}-4`);

    const leftEdgePos = handle1.style.left.slice(0, -2);
    const rightEdgePos = handle4.style.left.slice(0, -2);

    const newWidth = Math.abs(rightEdgePos - leftEdgePos);

    const imgContainerElem = e.target.parentElement;
    const imgElem = imgContainerElem.firstChild;

    const containerWidth = imgContainerElem.clientWidth;
    const percentWidth = Math.round((newWidth / containerWidth) * 100);
    const leftMargin = (containerWidth - newWidth) / 2;

    if (percentWidth <= 100) {
      imgElem.setAttribute("width", `${percentWidth}%`);
      handle1.style.top = `0px`;
      handle1.style.left = `${leftMargin - 12}px`;
      handle2.style.top = `0px`;
      handle2.style.left = `${leftMargin + newWidth - 14}px`;
      handle3.style.top = `${imgElem.clientHeight - 1}px`;
      handle3.style.left = `${leftMargin - 12}px`;
      handle4.style.top = `${imgElem.clientHeight - 1}px`;
      handle4.style.left = `${leftMargin + newWidth - 14}px`;
    } else {
      imgElem.setAttribute("width", `100%`);
      handle1.style.top = `0px`;
      handle1.style.left = `-15px`;
      handle2.style.top = `0px`;
      handle2.style.left = `${containerWidth - 15}px`;
      handle3.style.top = `${imgElem.clientHeight - 1}px`;
      handle3.style.left = `-15px`;
      handle4.style.top = `${imgElem.clientHeight - 1}px`;
      handle4.style.left = `${containerWidth - 15}px`;
    }
  }

  useStorage(
    file,
    setFile,
    `${imagePath}/${file?.name}`,
    setUploadProgress,
    handleUploadSuccess
  );

  useEffect(() => {
    window.addEventListener("resize", removeImageResizeHandles);
    return () => window.removeEventListener("resize", removeImageResizeHandles);
  });

  return (
    <>
      <EditorToolbar
        activeGroup={activeGroup}
        deleteImage={deleteImage}
        disabled={!editorActive}
        file={file}
        handleFormat={handleFormat}
        handleSelectFile={handleSelectFile}
        setActiveGroup={setActiveGroup}
        toolbarOptions={toolbarOptions}
        uploadProgress={uploadProgress}
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
          ref={editorRef}
          id={id}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onKeyDown={handleKeyDown}
          suppressContentEditableWarning
        ></div>

        {/* <Diagnostics
          activeGroup={activeGroup}
          action={action}
          initCoord={initCoord}
          currentCoord={currentCoord}
          dX={dX}
          dY={dY}
          initParam={initParam}
        /> */}
      </Box>
    </>
  );
}

function EditorToolbar({
  activeGroup,
  setActiveGroup,
  deleteImage,
  disabled,
  file,
  handleFormat,
  handleSelectFile,
  toolbarOptions,
  uploadProgress,
}) {
  const [tab, setTab] = useState("templates");
  const type = activeGroup?.type;
  const showFontStyle = !activeGroup && toolbarOptions.includes("font style");
  const showScript =
    !activeGroup && toolbarOptions.includes("superscript/subscript");
  const showList = !activeGroup && toolbarOptions.includes("list");
  const showImage = !activeGroup && toolbarOptions.includes("image");
  const showEquation = !activeGroup && toolbarOptions.includes("equation");

  function handleTab(event) {
    const value = event.target.attributes.value.nodeValue;
    setTab(value);
  }

  return (
    <div>
      {showFontStyle && (
        <BtnGroupFontStyle disabled={disabled} handleFormat={handleFormat} />
      )}
      {showScript && (
        <BtnGroupScript disabled={disabled} handleFormat={handleFormat} />
      )}
      {showList && <BtnGroupList disabled={disabled} insertList={insertList} />}
      {showImage && (
        <BtnGroupImage
          disabled={disabled}
          file={file}
          handleSelectFile={handleSelectFile}
          uploadProgress={uploadProgress}
        />
      )}
      {showEquation && (
        <BtnGroupEquation
          disabled={disabled}
          insertEquation={() => insertEquation(setActiveGroup)}
        />
      )}
      {type == "image" && (
        <Button
          className="editor-btn"
          onClick={deleteImage}
          startIcon={<DeleteIcon />}
        >
          DELETE IMAGE
        </Button>
      )}
      {type === "equation" && (
        <div>
          <EquationTab handleTab={handleTab} tab={tab} value="templates" />
          <EquationTab handleTab={handleTab} tab={tab} value="greek" />
          <EquationTab handleTab={handleTab} tab={tab} value="arrows" />
          <EquationTab handleTab={handleTab} tab={tab} value="math" />
        </div>
      )}

      {type === "equation" && tab === "templates" && (
        <div className="eq-symbols-container">
          <ParenTemplateBtn caption="parentheses" onClick={insertParentheses} />
          <FractionTemplateBtn caption="fraction" onClick={insertFraction} />
          <SqrtTemplateBtn caption="square root" onClick={insertSqrt} />
          <VectorTemplateBtn caption="vector" onClick={insertVector} />
        </div>
      )}
      {type === "equation" && tab === "greek" && (
        <Symbols
          chars={[...greekUppercase, ...greekLowercase]}
          insertChar={insertChar}
        />
      )}
      {type === "equation" && tab === "arrows" && (
        <Symbols chars={arrows} insertChar={insertChar} />
      )}
      {type === "equation" && tab === "math" && (
        <Symbols chars={mathSymbols} insertChar={insertChar} />
      )}
    </div>
  );
}

// function Diagnostics({
//   activeGroup,
//   action,
//   initCoord,
//   currentCoord,
//   dX,
//   dY,
//   initParam,
// }) {
//   return (
//     <>
//       <div className="test" style={{ height: "20px" }}></div>
//       <div>Active Group</div>
//       <div>{JSON.stringify(activeGroup, null, 2)}</div>
//       <div>Action</div>
//       <div>{JSON.stringify(action, null, 2)}</div>
//       <div>Coordinate Info</div>
//       <div>{JSON.stringify(initCoord, null, 2)}</div>
//       <div>{JSON.stringify(currentCoord, null, 2)}</div>
//       <div>
//         {JSON.stringify({
//           dx: dX,
//           dy: dY,
//         })}
//       </div>
//       <div>{JSON.stringify(initParam, null, 2)}</div>
//     </>
//   );
// }
