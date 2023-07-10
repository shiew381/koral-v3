export function gradeMultipleChoice(question, response) {
  const pointsPossible = question?.pointsPossible;

  const correctChoices = [];
  question.answerChoices.forEach((el, ind) => {
    if (el.isCorrect) {
      correctChoices.push(ind);
    }
  });

  const answeredCorrectly = response.every(
    (el, ind) => el === correctChoices[ind]
  );

  const pointsAwarded = answeredCorrectly ? pointsPossible : 0;

  return {
    answeredCorrectly: answeredCorrectly,
    pointsAwarded: pointsAwarded,
  };
}
