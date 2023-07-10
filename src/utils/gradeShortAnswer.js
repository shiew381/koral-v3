import { compareBases } from "./commonUtils";
import { units } from "../lists/units";

export function gradeShortAnswer(question, response) {
  const subtype = question.subtype;
  const correctAnswer = question.correctAnswer;
  const pointsPossible = question?.pointsPossible;
  let answeredCorrectly = false;

  const fullScore = {
    answeredCorrectly: true,
    pointsAwarded: pointsPossible,
  };
  const zeroScore = {
    answeredCorrectly: false,
    pointsAwarded: 0,
  };

  console.time("Execution Time");

  //============= SUBTYOE: TEXT =============//

  if (subtype === "text") {
    console.log(question);
    console.log(response);
    const acceptAltCap = question.scoring.acceptAltCap;
    const acceptAltSpacing = question.scoring.acceptAltSpacing;

    if (!acceptAltCap && !acceptAltSpacing) {
      console.log("hello");
      console.log(response);
      answeredCorrectly = response.text === correctAnswer.text;
    }

    if (!acceptAltCap && acceptAltSpacing) {
      answeredCorrectly =
        response.text.replace(/\s+/g, " ").trim() ===
        correctAnswer.text.replace(/\s+/g, " ").trim();
    }

    if (acceptAltCap && !acceptAltSpacing) {
      answeredCorrectly =
        response.text.toLowerCase() === correctAnswer.text.toLowerCase();
    }

    if (acceptAltCap && acceptAltSpacing) {
      answeredCorrectly =
        response.text.toLowerCase().replace(/\s+/g, " ").trim() ===
        correctAnswer.text.toLowerCase().replace(/\s+/g, " ").trim();
    }

    console.log(answeredCorrectly);

    logExecutionTime();
    return answeredCorrectly ? fullScore : zeroScore;
  }

  //=========================== SUBTYPE: NUMBER =============================//

  if (subtype === "number") {
    let numbersMatch = false;
    const percentTolerance = Number(question.scoring.percentTolerance);
    const maxRounds = 5;

    //======================== number =========================//

    console.log("GRADING NUMBER");
    logSpacer(1);

    let correctNumber = replaceTranscendentals(correctAnswer.number);
    let submittedNumber = replaceTranscendentals(response.number);

    correctNumber = sanitizeNumber(correctNumber);
    submittedNumber = sanitizeNumber(submittedNumber);

    //quick-check for exact number match
    numbersMatch = correctNumber === submittedNumber;

    if (numbersMatch) {
      console.log("exact number match");
      return fullScore;
    }

    const passedNumberPreCheck = preCheckNumber(submittedNumber);

    if (!passedNumberPreCheck) {
      console.log("Failed number pre-check. Exiting grading function...");
      logExecutionTime();
      return zeroScore;
    }

    logStartMessage("SIMPLIFYING CORRECT NUMBER", correctNumber);
    for (let i = 0; i < maxRounds; i++) {
      logRoundStartMessage(correctNumber, i + 1);
      if (isNumber(correctNumber)) {
        break;
      }

      correctNumber = simplifyNumber(correctNumber);
      logRoundEndMessage(correctNumber, i + 1);
    }
    logEndMessage(correctNumber);

    logStartMessage("SIMPLIFYING SUBMITTED NUMBER", submittedNumber);
    for (let i = 0; i < maxRounds; i++) {
      logRoundStartMessage(submittedNumber, i + 1);
      if (isNumber(submittedNumber)) {
        break;
      }
      submittedNumber = simplifyNumber(submittedNumber);
      logRoundEndMessage(submittedNumber, i + 1);
    }
    logEndMessage(submittedNumber);

    numbersMatch = checkNumbersMatch(
      correctNumber,
      submittedNumber,
      percentTolerance
    );

    return numbersMatch ? fullScore : zeroScore;
  }

  //========================= SUBTYPE: MEASUREMENT ==========================//

  if (subtype === "measurement") {
    let numbersMatch = false;
    let unitsMatch = false;
    const percentTolerance = Number(question.scoring.percentTolerance);
    const maxRounds = 5;

    //======================== number =========================//

    console.log("GRADING NUMBER");
    logSpacer(1);

    let correctNumber = replaceTranscendentals(correctAnswer.number);
    let submittedNumber = replaceTranscendentals(response.number);

    correctNumber = sanitizeNumber(correctNumber);
    submittedNumber = sanitizeNumber(submittedNumber);

    //quick-check for exact number match
    numbersMatch = correctNumber === submittedNumber;

    if (numbersMatch) {
      console.log("exact number match");
    }

    const passedNumberPreCheck = preCheckNumber(submittedNumber);

    if (!passedNumberPreCheck) {
      console.log("Failed number pre-check. Exiting grading function...");
      logExecutionTime();
      return zeroScore;
    }

    logStartMessage("SIMPLIFYING CORRECT NUMBER", correctNumber);
    for (let i = 0; i < maxRounds; i++) {
      logRoundStartMessage(correctNumber, i + 1);
      if (isNumber(correctNumber)) {
        break;
      }

      correctNumber = simplifyNumber(correctNumber);
      logRoundEndMessage(correctNumber, i + 1);
    }
    logEndMessage(correctNumber);

    logStartMessage("SIMPLIFYING SUBMITTED NUMBER", submittedNumber);
    for (let i = 0; i < maxRounds; i++) {
      logRoundStartMessage(submittedNumber, i + 1);
      if (isNumber(submittedNumber)) {
        break;
      }
      submittedNumber = simplifyNumber(submittedNumber);
      logRoundEndMessage(submittedNumber, i + 1);
    }
    logEndMessage(submittedNumber);

    numbersMatch = checkNumbersMatch(
      correctNumber,
      submittedNumber,
      percentTolerance
    );

    logSpacer(2);

    //======================== unit ===========================//

    console.log("GRADING UNIT");
    logSpacer(1);

    let correctUnit = sanitizeUnit(correctAnswer.unit);
    let submittedUnit = sanitizeUnit(response.unit);

    //quick-check for exact unit match
    unitsMatch = correctUnit === submittedUnit;

    if (numbersMatch && unitsMatch) {
      console.log("exact unit match");
      console.log("numbers and unit both match, assigning full score");
      return fullScore;
    }

    // PRECHECK - return zeroscore if submitted unit is malformed
    const passedUnitPreCheck = preCheckUnit(submittedUnit);

    if (!passedUnitPreCheck) {
      console.log("Failed unit pre-check. Exiting grading function...");
      logExecutionTime();
      return zeroScore;
    }

    // ANALYZE UNIT COMPLEXITY
    const isAnswerComplex = checkUnitComplexity(correctUnit);
    const isSubmittedComplex = checkUnitComplexity(submittedUnit);

    // if both simple, check for equivalence
    if (!isAnswerComplex && !isSubmittedComplex) {
      console.log("unit is simple..");
      console.log("searching for unit in prepared list..");

      const correctUnitMatch = findUnit(correctUnit);
      const submittedUnitMatch = findUnit(submittedUnit);

      if (!correctUnitMatch || !submittedUnitMatch) {
        console.log("Could not find unit. Assigning zero score");
        console.timeEnd("Execution Time");
        return zeroScore;
      }

      unitsMatch = correctUnitMatch === submittedUnitMatch;

      if (numbersMatch && unitsMatch) {
        console.log("number and unit are both correct, awarding full score");
        return fullScore;
      }

      if (numbersMatch && !unitsMatch) {
        console.log("number is correct, but unit is wrong, zero points");
        return zeroScore;
      }

      if (!numbersMatch && unitsMatch) {
        console.log("number is wrong, unit is correct, zero points");
        return zeroScore;
      }

      if (!numbersMatch && !unitsMatch) {
        console.log("number and units are both incorrect, zero points");
        return zeroScore;
      }
    }

    // SIMPLIFY NUMERICAL FRACTIONS
    correctUnit = simplifyFractions(correctUnit);
    submittedUnit = simplifyFractions(submittedUnit);

    logStartMessage("CANONICALIZING CORRECT UNIT", correctUnit);
    for (let i = 0; i < maxRounds; i++) {
      logRoundStartMessage(submittedNumber, i + 1);
      correctUnit = canonicalizeUnit(correctUnit);
      logRoundEndMessage(correctUnit, i + 1);
    }
    correctUnit = standardizeUnitString(correctUnit);
    logEndMessage(correctUnit);

    logStartMessage("CANONICALIZING SUBMITTED UNIT", submittedUnit);
    for (let i = 0; i < maxRounds; i++) {
      logRoundStartMessage(submittedNumber, i + 1);
      submittedUnit = canonicalizeUnit(submittedUnit);
      logRoundEndMessage(correctUnit, i + 1);
    }
    submittedUnit = standardizeUnitString(submittedUnit);
    logEndMessage(submittedUnit);

    logExecutionTime();

    unitsMatch = correctUnit === submittedUnit;
    answeredCorrectly = numbersMatch && unitsMatch;

    if (numbersMatch && unitsMatch) {
      console.log("number and unit are both correct, awarding full score");
    }

    if (!numbersMatch && unitsMatch) {
      console.log("number is wrong, unit is correct, zero points");
    }

    if (!numbersMatch && !unitsMatch) {
      console.log("number and units are both incorrect, zero points");
    }

    if (numbersMatch && !unitsMatch) {
      console.log("number is correct, but unit is wrong, zero points");
    }

    return answeredCorrectly ? fullScore : zeroScore;
  }
}

