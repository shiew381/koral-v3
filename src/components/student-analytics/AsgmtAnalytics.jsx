import { useEffect, useState } from "react";
import {
  deleteQSetSubmissionHistory,
  getQSet,
  getQSetSubmissionHistory,
} from "../../utils/firestoreClient";
import { Lightbox } from "../common/Lightbox";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { formatTimeAndDate } from "../../utils/dateUtils";
import {
  calculateProgress,
  getSubmissions,
} from "../../utils/questionSetUtils";
import MultipleChoice from "../question-sets/QnMultipleChoice";
import { QuestionNav } from "../question-sets/QSetSharedCpnts";
import ShortAnswer from "../question-sets/QnShortAnswer";

export function AsgmtAnalytics({ asgmt, course, open, handleClose }) {
  const [submissionHistory, setSubmissionHistory] = useState(null);
  const [qSet, setQSet] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const [currentObjective, setCurrentObjective] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [resetting, setResetting] = useState(false);

  const currentObjectiveIDs = currentObjective?.questionIDs || [];
  const asgmtID = asgmt?.id;
  const courseID = course?.id;
  const userID = asgmt?.userID;
  const userDisplayName = asgmt?.userDisplayName;
  const userLastName = asgmt?.userLastName || "reset";

  const questions = qSet?.questions || [];
  const adaptiveQuestions =
    qSet?.mode === "adaptive"
      ? questions.filter((question) =>
          currentObjectiveIDs.includes(question.id)
        )
      : [];

  const qIndex = questions.findIndex((el) =>
    selQuestion ? el.id === selQuestion.id : 0
  );

  const adaptiveQIndex = adaptiveQuestions.findIndex((el) =>
    selQuestion ? el.id === selQuestion.id : 0
  );

  const backDisabled = qIndex <= 0;
  const nextDisabled = qIndex + 1 >= questions.length;

  const adaptiveBackDisabled = adaptiveQIndex <= 0;
  const adaptiveNextDisabled = adaptiveQIndex + 1 >= adaptiveQuestions.length;

  function goForward() {
    setSelQuestion(() => questions[qIndex + 1]);
  }

  function goBack() {
    setSelQuestion(() => questions[qIndex - 1]);
  }

  function goAdaptiveForward() {
    setSelQuestion(() => adaptiveQuestions[adaptiveQIndex + 1]);
  }

  function goAdaptiveBack() {
    setSelQuestion(() => adaptiveQuestions[adaptiveQIndex - 1]);
  }

  function handleChange(e) {
    setConfirmPhrase(e.target.value);
  }

  function resetResults() {
    setResetting(true);
    deleteQSetSubmissionHistory(courseID, asgmtID, userID);
    setTimeout(() => setResetting(false), 500);
    setTimeout(() => handleClose(), 700);
    setTimeout(() => setConfirmPhrase(""), 900);
  }

  useEffect(
    () => {
      if (!asgmt || !open) {
        return;
      }

      const docRef = asgmt.source?.docRef;
      const docRefArr = docRef.split("/");
      const docRefuserID = docRefArr[1];
      const docRefqSetID = docRefArr[3];

      getQSet(docRefuserID, docRefqSetID, setQSet, setLoading);
    },
    //eslint-disable-next-line
    [open, asgmtID, userID]
  );

  useEffect(() => {
    if (!asgmt || !open) {
      return;
    }

    getQSetSubmissionHistory(courseID, asgmtID, userID, setSubmissionHistory);
  }, [open, asgmtID, userID]);

  useEffect(
    () => {
      if (qSet?.mode !== "adaptive") {
        setSelQuestion(questions[0]);
        return;
      }

      if (qSet?.mode === "adaptive") {
        setCurrentObjective(qSet?.adaptiveParams?.objectives[0] || null);
        return;
      }
    },
    //eslint-disable-next-line
    [open, asgmtID, userID, qSet?.questions?.length, qSet?.mode]
  );

  useEffect(
    () => {
      if (qSet?.mode === "adaptive" && adaptiveQuestions?.length > 0) {
        setSelQuestion(adaptiveQuestions[0]);
        return;
      }
    },
    //eslint-disable-next-line
    [currentObjective?.name]
  );

  if (!asgmt || loading || !qSet) {
    return null;
  }

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      customStyle={{ maxWidth: "700px" }}
    >
      <Typography color="primary" variant="h6">
        {asgmt.title}
      </Typography>

      <Typography color="text.secondary" display="inline">
        {!asgmt.hasDateOpen && !asgmt.hasDateDue && "always available"}
        {asgmt.hasDateOpen &&
          !asgmt.hasDateDue &&
          `open ${formatTimeAndDate(asgmt.dateOpen)}`}
        {!asgmt.hasDateOpen &&
          asgmt.hasDateDue &&
          `due ${formatTimeAndDate(asgmt.dateDue)}`}
        {asgmt.hasDateOpen &&
          asgmt.hasDateDue &&
          `available ${formatTimeAndDate(asgmt.dateOpen)} - ${formatTimeAndDate(
            asgmt.dateDue
          )}`}
      </Typography>

      {qSet?.mode === "adaptive" && (
        <Typography color="text.secondary" display="inline" sx={{ mx: "10px" }}>
          |
        </Typography>
      )}

      {qSet?.mode === "adaptive" && (
        <Typography color="text.secondary" display="inline">
          adaptive mode
        </Typography>
      )}

      <Divider sx={{ marginTop: "5px", marginBottom: "15px" }} />

      <Typography color="primary" sx={{ px: "20px" }}>
        results for <strong>{userDisplayName}</strong>
      </Typography>
      <Box
        className="flex flex-col"
        sx={{ position: "absolute", top: "105px", right: "20px" }}
      >
        <Box className="flex flex-row">
          <TextField
            onChange={handleChange}
            placeholder={userLastName}
            size="small"
            sx={{ width: "150px" }}
            value={confirmPhrase}
          />
          <Button
            color="primary"
            disabled={resetting || confirmPhrase !== userLastName}
            onClick={resetResults}
          >
            {resetting ? <CircularProgress size={25} /> : "RESET"}
          </Button>
        </Box>
        <Typography color="text.secondary" variant="caption">
          type <strong>{userLastName}</strong> to enable reset
        </Typography>
        {/* <pre>{JSON.stringify(asgmt)}</pre> */}
      </Box>

      <br />
      <br />

      {qSet?.mode === "adaptive" && (
        <ProgressMeters
          currentObjective={currentObjective}
          qSet={qSet}
          submissionHistory={submissionHistory}
          setCurrentObjective={setCurrentObjective}
        />
      )}

      {qSet?.mode !== "adaptive" && (
        <QuestionNav
          gradebook
          backDisabled={backDisabled}
          nextDisabled={nextDisabled}
          goBack={goBack}
          goForward={goForward}
          qIndex={qIndex}
          questions={questions}
        />
      )}

      {qSet?.mode === "adaptive" && (
        <QuestionNav
          gradebook
          backDisabled={adaptiveBackDisabled}
          nextDisabled={adaptiveNextDisabled}
          goBack={goAdaptiveBack}
          goForward={goAdaptiveForward}
          qIndex={adaptiveQIndex}
          questions={adaptiveQuestions}
        />
      )}

      {qSet?.mode === "adaptive" && (
        <QuestionCard
          qSet={qSet}
          question={selQuestion}
          submissionHistory={submissionHistory}
        />
      )}

      {qSet?.mode !== "adaptive" && (
        <QuestionCard
          qSet={qSet}
          question={selQuestion}
          submissionHistory={submissionHistory}
        />
      )}
    </Lightbox>
  );
}

