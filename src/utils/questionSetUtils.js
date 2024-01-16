import { pickRandomInt } from "./commonUtils";

export function cleanEditorHTML(elem) {
  if (!elem) return;
  const resizeHandles = elem.querySelectorAll("div.img-resize-handle");
  resizeHandles.forEach((handle) => handle.remove());
  const editableElems = elem.querySelectorAll(["[contenteditable=true]"]);
  editableElems.forEach((elem) => elem.removeAttribute("contenteditable"));
  return elem.innerHTML;
}

export function cleanChemField(elem) {
  const clone = elem.cloneNode(true);
  console.log(elem);
  const tempElems = clone.querySelectorAll(".temp-input-elem");
  tempElems.forEach((el) => el.remove());
  clone.normalize();
  return clone;
}

export function toChemFormulaStr(elem) {
  console.log(elem);
  return elem.innerHTML;
}

export function getSubmissions(submissionHistory, question) {
  if (!question?.id) return [];
  if (!submissionHistory) return [];

  return submissionHistory[question.id] || [];
}

export function pickQuestion(objective, questions, submissionHistory) {
  const objectiveIDs = objective?.questionIDs || [];

  const touchedIDs = submissionHistory
    ? objectiveIDs.filter((id) => Object.hasOwn(submissionHistory, id))
    : [];

  const untouchedIDs = objectiveIDs.filter((id) => !touchedIDs.includes(id));

  const qIndex = pickRandomInt(0, untouchedIDs.length);

  const pickedID = untouchedIDs[qIndex];
  const foundQuestion = questions.find((question) => question.id === pickedID);

  if (untouchedIDs.length == 0) {
    return "exhausted";
  }

  return foundQuestion;
}

export function calculateProgress(rule, objective, submissionHistory) {
  const zeroScore = { percentage: 0, count: 0 };
  if (!submissionHistory || !objective) {
    return zeroScore;
  }

  const objectiveIDs = objective.questionIDs;
  const touchedIDs = objectiveIDs.filter((id) =>
    Object.hasOwn(submissionHistory, id)
  );

  const lastSubmissions = touchedIDs.map((id) => submissionHistory[id]?.at(-1));

  const correctSubmissions = lastSubmissions.filter(
    (lastSubmission) => lastSubmission.answeredCorrectly
  );

  const numCorrect = correctSubmissions.length;

  if (rule === "total correct") {
    const count = numCorrect;
    const percentage = 100 * (count / objective.completionThreshold);
    return { percentage, count };
  }

  if (rule === "chutes and ladders") {
    const count = chutesStreak(lastSubmissions);

    const percentage = 100 * (count / objective.completionThreshold);
    return { percentage, count };
  }

  if (rule === "consecutive correct") {
    const count = correctStreak(lastSubmissions);
    const percentage = 100 * (count / objective.completionThreshold);
    return { percentage, count };
  }

  return zeroScore;
}

export function chutesStreak(lastSubmissions) {
  const sorted = lastSubmissions.sort(compareDates);

  let count = 0;

  for (let i = 0; i < sorted.length; i++) {
    const lastSubmission = sorted[i];
    if (lastSubmission.answeredCorrectly) {
      count = count + 1;
    } else {
      count = count > 0 ? count - 1 : 0;
    }
  }

  return count;
}

export function correctStreak(lastSubmissions) {
  const sorted = lastSubmissions.sort(compareDates);

  let count = 0;

  for (let i = 0; i < sorted.length; i++) {
    const lastSubmission = sorted[i];
    if (lastSubmission.answeredCorrectly) {
      count = count + 1;
    } else {
      count = 0;
    }
  }

  return count;
}

function compareDates(a, b) {
  const dateA = a.dateSubmitted;
  const dateB = b.dateSubmitted;
  if (dateA.seconds < dateB.seconds) return -1;
  if (dateA.seconds > dateB.seconds) return 1;
  return 0;
}