//TODO consolidate like units into single term m^2 m^3 => m^5

function calcMaxDepth(str) {
  const numOpenParentheses = str.replace(/[^(]/g, "").length;
  const numOpenBrackets = str.replace(/[^[]/g, "").length;

  if (numOpenParentheses === 0 && numOpenBrackets === 0) {
    return 0;
  }

  let currentDepth = 0;
  let maxDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === "(" || char === "[") {
      currentDepth++;
      if (currentDepth >= maxDepth) {
        maxDepth = currentDepth;
      }
    } else if (char === ")" || char === "]") {
      currentDepth--;
    }
  }
  return maxDepth;
}

function canonicalizeUnit(str) {
  let canonicalForm = str.slice();
  const maxDepthLimit = 3;
  const maxDepth = calcMaxDepth(str);

  if (maxDepth > maxDepthLimit) {
    console.log(
      `Nesting depth of ${maxDepth} exceeds maximum depth limit of ${maxDepthLimit}. Exiting canonicalization function...`
    );
    return null;
  }

  if (maxDepth === 0) {
    console.log("simplifying: " + canonicalForm);
    canonicalForm = toProductForm(canonicalForm);
    console.log("simplified to: " + canonicalForm);
    return canonicalForm;
  }

  const argStartIndex = findArgStartIndex(canonicalForm, maxDepth);
  const argEndIndex = findArgEndIndex(canonicalForm, maxDepth);

  //fragment before the opening parentheses or bracket
  let startFragment =
    argStartIndex > 1 ? canonicalForm.slice(0, argStartIndex - 1) : "";

  //fragment before the closing parentheses or bracket
  let endFragment =
    canonicalForm.length - argEndIndex > 1
      ? canonicalForm.slice(argEndIndex + 1, canonicalForm.length)
      : "";

  let arg = canonicalForm.slice(argStartIndex, argEndIndex);
  console.log("simplifying: " + arg);
  arg = toProductForm(arg);
  if (!arg) {
    console.log("error finding argument, exiting...");
    return false;
  }

  console.log("simplified to: " + arg);

  startFragment = startFragment.length > 0 ? startFragment.trim() : "";
  endFragment = endFragment.length > 0 ? endFragment.trim() : "";

  let charBefore = startFragment.slice(-1);
  let charAfter = endFragment.slice(0, 1);

  let outerExp = getOuterExponent(endFragment);

  if (!outerExp) {
    console.log("error finding outer exponent, exiting...");
    return false;
  }

  outerExp = charBefore === "/" ? outerExp * -1 : outerExp;
  arg = distributeExponent(arg, outerExp);

  if (!arg) {
    console.log("error finding argument, exiting...");
    return false;
  }

  startFragment =
    charBefore === "/" ? startFragment.slice(0, -1) : startFragment;

  endFragment = trimOuterExponent(endFragment);

  charBefore = startFragment.slice(-1);
  charAfter = endFragment.slice(0, 1);

  if (
    endFragment.length > 0 &&
    charAfter !== "*" &&
    charAfter !== "/" &&
    charAfter !== ")"
  ) {
    arg = arg + "*";
  }

  if (
    startFragment.length > 0 &&
    charBefore !== "*" &&
    charBefore !== "(" &&
    charBefore !== "^"
  ) {
    arg = "*" + arg;
  }

  canonicalForm = startFragment + arg + endFragment;

  return sanitizeUnit(canonicalForm);
}

