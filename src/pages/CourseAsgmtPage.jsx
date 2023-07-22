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
import { pickRandomInt } from "../utils/commonUtils";

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
          <AdaptiveDisplay
            asgmtID={asgmtID}
            courseID={courseID}
            qSet={qSet}
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

function AdaptiveDisplay({ asgmtID, courseID, qSet, submissionHistory, user }) {
  const [currentObjective, setCurrentObjective] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const params = qSet.adaptiveParams;
  const objectives = params.objectives;
  const questions = qSet.questions;

  function pickObjective() {
    const rule = params.completionRule;

    for (let i = 0; i < objectives.length; i++) {
      const objective = objectives[i];
      const threshold = objective.completionThreshold;
      const objectiveIDs = objective.questionIDs;
      const touchedIDs = objectiveIDs.filter((id) =>
        Object.hasOwn(submissionHistory, id)
      );

      if (rule == "total correct") {
        const lastSubmissions = touchedIDs.map((id) =>
          submissionHistory[id]?.at(-1)
        );
        const correctSubmissions = lastSubmissions.filter(
          (lastSubmission) => lastSubmission.answeredCorrectly
        );

        const numCorrect = correctSubmissions.length;

        console.log(objective.name);

        if (numCorrect < threshold) {
          console.log("picked " + objective.name);
          setCurrentObjective(objective);
          return;
        }
      }
    }
  }

  function handlePickQuestion() {
    console.log(currentObjective);
    const picked = pickQuestion(currentObjective, questions, submissionHistory);
    setSelQuestion(picked);
  }

  useEffect(
    () => {
      //pick first question to display on mount
      if (!selQuestion) {
        handlePickQuestion();
        pickObjective();
      }
    },
    //eslint-disable-next-line
    [submissionHistory]
  );

  useEffect(
    () => {
      //pick first question when starting new objective
      handlePickQuestion();
    },
    //eslint-disable-next-line
    [currentObjective?.name]
  );

  return (
    <>
      <ProgressMeters qSet={qSet} submissionHistory={submissionHistory} />
      <AdaptiveQuestionCard
        asgmtID={asgmtID}
        courseID={courseID}
        handlePickQuestion={handlePickQuestion}
        qSet={qSet}
        selQuestion={selQuestion}
        submissionHistory={submissionHistory}
        user={user}
      />
    </>
  );
}

function ProgressMeters({ qSet, submissionHistory }) {
  const params = qSet.adaptiveParams;
  const rule = params.completionRule;
  const objectives = params.objectives;

  if (!submissionHistory) return null;

  return (
    <Card className="adaptive-progress-card" sx={{ p: 3 }}>
      <Typography sx={{ p: 2 }}>
        Progress based on total number of questions answered correctly
      </Typography>
      <table style={{ paddingLeft: "50px" }}>
        <tbody>
          {objectives.map((objective) => (
            <ProgressRow
              key={objective.name}
              objective={objective}
              rule={rule}
              submissionHistory={submissionHistory}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ProgressRow({ rule, objective, submissionHistory }) {
  const objectiveName = objective.name;

  const threshold = objective.completionThreshold;

  const progress = calculateProgress(
    rule,
    threshold,
    objective,
    submissionHistory
  );
  const progressLabel = progress.numCorrect + "/" + threshold;
  return (
    <tr>
      <td>
        <Box className="adaptive-progress-container">
          <CircularProgress variant="determinate" value={progress.percentage} />
          <Box className="adaptive-progress-label">
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
  );
}

function pickQuestion(objective, questions, submissionHistory) {
  if (!submissionHistory) return;

  const objectiveIDs = objective?.questionIDs || [];

  const touchedIDs = objectiveIDs.filter((id) =>
    Object.hasOwn(submissionHistory, id)
  );

  const untouchedIDs = objectiveIDs.filter((id) => !touchedIDs.includes(id));

  const qIndex = pickRandomInt(0, untouchedIDs.length);

  const pickedID = untouchedIDs[qIndex];
  const foundQuestion = questions.find((question) => question.id === pickedID);

  return foundQuestion;
}

function calculateProgress(rule, threshold, objective, submissionHistory) {
  if (!submissionHistory) return 0;

  const objectiveIDs = objective.questionIDs;
  const touchedIDs = objectiveIDs.filter((id) =>
    Object.hasOwn(submissionHistory, id)
  );

  if (rule == "total correct") {
    const lastSubmissions = touchedIDs.map((id) =>
      submissionHistory[id]?.at(-1)
    );

    const correctSubmissions = lastSubmissions.filter(
      (lastSubmission) => lastSubmission.answeredCorrectly
    );

    const numCorrect = correctSubmissions.length;
    const percentage = 100 * (numCorrect / threshold);

    return { percentage, numCorrect };
  }

  return 0;
}

function AdaptiveQuestionCard({
  asgmtID,
  courseID,
  handlePickQuestion,
  selQuestion,
  submissionHistory,
  user,
}) {
  const cardColor = { bgColor: "rgba(255, 255, 255, 0.2)" };
  const type = selQuestion?.type;
  const submissions = getSubmissions(submissionHistory, selQuestion);
  const lastSubmission = submissions?.at(-1) || null;

  const docRefParams = {
    asgmtID: asgmtID,
    courseID: courseID,
    userID: user.uid,
  };

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
