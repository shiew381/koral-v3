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
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
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
import { EditQSetTitleForm } from "../components/forms/EditQSetTitleForm";

export default function QuestionSetsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [qSets, setQSets] = useState([]);
  const [open, setOpen] = useState(false);
  const [openTitle, setOpenTitle] = useState(false);
  const [adaptiveFormOpen, setAdaptiveFormOpen] = useState(false);
  const [selQSet, setSelQSet] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = filterByTerm(qSets, searchTerm);

  function deleteQSet(doc) {
    deleteUserContent(user, "question-sets", doc.id);
  }

  function handleOpenTitle() {
    setOpenTitle(true);
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleCloseTitle() {
    setOpenTitle(false);
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

  if (qSets.length === 0) {
    return (
      <Page>
        <PageHeader title="Question Sets" />
        <BuildFirstItem
          handleOpen={handleOpen}
          item="question set"
          message="Welcome to your question sets! Build quizzes, exams, and other assessments here."
        />
        <AddQSetForm open={open} handleClose={handleClose} user={user} />
      </Page>
    );
  }

  if (qSets.length > 0) {
    return (
      <Page>
        <PageHeader title="Question Sets" />
        {qSets.length > 0 && (
          <Box className="flex flex-col flex-align-center pad-x-responsive">
            <Box sx={{ width: "100%" }}>
              <Box className="flex flex-align-center" sx={{ mb: "20px" }}>
                <SearchField
                  onChange={handleSearchTerm}
                  placeholder="search by title"
                  value={searchTerm}
                />
                <AddQSetBtn onClick={handleOpen} />
              </Box>
              {filtered.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  No question sets with name containing &quot;{searchTerm}&quot;
                </Box>
              ) : (
                filtered.map((qSet) => (
                  <QSetCard
                    deleteQSet={deleteQSet}
                    key={qSet.id}
                    handleOpenTitle={handleOpenTitle}
                    openAdaptiveForm={openAdaptiveForm}
                    setSelQSet={setSelQSet}
                    qSet={qSet}
                    user={user}
                  />
                ))
              )}
            </Box>
          </Box>
        )}
        <AddQSetForm open={open} handleClose={handleClose} user={user} />
        <EditQSetTitleForm
          open={openTitle}
          handleClose={handleCloseTitle}
          qSet={selQSet}
          user={user}
        />
        <AdaptiveParamsForm
          qSet={selQSet}
          open={adaptiveFormOpen}
          handleClose={closeAdaptiveForm}
          user={user}
        />
      </Page>
    );
  }
}

function AddQSetBtn({ onClick }) {
  return (
    <Box className="margin-x-responsive">
      <Button color="secondary" onClick={onClick} startIcon={<AddIcon />}>
        Add QUESTION SET
      </Button>
    </Box>
  );
}

function QSetCard({
  deleteQSet,
  handleOpenTitle,
  openAdaptiveForm,
  qSet,
  setSelQSet,
  user,
}) {
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

  if (!user) {
    return null;
  }

  if (!qSet) return null;

  return (
    <Card sx={{ minWidth: "380px", mb: 2 }} className="relative">
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
                setSelQSet(qSet);
                handleOpenTitle();
                handleCloseMenu();
              }}
            >
              Edit title
            </ListItemButton>
          </MenuOption>
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
              color="secondary"
              disabled={!adaptiveModeOn}
              onClick={() => {
                setSelQSet(qSet);
                openAdaptiveForm();
              }}
              sx={{ ml: 4 }}
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
      <Box sx={{ px: 2, pb: 2 }}>
        <BtnContainer right>
          <Button
            color="secondary"
            onClick={redirectToQSet}
            endIcon={<NavigateNextIcon />}
          >
            View
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
      <Typography sx={{ mt: 1 }}>deployed to {deployments[0].title}</Typography>
    );
  }

  if (num === 2) {
    return (
      <Typography sx={{ mt: 1 }}>
        deployed to {deployments[0].title} and {deployments[1].title}
      </Typography>
    );
  }

  if (num > 2) {
    <Typography sx={{ mt: 1 }}>Deployed to {num} courses</Typography>;
  }
}