function checkNumbersMatch(str1, str2, pctTolerance) {
  const correctNum = Number(str1);
  const submittedNum = Number(str2);
  let pctError = Math.abs((100 * (submittedNum - correctNum)) / correctNum);
  console.log("percent error: " + pctError);

  if (pctError < pctTolerance) {
    console.log("numbers match");
    return true;
  }

  if (pctError < 0.2) {
    //accept submitted numbers very close to the correct number, even if percent error set to 0
    // for example, consider 1/3 and 0.333 to be equal, even though they are not.
    console.log("numbers match");
    return true;
  }

  console.log("numbers do not match");
  return false;
}

function checkUnitComplexity(str) {
  if (str.includes("/")) {
    return true;
  }

  const unitArr = str.split("*");
  if (unitArr.length > 1) {
    return true;
  }

  const unitArr2 = str.split(" ");
  if (unitArr2.length > 1) {
    return true;
  }

  if (calcMaxDepth(str) > 0) {
    return true;
  }

  return false;
}

function distributeExponent(str, outerExp) {
  const arr1 = str.trim().split("*");

  const arr2 = arr1.map((el) => ({
    base: getBase(el),
    exp: outerExp * getExponent(el),
  }));

  const arr3 = arr2.map((el) => `${el.base}^${el.exp}`);

  const distributedForm = arr3.join("*");

  return distributedForm;
}

