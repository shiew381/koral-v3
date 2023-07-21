import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchQSetSubmissionHistory,
  getAssignment,
  getQSet,
} from "../utils/firestoreClient";
import { getSubmissions } from "../utils/questionSetUtils";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { LoadingIndicator, Page } from "../components/common/Pages";
import {
  QSetContainer,
  QuestionCardPanel,
  QuestionNav,
  QuestionList,
} from "../components/question-sets/QSetSharedCpnts";
import MultipleChoice from "../components/question-sets/QnMultipleChoice";
import ShortAnswer from "../components/question-sets/QnShortAnswer";
import FreeResponse from "../components/question-sets/QnFreeResponse";
import "../css/QuestionSet.css";
import { BtnContainer } from "../components/common/Buttons";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function CourseAsgmtPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [asgmt, setAsgmt] = useState(null);
  const [qSet, setQSet] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const { courseID, asgmtID } = useParams();

  useEffect(
    () => {
      getAssignment(courseID, asgmtID, setAsgmt);
    },
    //eslint-disable-next-line
    []
  );

  useEffect(
    () => {
      if (!asgmt) {
        return;
      }

      const docRef = asgmt.source?.docRef;
      const docRefArr = docRef.split("/");
      const userID = docRefArr[1];
      const qSetID = docRefArr[3];

      getQSet(userID, qSetID, setQSet, setLoading);
    },
    //eslint-disable-next-line
    [asgmt?.id]
  );

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <Page>
      <BackToStudentDashboard />
      <QuestionSetDisplay
        asgmtID={asgmtID}
        courseID={courseID}
        qSet={qSet}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
        user={user}
      />
    </Page>
  );
}

function QuestionSetDisplay({
  asgmtID,
  courseID,
  qSet,
  selQuestion,
  setSelQuestion,
  user,
}) {
  const [submissionHistory, setSubmissionHistory] = useState(null);
  const [progress, setProgress] = useState(0);

  const questions = qSet?.questions || [];
  const qIndex = questions.findIndex((el) =>
    selQuestion ? el.id === selQuestion.id : 0
  );

  useEffect(
    () => {
      if (!user) return;
      fetchQSetSubmissionHistory(courseID, asgmtID, user, setSubmissionHistory);
    },
    //eslint-disable-next-line
    [user]
  );

  useEffect(
    () => {
      if (questions?.length === 0) return;
      setSelQuestion(questions[0]);
    },
    //eslint-disable-next-line
    []
  );

  if (qSet?.mode === "adaptive") {
    return (
      <QSetContainer>
        <QuestionCardPanel>
          <AdaptiveProgress
            progress={progress}
            qSet={qSet}
            submissionHistory={submissionHistory}
          />
          <AdaptiveCard
            asgmtID={asgmtID}
            courseID={courseID}
            qSet={qSet}
            setProgress={setProgress}
            submissionHistory={submissionHistory}
            user={user}
          />
        </QuestionCardPanel>
      </QSetContainer>
    );
  }

  return (
    <QSetContainer>
      <Box className="question-list-container">
        <QuestionList
          questions={questions}
          selQuestion={selQuestion}
          setSelQuestion={setSelQuestion}
          submissionHistory={submissionHistory}
        />
      </Box>
      <QuestionNav
        qIndex={qIndex}
        questions={questions}
        setSelQuestion={setSelQuestion}
      />
      <QuestionCardPanel>
        <QuestionCard
          asgmtID={asgmtID}
          courseID={courseID}
          question={selQuestion}
          submissionHistory={submissionHistory}
          user={user}
        />
      </QuestionCardPanel>
    </QSetContainer>
  );
}

function AdaptiveProgress({ qSet, progress, submissionHistory }) {
  //TODO: extract component for single row of table, based on one objective, then map through....
  const params = qSet.adaptiveParams;
  const objective = params.objectives[0];
  const objectiveName = objective.name;
  const threshold = objective.completionThreshold;

  const numCorrect = Math.round((progress / 100) * threshold);
  const progressLabel = numCorrect + "/" + threshold;

  if (!submissionHistory) return null;

  return (
    <Card className="adaptive-progress-card" sx={{ p: 3 }}>
      <Typography>
        Progress is based on the total number of questions answered correctly
      </Typography>
      <table>
        <tbody>
          <tr>
            <td>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress variant="determinate" value={progress} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                  >
                    {progressLabel}
                  </Typography>
                </Box>
              </Box>
            </td>
            <td>
              <Typography sx={{ p: 2 }} align="center">
                {objectiveName}
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min) + min);
}

//TODO: write pickObjective function

