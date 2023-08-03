export function copyArray(arr) {
  return JSON.parse(JSON.stringify(arr));
}

export function formatInstructorNames(instructors) {
  if (!Array.isArray(instructors)) return null;

  const instructorNames = instructors.map(
    (instructor) => instructor.firstName + " " + instructor.lastName
  );

  return instructorNames.join(", ");
}

export function generateRandomCode(length) {
  let randomCode = "";
  // removed 'I' and 'l' from characters list, since these look identical with the website font and may cause confusion
  const characters = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    randomCode += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return randomCode;
}

export function compareBases(a, b) {
  if (a.base.toLowerCase() < b.base.toLowerCase()) return -1;
  if (a.base.toLowerCase() > b.base.toLowerCase()) return 1;
  return 0;
}

export function pickRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min) + min);
}

export function searchifyTags(rawTags) {
  function isArticle(str) {
    switch (str) {
      case "of":
      case "the":
      case "and":
        return false;
      default:
        return true;
    }
  }

  function isPhrase(str) {
    return /\s/.test(str);
  }

  if (!Array.isArray(rawTags)) return [];

  // lower cases and replaces continguous spaces with a single space
  const wholeTags = rawTags.map((el) =>
    el.toLowerCase().replace(/\s+/g, " ").trim()
  );

  const phrases = wholeTags.filter((el) => isPhrase(el));
  if (!phrases || phrases.length === 0) return wholeTags;

  const atomizedPhrases = [];
  phrases.forEach((phrase) => {
    const atomizedPhrase = phrase.split(" ");
    atomizedPhrases.push(...atomizedPhrase);
  });

  const filteredAtomizedPhrases = atomizedPhrases.filter((el) => isArticle(el));

  const wholeAndAtomizedTags = [...wholeTags, ...filteredAtomizedPhrases];
  return wholeAndAtomizedTags;
}

export function searchifyStr(str) {
  if (typeof str !== "string") return "";

  const arr = str.split(" ");
  const lowercaseArr = arr.map((tag) => tag.toLowerCase());
  const normalizedArr = [...new Set(lowercaseArr)]; // removes duplicate elements from array

  return normalizedArr.filter((el) => el); // removes undefined elements from array
}

export function truncateString(str, maxLength) {
  if (typeof str !== "string") {
    return "error parsing string";
  }
  if (str.length < maxLength) {
    return str;
  } else {
    return str.slice(0, maxLength - 3) + "...";
  }
}

export function alphabetize(arr) {
  // alphabetizes an array of strings

  function compare(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  }

  const sortedArr = arr.sort(compare);
  return sortedArr;
}