function factorialize(num) {
  const isInteger = Number.isInteger(num);

  if (num < 0) {
    return false;
  } else if (!isInteger) {
    return false;
  } else if (num == 0) {
    return 1;
  } else {
    return num * factorialize(num - 1);
  }
}

function findArgStartIndex(str, targetDepth) {
  if (targetDepth === 0) return 0;
  let currentDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === "(" || char === "[") {
      currentDepth++;
    }

    if (currentDepth === targetDepth) {
      return i + 1;
    }
  }
}

function findArgEndIndex(str, targetDepth) {
  if (targetDepth === 0) return str.length;
  let currentDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);

    if (char === "(" || char === "[") {
      currentDepth++;
    }

    if (currentDepth === targetDepth) {
      const remainingStr = str.slice(i + 1, str.length);
      let argLength;
      if (char === "(") {
        argLength = remainingStr.indexOf(")");
      }

      if (char === "[") {
        argLength = remainingStr.indexOf("]");
      }

      return i + argLength + 1;
    }
  }
}

function findUnit(str) {
  const foundUnit = units.find(
    (unit) =>
      str === unit.singular ||
      str === unit.plural ||
      str === unit.abbr ||
      unit.variants?.includes(str)
  );

  if (!foundUnit) return null;
  console.log("found unit: ");
  console.log(foundUnit);
  return foundUnit;
}

