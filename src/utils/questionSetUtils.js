export function cleanEditorHTML(elem) {
  if (!elem) return;
  const resizeHandles = elem.querySelectorAll("div.img-resize-handle");
  resizeHandles.forEach((handle) => handle.remove());
  const editableElems = elem.querySelectorAll(["[contenteditable=true]"]);
  editableElems.forEach((elem) => elem.removeAttribute("contenteditable"));
  return elem.innerHTML;
}

export function getSubmissions(qSet, question) {
  const submissionHistory = qSet?.submissionHistory || {};
  const submissions = submissionHistory[question.id];
  return submissions;
}
