import { generateRandomCode } from "./commonUtils";

//================= exported functions ==========================//

export function backspaceEqElem(anchorNode, anchorOffset, prevElem) {
  const validElem =
    prevElem?.classList?.contains("eq-fraction") ||
    prevElem?.classList?.contains("eq-sqrt") ||
    prevElem?.classList?.contains("eq-vector");

  if (validElem) {
    if (anchorOffset === 0) {
      prevElem.remove();
    }
    if (anchorOffset <= 1 && anchorNode.data?.trim() === "") {
      prevElem.remove();
    }
    anchorNode.parentElement.normalize();
  }
}

export function deleteEqElem(anchorNode, anchorOffset, elem) {
  const validElem =
    elem?.classList?.contains("eq-fraction") ||
    elem?.classList?.contains("eq-sqrt");

  if (validElem) {
    if (anchorOffset === anchorNode.length) {
      elem.remove();
    }
    anchorNode.parentElement.normalize();
  }
}

export function handleArrowLeft(anchorNode, anchorOffset, elem) {
  const prevElem = elem.previousSibling;
  const newTextNode = document.createTextNode("\u00A0");

  if (anchorOffset < anchorNode.data?.length) {
    return;
  }
  if (prevElem?.nodeType !== 3) {
    elem.before(newTextNode);
  } else if (prevElem?.nodeType === 3 && prevElem?.data.length === 0) {
    elem.before(newTextNode);
  } else {
    return;
  }
}

export function handleArrowRight(anchorNode, anchorOffset, elem) {
  const nextElem = elem.nextSibling;
  const newTextNode = document.createTextNode("\u00A0");

  if (anchorOffset < anchorNode.data?.length) {
    return;
  }

  if (nextElem?.nodeType !== 3) {
    elem.after(newTextNode);
  } else if (nextElem?.nodeType === 3 && nextElem?.data.length === 0) {
    elem.after(newTextNode);
  } else {
    return;
  }
}

