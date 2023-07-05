export function cleanEditorHTML(elem) {
  if (!elem) return;
  const resizeHandles = elem.querySelectorAll("div.img-resize-handle");
  resizeHandles.forEach((handle) => handle.remove());
  const eqElems = elem.querySelectorAll(".eq-field");
  eqElems.forEach((elem) => (elem.contentEditable = "false"));
  return elem.innerHTML;
}

export function getSubmissions(qSet, question) {
  const submissionHistory = qSet?.submissionHistory || {};
  const submissions = submissionHistory[question.id];
  return submissions;
}