function QuestionCard({ question, submissionHistory }) {
  if (!question) {
    return (
      <div className="question-card-placeholder">
        <Typography color="text.secondary">
          please select a question from the list
        </Typography>
      </div>
    );
  }

  if (question) {
    const { type } = question;
    const submissions = getSubmissions(submissionHistory, question);

    return (
      <Card className="question-card" sx={{ bgcolor: "rgba(255,255,255,0.9)" }}>
        <Box className="question-card-actions">
          <Points question={question} submissions={submissions} />
        </Box>
        {type === "multiple choice" && (
          <MultipleChoice
            question={question}
            mode="gradebook"
            submissions={submissions}
          />
        )}
        {type === "short answer" && (
          <ShortAnswer
            question={question}
            mode="gradebook"
            submissions={submissions}
          />
        )}
      </Card>
    );
  }
}

function Points({ question, submissions }) {
  if (!question) return;
  const lastSubmission = submissions?.at(-1) || null;
  const pointsPossible = question.pointsPossible;
  const pointsAwarded = lastSubmission?.pointsAwarded || 0;
  const label = pointsPossible === 1 ? "point" : "points";

  return (
    <Typography>
      {pointsAwarded} / {pointsPossible + " " + label}
    </Typography>
  );
}

function ProgressMeters({
  currentObjective,
  qSet,
  setCurrentObjective,
  submissionHistory,
}) {
  const params = qSet.adaptiveParams;
  const rule = params.completionRule;
  const objectives = params.objectives;

  return (
    <Card className="adaptive-progress-card">
      {objectives?.map((objective) => (
        <ProgressTable
          currentObjective={currentObjective}
          key={objective?.name}
          objective={objective}
          rule={rule}
          setCurrentObjective={setCurrentObjective}
          submissionHistory={submissionHistory}
        />
      ))}
    </Card>
  );
}

