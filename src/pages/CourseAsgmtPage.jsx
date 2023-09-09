import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteUserSubmissionHistory,
  fetchQSetSubmissionHistory,
  getAssignment,
  getQSet,
  saveAdaptivePointsAwarded,
  updateAdaptiveFullPoints,
} from "../utils/firestoreClient";
import {
  calculateProgress,
  getSubmissions,
  pickQuestion,
} from "../utils/questionSetUtils";
// import { pickRandomInt } from "../utils/commonUtils";
import { formatTimeAndDate } from "../utils/dateUtils";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Tooltip,
  Typography,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
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
import { BackToStudentDashboard } from "../components/common/CourseCpnts";
import "../css/QuestionSet.css";

export default function CourseAsgmtPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [asgmt, setAsgmt] = useState(null);
  const [qSet, setQSet] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const { courseID, asgmtID } = useParams();
  const currentDate = new Date();
  const currentDateMillis = currentDate.getTime();

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

  function beforeDateOpen() {
    const dateOpen = asgmt.dateOpen.toDate();
    const dateOpenMillis = dateOpen.getTime();

    if (!asgmt.hasDateOpen) {
      return false;
    }

    if (currentDateMillis > dateOpenMillis) {
      return false;
    }

    return true;
  }

  function afterDateDue() {
    const dateDue = asgmt.dateDue.toDate();
    const dateDueMillis = dateDue.getTime();

    if (!asgmt.hasDateDue) {
      return false;
    }

    if (currentDateMillis < dateDueMillis) {
      return false;
    }

    return true;
  }

  if (beforeDateOpen()) {
    return (
      <Page>
        <BackToStudentDashboard location="assignments" />
        <Box className="flex flex-center" sx={{ height: "80vh" }}>
          <Box>
            <Typography align="center">assignment will open</Typography>
            <Typography color="primary" variant="h6">
              {formatTimeAndDate(asgmt.dateOpen?.toDate())}
            </Typography>
          </Box>
        </Box>
      </Page>
    );
  }

  if (afterDateDue()) {
    return (
      <Page>
        <BackToStudentDashboard location="assignments" />
        <Box className="flex flex-center" sx={{ height: "80vh" }}>
          <Box>
            <Typography align="center" color="text.secondary">
              due date
            </Typography>
            <Typography color="primary" variant="h6">
              {formatTimeAndDate(asgmt.dateDue?.toDate())}
            </Typography>
            <br />
            <Typography align="center">
              This assignment is now closed
            </Typography>
          </Box>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <BackToStudentDashboard location="assignments" />
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

  const backDisabled = qIndex <= 0;
  const nextDisabled = qIndex + 1 >= questions.length;

  const docRefParams = {
    asgmtID: asgmtID,
    courseID: courseID,
    userID: user.uid,
  };

  function goBack() {
    setSelQuestion(() => questions[qIndex - 1]);
  }

  function goForward() {
    setSelQuestion(() => questions[qIndex + 1]);
  }

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
            docRefParams={docRefParams}
            qSet={qSet}
            submissionHistory={submissionHistory}
          />
        </QuestionCardPanel>
      </QSetContainer>
    );
  }

  return (
    <QSetContainer>
      <Box className="question-list-container">
        <QuestionList
          draggable={false}
          questions={questions}
          selQuestion={selQuestion}
          setSelQuestion={setSelQuestion}
          submissionHistory={submissionHistory}
        />
      </Box>
      <QuestionNav
        backDisabled={backDisabled}
        goBack={goBack}
        goForward={goForward}
        nextDisabled={nextDisabled}
        qIndex={qIndex}
        questions={questions}
      />
      <QuestionCardPanel>
        <QuestionCard
          docRefParams={docRefParams}
          goForward={goForward}
          nextDisabled={nextDisabled}
          qSet={qSet}
          question={selQuestion}
          submissionHistory={submissionHistory}
        />
      </QuestionCardPanel>
    </QSetContainer>
  );
}

function ruleDescription(rule) {
  if (rule === "total correct") {
    return "the number of question answered correctly.";
  }

  if (rule === "consecutive correct") {
    return "the number of consecutive questions answered correctly. Answering incorrectly will reset the progress meter back to zero.";
  }

  if (rule === "chutes and ladders") {
    return "the number of questions answered correctly minus the number of questions answered incorrectly.";
  }

  return "";
}