function pickQuestion(params, questions, submissionHistory) {
  if (!submissionHistory) return;

  // determine hi
  const objective1 = params?.objectives[0];
  const objective1IDs = objective1.questionIDs;
  const touchedIDs = Object.keys(submissionHistory);
  const untouchedIDs = objective1IDs.filter((id) => !touchedIDs.includes(id));

  const correctIDs = touchedIDs.filter(
    (id) => submissionHistory[id].at(-1).answeredCorrectly
  );
  //questions attempted but answered incorrectly
  const incorrectIDs = touchedIDs.filter((id) => !correctIDs.includes(id));

  console.log("SUBMISSION HISTORY");

  console.log("==============");
  // console.log("ADAPTIVE PARAMETERS");
  // console.table({
  //   completionRule: completionRule,
  //   objective1: objective1Name,
  // });

  console.log("objective 1 IDs: ");
  console.log(objective1IDs);
  console.log("");
  console.log("touched IDs");
  console.log(touchedIDs);
  console.log("");
  console.log("unspentIDs");
  console.log(untouchedIDs);
  console.log("");
  console.log("answered correctly: ");
  console.log(correctIDs);
  console.log("");
  console.log("answered incorrectly: ");
  console.log(incorrectIDs);

  if (incorrectIDs.length > 0) {
    return questions.find((question) => question.id === incorrectIDs[0]);
  }

  const randomIndex = getRandomInt(0, untouchedIDs.length);

  const pickedID = untouchedIDs[randomIndex];
  const foundQuestion = questions.find((question) => question.id === pickedID);

  console.log(foundQuestion);

  if (questions.length === 0) return null;
  return foundQuestion;
}

function calculateProgress(params, objIndex, submissionHistory) {
  const completionRule = params.completionRule;
  const objectives = params.objectives;
  const objective = objectives[objIndex];
  const completionThreshold = Number(objective.completionThreshold);
  const objectiveIDs = objective.questionIDs;

  if (!submissionHistory) return 0;

  const touchedIDs = Object.keys(submissionHistory);
  //question answered correctly across all objectives
  const correctIDs = touchedIDs.filter(
    (id) => submissionHistory[id].at(-1).answeredCorrectly
  );

  if (completionRule === "total correct") {
    // ids that count towards fulfilling the objective completion rule
    const qualifyingIDs = objectiveIDs.filter((id) => correctIDs.includes(id));
    console.log("qualifying IDs:");
    console.log(qualifyingIDs);

    const progress = 100 * (qualifyingIDs.length / completionThreshold);

    return progress;
  }

  return 0;
}

function AdaptiveCard({
  asgmtID,
  courseID,
  qSet,
  setProgress,
  submissionHistory,
  user,
}) {
  const [selQuestion, setSelQuestion] = useState(null);
  const questions = qSet.questions;
  const type = selQuestion?.type;
  const submissions = getSubmissions(submissionHistory, selQuestion);
  const lastSubmission = submissions?.at(-1) || null;
  const params = qSet.adaptiveParams;
  const docRefParams = {
    asgmtID: asgmtID,
    courseID: courseID,
    userID: user.uid,
  };

  const cardColor = { bgColor: "rgba(255, 255, 255, 0.2)" };

  function handlePickQuestion() {
    const picked = pickQuestion(params, questions, submissionHistory);
    setSelQuestion(picked);
  }

  function updateProgress() {
    const updated = calculateProgress(params, 0, submissionHistory);
    setProgress(updated);
  }

  useEffect(() => {
    if (!selQuestion) {
      //pick first question to display on mount
      handlePickQuestion();
      console.log("use effect triggerred");
    }
    setTimeout(updateProgress, 1200);
  }, [submissionHistory]);

  // useEffect(() => {}, [selQuestion?.id]);

  if (!selQuestion) return null;

  return (
    <Card className="adaptive-card" sx={cardColor}>
      <BtnContainer right>
        {lastSubmission?.answeredCorrectly ? (
          <Button>Next</Button>
        ) : (
          <Tooltip title="pick another question">
            <IconButton onClick={handlePickQuestion}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </BtnContainer>

      {type === "short answer" && (
        <ShortAnswer
          docRefParams={docRefParams}
          mode="course"
          question={selQuestion}
          submissions={submissions}
        />
      )}
    </Card>
  );
}

function QuestionCard({
  asgmtID,
  courseID,
  question,
  submissionHistory,
  user,
}) {
  const docRefParams = {
    asgmtID: asgmtID,
    courseID: courseID,
    userID: user.uid,
  };

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
    const cardColor = { bgColor: "rgba(255, 255, 255, 0.2)" };

    return (
      <Card className="question-card" sx={cardColor}>
        {type === "multiple choice" && (
          <MultipleChoice
            docRefParams={docRefParams}
            mode="course"
            question={question}
            submissions={submissions}
          />
        )}
        {type === "short answer" && (
          <ShortAnswer
            docRefParams={docRefParams}
            mode="course"
            question={question}
            submissions={submissions}
          />
        )}
        {type === "free response" && (
          <FreeResponse
            docRefParams={docRefParams}
            mode="course"
            question={question}
            submissions={submissions}
          />
        )}
      </Card>
    );
  }
}

export function BackToStudentDashboard() {
  const navigate = useNavigate();
  const { courseID, title } = useParams();

  function redirectToStudentDashboard() {
    navigate(`/classroom/courses/${title}/${courseID}/student/dashboard`);
  }

  return (
    <div className="page-actions">
      <Button
        startIcon={<ChevronLeftIcon />}
        onClick={redirectToStudentDashboard}
      >
        Course Dashboard
      </Button>
    </div>
  );
}
