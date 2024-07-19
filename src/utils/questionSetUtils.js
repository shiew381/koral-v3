import { compareDates, pickRandomInt } from "./commonUtils";

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

export function countNumParen(str) {
  //count number of open and closed parentheses in a string
  const numOpenParen = str.replace(/[^(]/g, "").length;
  const numClosedParen = str.replace(/[^)]/g, "").length;
  const numParen = numOpenParen + numClosedParen;
  return numParen;
}

export function countNumBrkt(str) {
  //count number of open and closed brackets in a string
  const numOpenBrkt = str.replace(/[^[]/g, "").length;
  const numClosedBrkt = str.replace(/[^\]]/g, "").length;
  const numBrkt = numOpenBrkt + numClosedBrkt;
  return numBrkt;
}

export function cleanEditorHTML(elem) {
  if (!elem) return;
  const clone = elem.cloneNode(true);

  const resizeHandles = clone.querySelectorAll("div.img-resize-handle");
  const editableElems = clone.querySelectorAll(["[contenteditable=true]"]);
  const texElems = elem.querySelectorAll(
    "div.tex-container",
    "span.tex-container"
  );

  console.log("clone");
  console.log(clone);
  resizeHandles.forEach((handle) => handle.remove());
  editableElems.forEach((elem) => elem.removeAttribute("contenteditable"));

  console.log(texElems);

  const cleanedHTML = elem.innerHTML
    .replaceAll("&lt;InlineTeX&gt;", "<InlineTeX>")
    .replaceAll("&lt;/InlineTeX&gt;", "</InlineTeX>")
    .replaceAll("&lt;BlockTeX&gt;", "<BlockTeX>")
    .replaceAll("&lt;/BlockTeX&gt;", "</BlockTeX>");

  return cleanedHTML;
}

export function cleanChemField(elem) {
  const clone = elem.cloneNode(true);
  const tempElems = clone.querySelectorAll(".temp-input-elem");
  tempElems.forEach((el) => el.remove());
  clone.normalize();
  return clone;
}

export function checkIfNumParenMatch(str) {
  //checks if the number of open and closed parentheses in a string match
  const strCopy = str.slice();
  const numOpenParen = strCopy.replace(/[^(]/g, "").length;
  const numClosedParen = strCopy.replace(/[^)]/g, "").length;
  const match = numOpenParen === numClosedParen;
  return match;
}

export function checkIfNumBrktMatch(str) {
  //checks if the number of open and closed brackets in a string match
  const strCopy = str.slice();
  const numOpenBrkt = strCopy.replace(/[^[]/g, "").length;
  const numClosedBrkt = strCopy.replace(/[^\]]/g, "").length;
  const match = numOpenBrkt === numClosedBrkt;
  return match;
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

export function convertElemtoStr(elem) {
  let stringifiedForm = "";

  const superscripts = elem.querySelectorAll("sup");
  superscripts.forEach((superscript) => {
    const stringEquivalent = "^" + superscript.innerText;
    superscript.replaceWith(stringEquivalent);
  });

  //quick check - if no templates used return early
  const eqFields = elem.querySelectorAll(".eq-field");
  if (eqFields.length === 0) {
    console.log("no templates used");
    stringifiedForm = elem.innerText;
    return stringifiedForm;
  }

  for (let i = 0; i < 5; i++) {
    const sqrts = elem.querySelectorAll(".eq-sqrt");
    sqrts.forEach((sqrt) => {
      const arg = sqrt.querySelector(".eq-sqrt-arg");
      const nestedFields = arg.querySelectorAll(".eq-field");
      if (nestedFields.length > 0) {
        console.log(
          "found nested fields in square root, scanning other fields..."
        );
        return;
      } else {
        const stringEquivalent = " sqrt" + "(" + arg.innerText.trim() + ") ";
        console.log("stringifying square root");
        console.log(stringEquivalent);
        sqrt.replaceWith(stringEquivalent);
      }
    });

    const fractions = elem.querySelectorAll(".eq-fraction");
    fractions.forEach((fraction) => {
      const numerator = fraction.querySelector(".eq-numerator");
      const nestedFieldsNum = numerator.querySelectorAll(".eq-field");

      const denominator = fraction.querySelector(".eq-denominator");
      const nestedFieldsDenom = denominator.querySelectorAll(".eq-field");

      if (nestedFieldsDenom.length > 0 || nestedFieldsNum.length > 0) {
        console.log("found nested fields in square root, skipping...");
        return;
      }

      const stringEquivalent =
        "(" + numerator.innerText + "/" + denominator.innerText + ")";
      console.log("stringifying fraction");
      console.log(stringEquivalent);
      fraction.replaceWith(stringEquivalent.trim());
    });
    stringifiedForm = elem.innerText;
  }

  return stringifiedForm.trim();
}

export function convertSpecialTags(str) {
  return str
    .replaceAll("<InlineTeX>", "&lt;InlineTeX&gt;")
    .replaceAll("</InlineTeX>", "&lt;/InlineTeX&gt;")
    .replaceAll("<BlockTeX>", "&lt;BlockTeX&gt;")
    .replaceAll("</BlockTeX>", "&lt;/BlockTeX&gt;");
}

export function findChemSymbols(str) {
  // finds all chemical element symbols in a string with one capital letter like "N" representing nitrogen
  // or one capital letter followed by a lowercase letter like "Na" representing sodium
  const chemSymbols = str.match(/([A-Z][a-z]*)/g);
  return chemSymbols || [];
}

export function findMalformedChemSymbols(str) {
  // finds all symbols in a string that do not conform to chemical symbol notation
  // i.e. one capital letter, or one capital letter followed by a lowercase letter.
  const nonChemSymbols = str.match(/[a-z]{2,}/g);
  return nonChemSymbols || [];
}

export function findUnknownChemSymbols(chemSymbols, elemList) {
  // checks each element of an array containing chemical symbols against chemical symbols from the periodic table.
  const unknownChemSymbols = [];

  chemSymbols.forEach((symbol) => {
    const foundElement = elemList.find((item) => item.symbol === symbol);
    if (!foundElement) {
      unknownChemSymbols.push(symbol);
    }
  });
  return unknownChemSymbols;
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

export function toChemFormulaStr(elem) {
  let formula = elem.innerHTML.slice();
  formula = formula.replaceAll("&nbsp;", "").replace(/\s+/g, "");
  return formula;
}