function AdaptiveDisplay({ docRefParams, qSet, submissionHistory }) {
  const [loading, setLoading] = useState(true);
  const [objIndex, setObjIndex] = useState(-1);
  const [selQuestion, setSelQuestion] = useState(null);
  const params = qSet.adaptiveParams;
  const objectives = params.objectives;
  const currentObjective = objectives[objIndex];
  const questions = qSet.questions;
  const rule = params.completionRule;
  const progress = calculateProgress(rule, currentObjective, submissionHistory);

  function handlePickQuestion() {
    if (progress.percentage === 100) {
      setSelQuestion(null);
      return;
    }
    const picked = pickQuestion(currentObjective, questions, submissionHistory);
    setSelQuestion(picked);
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 1800);
  }, []);

  useEffect(
    () => {
      handlePickQuestion();
    },
    //eslint-disable-next-line
    [objIndex]
  );

  useEffect(() => {
    if (progress.percentage < 99) {
      console.log("progress marker trigerred, but not complete yet");
    }
    if (progress.percentage > 99) {
      updateAdaptiveFullPoints(docRefParams, params);
      console.log("progress marker trigerred");
    }
  }, [progress?.percentage]);

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  if (objIndex === -1)
    return (
      <Card className="adaptive-progress-card flex" sx={{ minHeight: "400px" }}>
        <Box className="flex flex-col flex-grow flex-center">
          <>
            <Typography align="center">
              This adaptive question set covers the following learning
              objectives:
            </Typography>
            <br />
            {objectives.map((objective, ind) => (
              <Typography
                key={objective.name}
                align="center"
                color="primary"
                sx={{ mb: 1 }}
              >
                Objective #{ind + 1}: {objective.name}
              </Typography>
            ))}
            <br />
            <Typography align="center">Progress will be based on</Typography>
            <Typography align="center">{ruleDescription(rule)}</Typography>
            <br />
            <Button
              onClick={() => setObjIndex((curIndex) => curIndex + 1)}
              variant="contained"
            >
              LET&apos;S BEGIN!
            </Button>
          </>
        </Box>
      </Card>
    );

  if (selQuestion === "exhausted") {
    return (
      <>
        <ProgressMeters
          currentObjective={currentObjective}
          qSet={qSet}
          submissionHistory={submissionHistory}
        />
        <Card
          className="adaptive-progress-card flex"
          sx={{ minHeight: "400px" }}
        >
          <Box className="flex flex-col flex-grow flex-center">
            <Typography>Exhausted all available questions...</Typography>
            <Button
              onClick={() => {
                deleteUserSubmissionHistory(docRefParams);
                setObjIndex(-1);
              }}
            >
              Reset
            </Button>
          </Box>
        </Card>
      </>
    );
  }

  if (
    progress.percentage >= 99 &&
    objIndex < objectives.length - 1 &&
    !selQuestion
  ) {
    return (
      <>
        <ProgressMeters
          currentObjective={currentObjective}
          qSet={qSet}
          submissionHistory={submissionHistory}
        />
        <Card
          className="adaptive-progress-card flex"
          sx={{ minHeight: "400px" }}
        >
          <Box className="flex flex-col flex-grow flex-center">
            <Typography align="center" sx={{ mb: "2px" }}>
              Nice job! You completed
            </Typography>
            <Typography align="center" color="primary">
              Objective #{objIndex + 1 + ": " + objectives[objIndex]?.name}
            </Typography>
            <br />
            <Typography align="center" sx={{ mb: "2px" }}>
              Next up
            </Typography>
            <Typography
              align="center"
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              Objective #{objIndex + 2 + ": " + objectives[objIndex + 1]?.name}
            </Typography>
            <br />
            <Button
              onClick={() => setObjIndex((curIndex) => curIndex + 1)}
              variant="contained"
            >
              BEGIN NEXT OBJECTIVE
            </Button>
          </Box>
        </Card>
      </>
    );
  }

  if (progress.percentage >= 99 && objIndex === objectives.length - 1) {
    saveAdaptivePointsAwarded(docRefParams, params.totalPointsPossible);

    return (
      <>
        <ProgressMeters
          currentObjective={currentObjective}
          qSet={qSet}
          submissionHistory={submissionHistory}
        />
        <Card
          className="adaptive-progress-card flex"
          sx={{ minHeight: "400px" }}
        >
          <Box
            className="adaptive-qset-complete-container"
            sx={{ backgroundImage: `url(${import.meta.env.VITE_CONFETTI})` }}
          >
            <Box sx={{ bgcolor: "rgba(255,255,255,0.9)", p: 3 }}>
              <Typography
                color="primary"
                sx={{ bgcolor: "white", p: 3 }}
                variant="h6"
              >
                You completed all the objectives. Nicely done!
              </Typography>
            </Box>
          </Box>
        </Card>
      </>
    );
  }

  return (
    <>
      <ProgressMeters
        currentObjective={currentObjective}
        qSet={qSet}
        submissionHistory={submissionHistory}
      />
      <AdaptiveQuestionCard
        docRefParams={docRefParams}
        handlePickQuestion={handlePickQuestion}
        selQuestion={selQuestion}
        submissionHistory={submissionHistory}
      />
    </>
  );
}

