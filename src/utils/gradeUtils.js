export function formatGrade(asgmt, userGrades) {
  const asgmtGrade = userGrades[asgmt.id];

  const totalPointsAwarded = asgmtGrade?.totalPointsAwarded;
  const totalPointsPossible = asgmtGrade?.totalPointsPossible;

  if (!asgmtGrade) {
    return "N/A";
  }

  return totalPointsAwarded + " of " + totalPointsPossible;
}