function findUnitSingularForm(str) {
  const foundUnit = units.find(
    (unit) =>
      str === unit.singular ||
      str === unit.plural ||
      str === unit.abbr ||
      unit.variants?.includes(str)
  );

  if (!foundUnit) return null;

  return foundUnit.singular;
}

function getExponent(str) {
  let strCopy = str.slice();

  const hasExponent = strCopy.includes("^");
  if (!hasExponent) return "1";

  let exponent = strCopy.match(/(?<=\^)-{0,1}(\d|\.)+/)?.at(0) || false;

  if (!exponent) {
    return false;
  } else {
    return exponent;
  }
}

function getOuterExponent(str) {
  let strCopy = str.slice();
  const firstChar = strCopy.slice(0, 1);
  const hasExponent = firstChar === "^";

  if (!hasExponent) return "1";

  strCopy = strCopy.replace(/\^\s*/, "^");
  const secondChar = str.slice(1, 2);

  const argumentWrapped = secondChar === ")" || secondChar === "]";

  if (argumentWrapped) {
    return strCopy;
  }

  const exponentWrapped = secondChar === "(" || secondChar === "[";

  if (exponentWrapped) {
    let wrappedExp =
      str.match(/(?<=\^)(\(|\[)-{0,1}(\d|\.)+(\)|\])/)?.at(0) || false;
    let unwrappedExp = wrappedExp
      .replace("(", "")
      .replace(")", "")
      .replace("[", "")
      .replace("]", "");

    return unwrappedExp;
  }

  if (!exponentWrapped) {
    const exponent = str.match(/(?<=\^)-{0,1}(\d|\.)+/g)?.at(0) || false;

    return exponent;
  }

  return false;
}

function getBase(str) {
  const hasExponent = str.includes("^");
  if (!hasExponent) return str.slice();

  const base = str.match(/\S+(?=\^)/)?.at(0);
  return base?.trim();
}

function isNumber(str) {
  //check if string is a number following type conversion
  return !isNaN(Number(str));
}

function logEndMessage(str) {
  console.log("");
  console.log("FINAL FORM");
  console.log(str);
  console.log("");
}

function logExecutionTime() {
  console.log("===========================");
  console.timeEnd("Execution Time");
  console.log("===========================");
}

function logSpacer(num) {
  if (!num) {
    console.log("");
    return;
  }
  for (let i = 0; i < num; i++) {
    console.log("");
  }
}

function logRoundEndMessage(str, round) {
  if (!str) {
    console.log(`Failed round ${round}. Exiting grading function...`);
    console.timeEnd("Execution Time");
  } else {
    console.log(str);
    console.log("");
  }
}

function logRoundStartMessage(str, round) {
  console.log(`ROUND ${round}`);
  console.log(str);
}

function logStartMessage(message, value) {
  console.log("");
  console.log(message);
  console.log("");
  console.log("INITIAL FORM:");
  console.log(value);
  console.log("");
}