function ProgressMeters({ currentObjective, qSet, submissionHistory }) {
  const params = qSet.adaptiveParams;
  const rule = params.completionRule;
  const objectives = params.objectives;

  return (
    <Card className="adaptive-progress-card" sx={{ px: 3, pt: 2, pb: 1 }}>
      <table style={{ paddingLeft: "50px" }}>
        <tbody>
          {objectives?.map((objective) => (
            <ProgressRow
              key={objective?.name}
              currentObjective={currentObjective}
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

function ProgressRow({ currentObjective, objective, rule, submissionHistory }) {
  const name = objective.name;
  const active = currentObjective?.name === name;

  const progress = calculateProgress(rule, objective, submissionHistory);

  const threshold = objective.completionThreshold;
  const progressLabel = progress.count + "/" + threshold;

  return (
    <tr>
      <td style={{ width: "50px" }}>
        <Box className="adaptive-progress-container">
          {progress.percentage < 100 ? (
            <>
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
            </>
          ) : (
            <Box sx={{ position: "relative", bottom: "2px", left: "7px" }}>
              <DoneIcon color="primary" />
            </Box>
          )}
        </Box>
      </td>
      <td>
        <Typography
          color="primary"
          sx={{
            p: 1,
            position: "relative",
            bottom: "3px",
            fontWeight: active ? "bold" : "normal",
          }}
        >
          {name}
        </Typography>
      </td>
    </tr>
  );
}

function getTotalPointsAwarded(submissionHistory, qSet) {
  if (!submissionHistory) {
    return 0;
  }

  const questions = qSet.questions;
  const pointArr = [];

  questions?.forEach((question) => {
    const submissions = getSubmissions(submissionHistory, question);
    const lastSubmission = submissions?.at(-1) || null;
    pointArr.push(lastSubmission?.pointsAwarded || 0);
  });

  const totalPointsAwarded = pointArr.reduce((acc, cur) => acc + cur, 0);

  return totalPointsAwarded;
}

function AdaptiveQuestionCard({
  docRefParams,
  handlePickQuestion,
  selQuestion,
  submissionHistory,
}) {
  const cardColor = { bgColor: "rgba(255, 255, 255, 0.9)" };
  const type = selQuestion?.type;
  const submissions = getSubmissions(submissionHistory, selQuestion);
  const lastSubmission = submissions?.at(-1) || null;

  if (!selQuestion) return null;

  return (
    <Card className="adaptive-card" sx={cardColor}>
      <div className="skip-container">
        {lastSubmission?.answeredCorrectly ? (
          <Box
            className="flex flex-center"
            sx={{ width: "40px", height: "40px" }}
          >
            <Button disabled>SKIP</Button>
          </Box>
        ) : (
          <Tooltip title="pick another question">
            <Button onClick={handlePickQuestion}>SKIP</Button>
          </Tooltip>
        )}
      </div>

      {type === "multiple choice" && (
        <MultipleChoice
          adaptive
          docRefParams={docRefParams}
          goForward={handlePickQuestion}
          mode="course"
          nextDisabled={false}
          question={selQuestion}
          submissions={submissions}
          totalPointsAwarded={0}
        />
      )}
      {type === "short answer" && (
        <ShortAnswer
          adaptive
          docRefParams={docRefParams}
          goForward={handlePickQuestion}
          mode="course"
          nextDisabled={false}
          question={selQuestion}
          submissions={submissions}
          totalPointsAwarded={0}
        />
      )}
    </Card>
  );
}

function QuestionCard({
  docRefParams,
  goForward,
  qSet,
  question,
  nextDisabled,
  submissionHistory,
}) {
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
    const cardColor = { bgColor: "rgba(255, 255, 255, 0.9)" };
    const totalPointsAwarded = getTotalPointsAwarded(submissionHistory, qSet);

    return (
      <Card className="question-card" sx={cardColor}>
        {type === "multiple choice" && (
          <MultipleChoice
            docRefParams={docRefParams}
            goForward={goForward}
            mode="course"
            nextDisabled={nextDisabled}
            question={question}
            submissions={submissions}
            totalPointsAwarded={totalPointsAwarded}
          />
        )}
        {type === "short answer" && (
          <ShortAnswer
            docRefParams={docRefParams}
            goForward={goForward}
            mode="course"
            nextDisabled={nextDisabled}
            question={question}
            submissions={submissions}
            totalPointsAwarded={totalPointsAwarded}
          />
        )}
        {type === "free response" && (
          <FreeResponse
            docRefParams={docRefParams}
            goForward={goForward}
            mode="course"
            nextDisabled={nextDisabled}
            question={question}
            submissions={submissions}
            totalPointsAwarded={totalPointsAwarded}
          />
        )}
      </Card>
    );
  }
}
