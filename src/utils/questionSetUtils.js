export function cleanEditorHTML(elem) {
  if (!elem) return;
  const resizeHandles = elem.querySelectorAll("div.img-resize-handle");
  resizeHandles.forEach((handle) => handle.remove());
  const editableElems = elem.querySelectorAll(["[contenteditable=true]"]);
  editableElems.forEach((elem) => elem.removeAttribute("contenteditable"));
  return elem.innerHTML;
}

export function getSubmissions(submissionHistory, question) {
  if (!question?.id) return [];
  if (!submissionHistory) return [];

  return submissionHistory[question.id] || [];
}