function preCheckNumber(str) {
  //checks if number is well-formatted.
  console.log("running pre-check...");
  const numOpenParentheses = str.replace(/[^(]/g, "").length;
  const numClosedParentheses = str.replace(/[^)]/g, "").length;
  const numOpenBrackets = str.replace(/[^[]/g, "").length;
  const numClosedBrackets = str.replace(/[^\]]/g, "").length;
  const invalidChars = str.match(/[`@#$%&_={}|:;"',<>?]/g);
  const invalidOperators = str
    .replace(/sqrt/g, "")
    .replace(/ln/g, "")
    .replace(/log/g, "")
    .replace(/sin/g, "")
    .replace(/cos/g, "")
    .replace(/tan/g, "")
    .match(/[a-zA-Z]+/g, "");

  // check if number of open and close parentheses match
  if (numOpenParentheses !== numClosedParentheses) {
    console.log("number of open and closed parentheses do not match.");
    return false;
  }

  // check if number of open and close brackets match
  if (numOpenBrackets !== numClosedBrackets) {
    console.log("number of open and closed brackets do not match. ");
    return false;
  }

  // check if invalid characters present
  if (invalidChars?.length > 0) {
    console.log("invalid characters detected in number field");
    console.log(invalidChars);
    return false;
  }

  if (invalidOperators?.length > 0) {
    console.log("invalid operators detected in number field");
    console.log(invalidOperators);
    return false;
  }

  return true;
}

function preCheckUnit(str) {
  //checks if unit is well-formatted.
  console.log("running unit pre-check...");
  const numOpenParentheses = str.replace(/[^(]/g, "").length;
  const numClosedParentheses = str.replace(/[^)]/g, "").length;
  const numOpenBrackets = str.replace(/[^[]/g, "").length;
  const numClosedBrackets = str.replace(/[^\]]/g, "").length;
  const invalidChars = str.match(/[`@#$&_=+{}|:;"',<>?]/g);

  // check if number of open and close parentheses match
  if (numOpenParentheses !== numClosedParentheses) {
    console.log("number of open and closed parentheses do not match.");
    return false;
  }

  // check if number of open and close brackets match
  if (numOpenBrackets !== numClosedBrackets) {
    console.log("number of open and closed brackets do not match. ");
    return false;
  }

  // check if invalid characters present
  if (invalidChars?.length > 0) {
    console.log("submitted unit includes one or more invalid symbols");
    return false;
  }

  console.log("passed unit pre-check");

  return true;
}

function replaceTranscendentals(str) {
  let strCopy = str.slice();

  strCopy = strCopy
    .replace(/e/g, " 2.71828183 ")
    .replace(/pi/g, " 3.141593 ")
    .replace(/π/g, " 3.141593 ");
  return strCopy;
}

function sanitizeNumber(str) {
  console.log("sanitizing number...");
  const sanitizedStr = str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\\/g, "/")
    .replace(/\)(?=\w)/g, ")*")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*\^\s*/g, "^")
    .replace(/\s/g, "*");

  return sanitizedStr;
}

function sanitizeUnit(str) {
  console.log("sanitizing unit...");
  const tidiedStr = str
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\\/g, "/")
    .replace(/-(?=\D)/g, "*")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*\^\s*/g, "^")
    .replace(/\s/g, "*");

  return tidiedStr;
}

function simplifyFractions(str) {
  //simplify numerical fractions
  let strCopy = str.slice();
  const numFractions = strCopy.match(/(\d|\.)+\/(\d|\.)+/g);
  if (numFractions?.length > 0) {
    numFractions.forEach((fraction) => {
      const fractionArr = fraction.split("/");
      const numerator = fractionArr[0];
      const denominator = fractionArr[1];
      let value = Number(numerator) / Number(denominator);
      value = Math.round(value * 1000) / 1000;
      const valueString = value.toString();
      strCopy = strCopy.replace(fraction, valueString);
    });
  }

  return strCopy;
}

