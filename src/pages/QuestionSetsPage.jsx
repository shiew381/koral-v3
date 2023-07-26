import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { filterByTerm } from "../utils/filterUtils";
import { formatDate } from "../utils/dateUtils";
import {
  fetchUserQSets,
  deleteUserContent,
  updateUserQSet,
} from "../utils/firestoreClient.js";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  ListItemButton,
  Switch,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  LoadingIndicator,
  Page,
  PageHeader,
} from "../components/common/Pages.jsx";
import { SearchField } from "../components/common/InputFields";
import { BuildFirstItem } from "../components/common/CallsToAction.jsx";
import { AddQSetForm } from "../components/forms/AddQSetForm";
import { BtnContainer, MoreOptionsBtn } from "../components/common/Buttons";
import { MenuOption, MoreOptionsMenu } from "../components/common/Menus";
import AdaptiveParamsForm from "../components/forms/AdaptiveParamsForm";

export default function QuestionSetsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [qSets, setQSets] = useState([]);
  const [open, setOpen] = useState(false);
  const [adaptiveFormOpen, setAdaptiveFormOpen] = useState(false);
  const [selQSet, setSelQSet] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = filterByTerm(qSets, searchTerm);

  function deleteQSet(doc) {
    deleteUserContent(user, "question-sets", doc.id);
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function openAdaptiveForm() {
    setAdaptiveFormOpen(true);
  }

  function closeAdaptiveForm() {
    setAdaptiveFormOpen(false);
  }

  function handleSearchTerm(e) {
    setSearchTerm(e.target.value.toLowerCase());
  }

  // function toggleOrder() {
  //   const updated = [...qSets].reverse();
  //   setQSets(updated);
  // }

  useEffect(
    () => {
      if (!user) return;
      fetchUserQSets(user, setQSets, setLoading);
    },
    //eslint-disable-next-line
    [user]
  );

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Question Sets" />
      {qSets.length === 0 && (
        <div className="flex flex-center" style={{ height: "50vh" }}>
          <BuildFirstItem
            handleOpen={handleOpen}
            item="question set"
            message="Welcome to your question sets! Build quizzes, exams, and other assessments here."
          />
        </div>
      )}
      {qSets.length > 0 && (
        <Box sx={{ px: 3 }}>
          <Box
            className="flex flex-align-center flex-space-between flex-wrap"
            sx={{ pb: 2 }}
            width="450px"
          >
            <SearchField onChange={handleSearchTerm} value={searchTerm} />
            <AddQSetBtn onClick={handleOpen} />
          </Box>
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              No question sets with name containing &quot;{searchTerm}&quot;
            </Box>
          )}
          <Box className="flex flex-row flex-wrap">
            {filtered.length > 0 &&
              filtered.map((qSet) => (
                <QSetCard
                  deleteQSet={deleteQSet}
                  key={qSet.id}
                  openAdaptiveForm={openAdaptiveForm}
                  setSelQSet={setSelQSet}
                  qSet={qSet}
                  user={user}
                />
              ))}
          </Box>
        </Box>
      )}

      <AddQSetForm open={open} handleClose={handleClose} user={user} />
      <AdaptiveParamsForm
        qSet={selQSet}
        open={adaptiveFormOpen}
        handleClose={closeAdaptiveForm}
        user={user}
      />
    </Page>
  );
}

function AddQSetBtn({ onClick }) {
  return (
    <Button onClick={onClick} startIcon={<AddIcon />}>
      Add QUESTION SET
    </Button>
  );
}

function QSetCard({ deleteQSet, openAdaptiveForm, qSet, setSelQSet, user }) {
  const navigate = useNavigate();
  const [adaptiveModeOn, setAdaptiveModeOn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selItem, setSelItem] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const numQuestions = qSet.questions?.length || 0;

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function redirectToQSet() {
    const qSetTitle = encodeURI(qSet.title.replace(/\s/g, "-"));
    navigate(`/content/question-sets/${qSetTitle}/${qSet.id}`);
  }

  function toggleMode() {
    setAdaptiveModeOn(!adaptiveModeOn);
  }

  function toggleAdaptive(e) {
    console.log(e);
    setAdaptiveModeOn(!adaptiveModeOn);
    const updatedValues = {
      mode: e.target.checked ? "adaptive" : "normal",
    };

    updateUserQSet(user, qSet, updatedValues, null, toggleMode);
  }

  useEffect(
    () => {
      setAdaptiveModeOn(qSet.mode === "adaptive");
    },

    //eslint-disable-next-line
    [qSet]
  );

  if (!qSet) return null;

  return (
    <Card sx={{ minWidth: "450px", mb: 2, mr: 2 }} className="relative">
      <CardContent>
        <Box style={{ position: "absolute", top: "10px", right: "8px" }}>
          <MoreOptionsBtn
            item={qSet}
            setAnchorEl={setAnchorEl}
            setSelItem={setSelItem}
          />
        </Box>

        <MoreOptionsMenu
          anchorEl={anchorEl}
          handleClose={handleCloseMenu}
          open={menuOpen}
        >
          <MenuOption>
            <ListItemButton
              onClick={() => {
                deleteQSet(selItem);
                handleCloseMenu();
              }}
            >
              Delete
            </ListItemButton>
          </MenuOption>
        </MoreOptionsMenu>
        <Typography variant="h6">{qSet.title}</Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ p: 1 }}>
          <Box className="flex flex-align-center">
            <Typography
              display="inline"
              color={adaptiveModeOn ? "inherit" : "text.secondary"}
            >
              Adaptive Mode
            </Typography>
            <Switch
              checked={adaptiveModeOn}
              value={adaptiveModeOn}
              onChange={toggleAdaptive}
            />
            <Button
              sx={{ ml: 4 }}
              disabled={!adaptiveModeOn}
              onClick={() => {
                setSelQSet(qSet);
                openAdaptiveForm();
              }}
            >
              SET PARAMETERS
            </Button>
          </Box>
          <Typography display="inline" variant="subtitle1">
            added {formatDate(qSet.dateCreated)}
          </Typography>

          <Typography display="inline" sx={{ mx: 3 }}>
            |
          </Typography>
          <Typography display="inline">{numQuestions} questions</Typography>
          <NumDeployments qSet={qSet} />
        </Box>
      </CardContent>
      <Box sx={{ p: 2 }}>
        <BtnContainer right>
          <Button onClick={redirectToQSet} variant="contained">
            PREVIEW / TEST
          </Button>
        </BtnContainer>
      </Box>
    </Card>
  );
}

function NumDeployments({ qSet }) {
  const deployments = qSet.deployments;
  const num = deployments.length;

  if (num === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        not deployed to a course yet
      </Typography>
    );
  }

  if (num === 1) {
    return (
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        deployed to {deployments[0].title}
      </Typography>
    );
  }

  if (num === 2) {
    return (
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        deployed to {deployments[0].title} and {deployments[1].title}
      </Typography>
    );
  }

  if (num > 2) {
    <Typography color="text.secondary" sx={{ mt: 1 }}>
      Deployed to {num} courses
    </Typography>;
  }
}
