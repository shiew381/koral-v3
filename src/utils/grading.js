import { gradeMultipleChoice } from "./gradeMultipleChoice";
import { gradeShortAnswer } from "./gradeShortAnswer";

export function gradeResponse(question, response) {
  const { type } = question;

  switch (type) {
    case "multiple choice": {
      const result = gradeMultipleChoice(question, response);
      return result;
    }
    case "short answer": {
      const result = gradeShortAnswer(question, response);
      return result;
    }

    default:
      break;
  }

  return;
}