export function insertChar(char) {
  const selection = document.getSelection();
  const anchorNode = selection.anchorNode;
  const anchorOffset = selection.anchorOffset;

  const inEqEditor = selectionInEditor();

  if (!inEqEditor) {
    console.log("not valid ancestor, so did not insert character");
    return;
  }

  if (anchorNode.nodeType === 3) {
    const preText = anchorNode.data.slice(0, anchorOffset);
    const postText = anchorNode.data.slice(anchorOffset);

    anchorNode.data = preText + char + postText;

    const range = new Range();
    range.setStart(anchorNode, anchorOffset + 1);
    range.setEnd(anchorNode, anchorOffset + 1);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    const newTextNode = document.createTextNode(char);
    anchorNode.appendChild(newTextNode);
    const range = new Range();
    range.setStart(newTextNode, 1);
    range.setEnd(newTextNode, 1);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function insertEquation(setActiveGroup) {
  const selection = document.getSelection();
  const anchorNode = selection.anchorNode;
  const offset = selection.anchorOffset;
  const parent = anchorNode?.parentElement;
  const grandParent = parent?.parentElement;
  const newGroupID = generateRandomCode(4);

  const newEquation = document.createElement("span");
  newEquation.classList.add("equation");
  newEquation.setAttribute("id", `${newGroupID}-equation`);
  newEquation.contentEditable = "true";

  const newTextNode = document.createTextNode("\u00A0");
  newEquation.appendChild(newTextNode);

  if (!selection.isCollapsed) {
    return;
  }

  //prevent insertion if selection not within editor
  if (
    !parent.classList?.contains("editor-content") &&
    !grandParent.classList?.contains("editor-content")
  ) {
    return;
  }

  // handle block insertion (if caret is within div)
  if (anchorNode.tagName === "DIV") {
    const newEquationContainer = document.createElement("div");
    newEquationContainer.classList.add("equation-container");
    newEquationContainer.style.margin = "auto";

    anchorNode.after(newEquationContainer);
    newEquationContainer.appendChild(newEquation);
    insertBreak(newEquationContainer, "after");
  }

  // handle inline insertion (if caret is within text node)
  if (anchorNode.nodeType === 3) {
    const newEquationContainer = document.createElement("span");
    newEquationContainer.classList.add("equation-container");

    const afterSplitNode = anchorNode.splitText(offset);
    afterSplitNode.before(newEquationContainer);
    newEquationContainer.appendChild(newEquation);

    //TODO: modify below to check length of afterSplitNode, if text is longer than certain length, don't add new space
    if (afterSplitNode.length === 0) {
      afterSplitNode.data = "\u00A0";
    }
  }
  const range = new Range();
  range.setStart(newTextNode, 0);
  range.setEnd(newTextNode, 0);
  selection.removeAllRanges();
  selection.addRange(range);

  setActiveGroup({ id: newGroupID, type: "equation" });
}

export function insertImage(url) {
  const selection = document.getSelection();
  const anchorNode = selection.anchorNode;
  const parent = anchorNode?.parentElement;
  const grandParent = parent?.parentElement;

  const newGroupID = generateRandomCode(4);
  const newImgContainer = document.createElement("div");
  const newImg = document.createElement("img");

  newImgContainer.setAttribute("id", `${newGroupID}-img-container`);
  newImgContainer.classList.add("editor-img-container");
  newImgContainer.contentEditable = false;

  newImg.classList.add("editor-img");
  newImg.setAttribute("id", `${newGroupID}-img`);
  newImg.setAttribute("src", url);
  newImg.setAttribute("width", "50%");
  newImg.setAttribute("draggable", "false");

  newImgContainer.appendChild(newImg);

  if (anchorNode.classList?.contains("editor-content")) {
    anchorNode.appendChild(newImgContainer);
  } else if (parent.classList?.contains("editor-content")) {
    anchorNode.after(newImgContainer);
  } else if (grandParent.classList?.contains("editor-content")) {
    parent.after(newImgContainer);
  } else {
    console.log("selection invalid");
    return;
  }

  insertBreak(newImgContainer, "after");
}

export function insertList() {
  const selection = document.getSelection();
  const anchorNode = selection.anchorNode;
  const parent = anchorNode?.parentElement;
  const grandParent = parent?.parentElement;

  const newGroupID = generateRandomCode(4);
  const newList = document.createElement("ul");
  const newListItem = document.createElement("li");
  newList.classList.add("list");
  newList.setAttribute("id", `${newGroupID}-list`);
  newList.style.paddingLeft = "20px";
  newList.appendChild(newListItem);

  if (anchorNode.classList?.contains("editor-content")) {
    anchorNode.appendChild(newList);
  } else if (parent.classList?.contains("editor-content")) {
    anchorNode.after(newList);
  } else if (grandParent.classList?.contains("editor-content")) {
    parent.after(newList);
  } else {
    console.log("selection invalid");
    return;
  }
}

export function insertFraction() {
  const newID = generateRandomCode(4);

  const newFraction = document.createElement("span");
  newFraction.classList.add("eq-elem", "eq-fraction");
  newFraction.setAttribute("id", `${newID}-fraction`);
  newFraction.contentEditable = "false";
  newFraction.style.display = "inline-block";

  const newNumerator = document.createElement("span");
  newNumerator.classList.add("eq-elem", "eq-field", "eq-numerator");
  newNumerator.setAttribute("id", `${newID}-numerator`);
  newNumerator.contentEditable = "true";

  const newDivider = document.createElement("hr");
  newDivider.classList.add("eq-elem", "eq-fraction-divider");

  const newDenominator = document.createElement("span");
  newDenominator.classList.add("eq-elem", "eq-field", "eq-denominator");
  newDenominator.setAttribute("id", `${newID}-denominator`);
  newDenominator.contentEditable = "true";

  newFraction.appendChild(newNumerator);
  newFraction.appendChild(newDivider);
  newFraction.appendChild(newDenominator);
  insertNewEqElem(newFraction);
  insertTextNodeBuffers(newFraction);

  newNumerator.focus();
}

export function insertParentheses() {
  const newParentheses = document.createElement("span");
  newParentheses.classList.add("eq-elem", "eq-parentheses");
  newParentheses.contentEditable = "false";

  const leftDecoration = document.createElement("span");
  const leftParenthesis = document.createTextNode("(");
  const rightDecoration = document.createElement("span");
  const rightParenthesis = document.createTextNode(")");
  leftDecoration.classList.add("eq-parentheses-decoration");
  leftDecoration.style.transform = "scale(1,1.5)";
  rightDecoration.classList.add("eq-parentheses-decoration");
  rightDecoration.style.transform = "scale(1,1.5)";

  leftDecoration.appendChild(leftParenthesis);
  rightDecoration.appendChild(rightParenthesis);

  const parenthesesArg = document.createElement("span");
  parenthesesArg.classList.add("eq-elem", "eq-parentheses-arg", "eq-field");
  parenthesesArg.contentEditable = "true";

  newParentheses.appendChild(leftDecoration);
  newParentheses.appendChild(parenthesesArg);
  newParentheses.appendChild(rightDecoration);

  insertNewEqElem(newParentheses);
  insertTextNodeBuffers(newParentheses);

  parenthesesArg.focus();
}

export function insertSqrt() {
  const newID = generateRandomCode(4);

  const newSqrt = document.createElement("span");
  newSqrt.classList.add("eq-elem", "eq-sqrt");
  newSqrt.setAttribute("id", `${newID}-sqrt`);
  newSqrt.contentEditable = "false";

  const newSqrtTail1 = document.createElement("span");
  newSqrtTail1.classList.add("eq-elem", "eq-sqrt-tail-1");
  newSqrtTail1.contentEditable = "false";

  const newSqrtTail2 = document.createElement("eq-sqrt-tail-2");
  newSqrtTail2.classList.add("eq-elem", "eq-sqrt-tail-2");
  newSqrtTail2.contentEditable = "false";

  const newSqrtMain = document.createElement("span");
  newSqrtMain.classList.add("eq-elem", "eq-sqrt-main");
  newSqrtMain.contentEditable = "false";

  const newSqrtArg = document.createElement("span");
  newSqrtArg.classList.add("eq-elem", "eq-field", "eq-sqrt-arg");
  newSqrtArg.setAttribute("id", `${newID}-arg`);
  newSqrtArg.contentEditable = "true";

  newSqrt.appendChild(newSqrtTail1);
  newSqrt.appendChild(newSqrtTail2);
  newSqrt.appendChild(newSqrtMain);
  newSqrtMain.appendChild(newSqrtArg);

  insertNewEqElem(newSqrt);
  insertTextNodeBuffers(newSqrt);

  newSqrtArg.focus();
}

export function insertVector() {
  const newVector = document.createElement("span");
  newVector.classList.add("eq-elem", "eq-vector");
  newVector.contentEditable = "false";

  const vectorDecoration = document.createElement("span");
  const harpoon = document.createTextNode("⇀");
  vectorDecoration.classList.add("eq-elem", "eq-vector-decoration");
  vectorDecoration.appendChild(harpoon);

  const vectorArg = document.createElement("span");
  vectorArg.classList.add("eq-elem", "eq-vector-arg", "eq-field");
  vectorArg.contentEditable = "true";

  newVector.appendChild(vectorDecoration);
  newVector.appendChild(vectorArg);

  insertNewEqElem(newVector);
  insertTextNodeBuffers(newVector);

  vectorArg.focus();
}

export function selectionInEditor() {
  // check if current selection is within editor field, preventing DOM mutations outside of editor field
  const selection = document.getSelection();
  const anchorNode = selection.anchorNode;
  const validClasses = ["equation", "eq-field", "number-field"];

  for (let i = 0; i < validClasses.length; i++) {
    const className = validClasses[i];

    if (anchorNode.classList?.contains(className)) {
      return true;
    }

    if (anchorNode.parentElement.classList?.contains(className)) {
      return true;
    }
  }
  return false;
}

function insertBreak(elem, position) {
  const newDiv = document.createElement("div");
  const newBr = document.createElement("br");
  newDiv.appendChild(newBr);

  if (position === "before") {
    elem.before(newDiv);
    return;
  }

  if (position === "after") {
    elem.after(newDiv);
    return;
  }
}

function insertNewEqElem(elem) {
  const selection = document.getSelection();
  const anchorNode = selection.anchorNode;
  const anchorOffset = selection.anchorOffset;

  if (
    anchorNode.classList?.contains("equation") ||
    anchorNode.classList?.contains("number-field")
  ) {
    anchorNode.appendChild(elem);
    return;
  }
  if (anchorNode.nodeType === 3) {
    const newNode = anchorNode.splitText(anchorOffset);
    newNode.before(elem);
    return;
  }

  if (anchorNode.nodeType === 1 && anchorNode.classList?.contains("eq-field")) {
    anchorNode.appendChild(elem);
    return;
  }
}

function insertTextNodeBuffers(elem) {
  const newTextNode1 = document.createTextNode("\u00A0");
  const newTextNode2 = document.createTextNode("\u00A0");

  elem.after(newTextNode1);
  elem.before(newTextNode2);
}