function simplifyNumber(str) {
  let simplifiedForm = str.slice();
  const maxDepthLimit = 3;
  const maxDepth = calcMaxDepth(str);

  if (maxDepth > maxDepthLimit) {
    console.log(
      `Nesting depth of ${maxDepth} exceeds maximum depth limit of ${maxDepthLimit}. Exiting simplfiyNumber function...`
    );
    return null;
  }

  if (maxDepth === 0) {
    console.log("simplifying: " + simplifiedForm);
    simplifiedForm = simplifyNumExpr(simplifiedForm);
    console.log("simplified to: " + simplifiedForm);
    return simplifiedForm;
  }

  const argStartIndex = findArgStartIndex(simplifiedForm, maxDepth);
  const argEndIndex = findArgEndIndex(simplifiedForm, maxDepth);

  //fragment before the opening parentheses or bracket
  let startFragment =
    argStartIndex > 1 ? simplifiedForm.slice(0, argStartIndex - 1) : "";

  //fragment before the closing parentheses or bracket
  let endFragment =
    simplifiedForm.length - argEndIndex > 1
      ? simplifiedForm.slice(argEndIndex + 1, simplifiedForm.length)
      : "";

  let arg = simplifiedForm.slice(argStartIndex, argEndIndex);
  console.log("simplifying: " + arg);
  arg = simplifyNumExpr(arg);
  if (!arg) return false;
  console.log("simplified to: " + arg);

  startFragment = startFragment.length > 0 ? startFragment.trim() : "";
  endFragment = endFragment.length > 0 ? endFragment.trim() : "";
  const charBefore = startFragment.slice(-1);
  const charAfter = endFragment.charAt(0);

  const numberBefore = startFragment.length > 0 ? isNumber(charBefore) : false;
  const numberAfter = endFragment.length > 0 ? isNumber(charAfter) : false;

  if (numberBefore) {
    arg = "*" + arg;
  }

  if (numberAfter) {
    arg = arg + "*";
  }

  if (
    startFragment.length === 0 ||
    charBefore === "(" ||
    charBefore === "[" ||
    charBefore === "-" ||
    charBefore === "+" ||
    charBefore === "^" ||
    numberBefore
  ) {
    simplifiedForm = startFragment + arg + endFragment;
    return simplifiedForm;
  }

  const arr = startFragment.split("*");
  const filteredArr = arr.filter((el) => el);
  let lastElem = filteredArr.pop() || null;
  const operator = lastElem.match(/[a-zA-Z]+/g)?.at(0);

  startFragment = startFragment.slice(0, -operator.length);
  console.log("operator: " + operator);

  switch (operator) {
    case "cos": {
      const value = Math.cos(arg).toString();
      simplifiedForm = startFragment + value + endFragment;
      break;
    }
    case "ln": {
      const value = Math.log(arg).toString();
      simplifiedForm = startFragment + value + endFragment;
      break;
    }
    case "log": {
      const value = Math.log10(arg).toString();
      simplifiedForm = startFragment + value + endFragment;
      break;
    }
    case "sin": {
      const value = Math.sin(arg).toString();
      simplifiedForm = startFragment + value + endFragment;
      break;
    }
    case "sqrt": {
      const value = Math.sqrt(arg).toString();
      simplifiedForm = startFragment + value + endFragment;
      break;
    }
    case "tan": {
      const value = Math.tan(arg).toString();
      simplifiedForm = startFragment + value + endFragment;
      break;
    }
    default: {
      console.log("unrecognized operator");
      console.log(operator);
      return false;
    }
  }

  return sanitizeNumber(simplifiedForm);
}