function ProgressTable({
  currentObjective,
  objective,
  rule,
  setCurrentObjective,
  submissionHistory,
}) {
  const name = objective.name;
  const active = currentObjective?.name === name;
  const progress = calculateProgress(rule, objective, submissionHistory);
  const threshold = objective.completionThreshold;
  const progressLabel = progress.count + "/" + threshold;

  const objectiveIDs = objective?.questionIDs || [];
  const touchedIDs = submissionHistory
    ? Object.keys(submissionHistory).filter(
        (key) => key !== "id" && key !== "totalPointsAwarded"
      )
    : [];

  const commonIDs = touchedIDs.filter((id) => objectiveIDs.includes(id));
  const submissions = commonIDs.map((id) => submissionHistory[id]);
  const submissionAttempts = submissions.map((submission) => submission.length);
  const totalAttempts = submissionAttempts.reduce((acc, cur) => acc + cur, 0);
  const averageAttempts = (totalAttempts / commonIDs.length).toFixed(2);
  const correctSubmissions = submissions.filter(
    (submission) => submission.at(-1).answeredCorrectly
  );

  return (
    <table style={{ position: "relative", left: "3vw" }}>
      <tbody>
        <tr>
          <td style={{ width: "50px" }}>
            <Box className="adaptive-progress-container">
              <Box className="adaptive-progress-label">
                <Typography
                  color="text.secondary"
                  component="div"
                  variant="caption"
                >
                  {progressLabel}
                </Typography>
              </Box>
              <CircularProgress
                variant="determinate"
                value={progress.percentage}
              />
            </Box>
          </td>
          <td colSpan={2}>
            <Button
              color="primary"
              onClick={() => setCurrentObjective(objective)}
              sx={{
                p: 1,
                position: "relative",
                bottom: "3px",
                fontWeight: active ? "bold" : "normal",
              }}
            >
              {name}
            </Button>
          </td>
        </tr>
        <tr>
          <td></td>
          <td style={{ width: "250px", paddingLeft: "30px" }}>
            <Typography variant="subtitle2">questions attempted:</Typography>
          </td>
          <td>
            <Typography variant="subtitle2">{commonIDs.length}</Typography>
          </td>
        </tr>
        <tr>
          <td></td>
          <td style={{ width: "250px", paddingLeft: "30px" }}>
            <Typography variant="subtitle2">
              questions answered correctly:
            </Typography>
          </td>
          <td>
            <Typography variant="subtitle2">
              {correctSubmissions.length}
            </Typography>
          </td>
        </tr>
        <tr>
          <td></td>
          <td style={{ width: "250px", paddingLeft: "30px" }}>
            <Typography variant="subtitle2">
              average number of attempts:
            </Typography>
          </td>
          <td>
            <Typography variant="subtitle2">{averageAttempts}</Typography>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
