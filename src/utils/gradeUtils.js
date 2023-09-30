export function formatGrade(asgmt, userGrades) {
  const asgmtGrade = userGrades[asgmt.id];

  const totalPointsAwarded = asgmtGrade?.totalPointsAwarded;
  const totalPointsPossible = asgmtGrade?.totalPointsPossible;

  if (!asgmtGrade) {
    return "N/A";
  }

  return totalPointsAwarded + " of " + totalPointsPossible;
}

export function getPointsAwarded(
  grade,
  totalPointsAwarded,
  adaptive,
  adaptiveParams,
  oneToCompletion
) {
  let updatedPointsAwarded = 0;
  const answeredCorrectly = grade.answeredCorrectly;

  if (!adaptive) {
    updatedPointsAwarded = totalPointsAwarded + grade.pointsAwarded;
    return updatedPointsAwarded;
  }

  if (adaptive && oneToCompletion && answeredCorrectly) {
    const totalPointsPossible = adaptiveParams?.totalPointsPossible || 0;
    return totalPointsPossible;
  }

  if (adaptive) {
    // not answered correctly or more than one remaining question to completion
    return 0;
  }
}
