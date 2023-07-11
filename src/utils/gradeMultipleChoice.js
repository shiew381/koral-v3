export function gradeMultipleChoice(question, response) {
  const pointsPossible = question?.pointsPossible;

  const zeroScore = {
    answeredCorrectly: false,
    pointsAwarded: 0,
  };

  const fullScore = {
    answeredCorrectly: true,
    pointsAwarded: pointsPossible,
  };

  const correctChoices = [];

  question.answerChoices.forEach((el, ind) => {
    if (el.isCorrect) {
      correctChoices.push(ind);
    }
  });

  if (correctChoices.length !== response.length) {
    return zeroScore;
  }

  if (correctChoices.length === 1) {
    const answeredCorrectly = correctChoices[0] === response[0];

    return answeredCorrectly ? fullScore : zeroScore;
  }

  if (correctChoices.length > 1) {
    const answeredCorrectly = response.every(
      (el, ind) => el === correctChoices[ind]
    );

    return answeredCorrectly ? fullScore : zeroScore;
  }

  return;
}