function simplifyNumExpr(str) {
  // takes a stringified numerical expression returns it in simplified form
  let strCopy = str.slice();
  const degrees = strCopy.match(/(\d|\.)+\s{0,1}°/g);
  if (degrees?.length > 0) {
    degrees.forEach((el) => {
      const angleDeg = strCopy.replace(/\s{0,1}°/, "");

      if (!isNumber(angleDeg)) {
        console.log("malformed angled");
        return false;
      }

      const angleRad = (angleDeg * 3.1415) / 180;

      strCopy = strCopy.replace(el, angleRad);
    });
    strCopy = sanitizeNumber(strCopy);
  }

  const exponents = strCopy.match(/(\d|\.)+\^-{0,1}(\d|\.)+/g);
  if (exponents?.length > 0) {
    exponents.forEach((el) => {
      const base = getBase(el);
      const exp = getExponent(el);
      const value = Math.pow(base, exp);
      strCopy = strCopy.replace(el, value);
    });
    strCopy = sanitizeNumber(strCopy);
  }

  const divisors = strCopy.match(/\/(\d|\.)+/g);
  if (divisors?.length > 0) {
    divisors.forEach((el) => {
      const divisor = el.replace("/", "");
      const value = 1 / Number(divisor);
      strCopy = strCopy.replace(el, `*${value}`);
    });
    strCopy = sanitizeNumber(strCopy);
  }

  const factorials = strCopy.match(/-{0,1}(\.|\d)+!/g);
  if (factorials?.length > 0) {
    factorials.forEach((el) => {
      const num = Number(el.match(/-{0,1}(\.|\d)+/g));
      const value = factorialize(num);
      if (!value) return false;
      strCopy = strCopy.replace(el, value.toString());
    });
  }

  for (let i = 0; i < 5; i++) {
    const posxpos = strCopy.match(/(\d|\.)+(\*)(\d|\.)+/g)?.at(0) || null;

    if (posxpos) {
      const arr = posxpos.trim().split("*");
      const value = arr.reduce((a, b) => a * b, 1);
      strCopy = strCopy.replace(posxpos, value);
    }

    const posxneg = strCopy.match(/(\d|\.)+(\*-)(\d|\.)+/g)?.at(0) || null;

    if (posxneg) {
      const arr = posxneg.trim().split("*");
      const value = arr.reduce((a, b) => a * b, 1);
      strCopy = strCopy.replace(posxneg, value);
    }

    if (!posxpos && !posxneg) {
      break;
    }
  }

  strCopy = strCopy.replace(/-\s*-/g, "+");
  strCopy = strCopy.replace(/(?<!\+)-/g, "+-");

  const sumArr = strCopy.split("+");
  if (sumArr.length > 0) {
    const tidiedArr = sumArr.map((el) => Number(el.replace("+", "")));
    strCopy = tidiedArr.reduce((a, b) => a + b, 0).toString();
  }

  if (strCopy === "NaN") {
    console.log("sum is not a number, exiting simplifyNumExpr function...");
    return false;
  }

  return strCopy;
}

function standardizeUnitString(str) {
  console.log("replacing with standard units...");
  let strCopy = str.slice();

  const terms = str.split("*");
  const arr1 = terms.map((term) => ({
    base: getBase(term),
    exp: getExponent(term),
  }));

  const arr2 = arr1
    .map((el) => ({
      base: findUnitSingularForm(el.base) || el.base,
      exp: el.exp,
    }))
    .sort(compareBases);

  // const arr3 = arr2.sort(compareBases);

  // const arr3 = arr2.map((el) =>
  //   isNaN(Number(el.base))
  //     ? `${el.base}^${el.exp}`
  //     : Math.pow(Number(el.base), Number(el.exp))
  // );

  const newTerms = arr2.map((el) => `${el.base}^${el.exp}`);

  strCopy = newTerms.join("*");

  return sanitizeUnit(strCopy);
}

function toProductForm(str) {
  let strCopy = str.slice();

  //handle non-numerical terms
  strCopy = strCopy.replace("/", "*/");
  const terms = strCopy.split("*");

  if (terms?.length > 0) {
    terms.forEach((term) => {
      if (isNaN(Number(term))) {
        let base = getBase(term);
        let exp = getExponent(term);

        if (base.includes("/")) {
          exp = exp * -1;
          base = base.replace("/", "");
        }
        const value = `${base}^${exp}`;
        strCopy = strCopy.replace(term, value);
      }
    });
  }
  return strCopy;
}

function trimOuterExponent(str) {
  let strCopy = str.slice();
  const firstChar = strCopy.slice(0, 1);
  const hasExponent = firstChar === "^";

  if (!hasExponent) return strCopy;

  strCopy = strCopy.replace(/\^\s*/, "^");
  const secondChar = strCopy.slice(1, 2);

  const exponentWrapped = secondChar === "(" || secondChar === "[";

  if (exponentWrapped) {
    let wrappedExp =
      str.match(/(?<=\^)(\(|\[)-{0,1}(\d|\.)+(\)|\])/g)?.at(0) || false;
    return strCopy.replace("^", "").replace(wrappedExp, "");
  }

  if (!exponentWrapped) {
    const exponent = str.match(/(?<=\^)-{0,1}(\d|\.)+/g)?.at(0) || false;
    return strCopy.replace("^", "").replace(exponent, "");
  }

  return strCopy;
}
