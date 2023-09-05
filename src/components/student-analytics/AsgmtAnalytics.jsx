import { useEffect, useState } from "react";
import { getQSet, getQSetSubmissionHistory } from "../../utils/firestoreClient";
import { Lightbox } from "../common/Lightbox";
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { formatTimeAndDate } from "../../utils/dateUtils";
import { calculateProgress } from "../../utils/questionSetUtils";
import DoneIcon from "@mui/icons-material/Done";

export function AsgmtAnalytics({ asgmt, course, open, handleClose }) {
  const [submissionHistory, setSubmissionHistory] = useState(null);
  const [qSet, setQSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const asgmtID = asgmt?.id;
  const courseID = course?.id;
  const userID = asgmt?.userID;
  const userDisplayName = asgmt?.userDisplayName;

  useEffect(() => {
    if (!open) {
      return;
    }
    getQSetSubmissionHistory(courseID, asgmtID, userID, setSubmissionHistory);
  }, [open]);

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
    [open]
  );

  if (!asgmt || loading) {
    return null;
  }

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      customStyle={{ maxWidth: "700px" }}
    >
      {qSet?.mode === "adaptive" && (
        <Typography color="text.secondary" display="inline" sx={{ mr: "2px" }}>
          Adaptive Question Set -
        </Typography>
      )}
      {!asgmt.hasDateOpen && !asgmt.hasDateDue && (
        <Typography color="text.secondary" display="inline">
          always available
        </Typography>
      )}
      {asgmt.hasDateOpen && `Open: ${formatTimeAndDate(asgmt.dateOpen)}`}
      {asgmt.hasDateOpen && <br />}
      {asgmt.hasDateDue && `Due: ${formatTimeAndDate(asgmt.dateDue)}`}

      <Typography color="primary" variant="h6">
        {asgmt.title}
      </Typography>

      <Typography color="primary">analytics for {userDisplayName}</Typography>

      <Divider />
      <br />
      <br />

      {qSet?.mode === "adaptive" && (
        <ProgressMeters qSet={qSet} submissionHistory={submissionHistory} />
      )}

      {/* <pre>{JSON.stringify(qSet.adaptiveParams, null, 2)}</pre> */}

      {/* <pre>{JSON.stringify(asgmt, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(submissionHistory, null, 2)}</pre> */}
    </Lightbox>
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
              params={params}
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
  // const questionIDs = objective.questionIDs;

  const progress = calculateProgress(rule, objective, submissionHistory);

  const threshold = objective.completionThreshold;
  const progressLabel = progress.count + "/" + threshold;

  const touched = Object.keys(submissionHistory).filter(
    (key) => key !== "id" && key !== "totalPointsAwarded"
  );

  const submissions = touched.map((id) => submissionHistory[id]);
  const submissionAttempts = submissions.map((submission) => submission.length);
  const totalAttempts = submissionAttempts.reduce((acc, cur) => acc + cur, 0);
  const averageAttempts = (totalAttempts / touched.length).toFixed(2);
  const correctSubmissions = submissions.filter(
    (submission) => submission.at(-1).answeredCorrectly
  );
  // const flattened = submissions.flat();

  return (
    <>
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
        <td colSpan={2}>
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
      <tr>
        <td></td>
        <td style={{ width: "250px", paddingLeft: "30px" }}>
          <Typography variant="subtitle2">questions attempted:</Typography>
        </td>
        <td>
          <Typography variant="subtitle2">{touched.length}</Typography>
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
    </>
  );
}
