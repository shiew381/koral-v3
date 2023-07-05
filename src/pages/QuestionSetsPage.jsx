import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { filterByTerm } from "../utils/filterUtils";
import { formatDate } from "../utils/dateUtils";
import {
  fetchUserQSets,
  deleteFirestoreRef,
} from "../utils/firestoreClient.js";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  LoadingIndicator,
  Page,
  PageHeader,
} from "../components/common/Pages.jsx";
import { SearchField } from "../components/common/InputFields";

import { BuildFirstItem } from "../components/common/CallsToAction.jsx";
import { AddQSetForm } from "../components/forms/AddQSetForm";
import { MoreOptionsBtn } from "../components/common/Buttons";
import { MenuOption, MoreOptionsMenu } from "../components/common/Menus";
import AdaptiveParamsForm from "../components/forms/AdaptiveParamsForm";

export default function QuestionSetsPage() {
  const { user } = useAuth();

  const [fetching, setFetching] = useState(true);
  const [qSets, setQSets] = useState([]);
  const [open, setOpen] = useState(false);
  const [adaptiveFormOpen, setAdaptiveFormOpen] = useState(false);
  const [selQSet, setSelQSet] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filtered = filterByTerm(qSets, searchTerm);

  function deleteQSet(doc) {
    deleteFirestoreRef(user, "questionSets", doc.id);
  }

  function handleSearchTerm(e) {
    setSearchTerm(e.target.value.toLowerCase());
  }

  function toggleOrder() {
    const updated = [...qSets].reverse();
    setQSets(updated);
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserQSets(user, setQSets, setFetching);
    },
    //eslint-disable-next-line
    [user]
  );

  if (!user) {
    return null;
  }

  if (fetching) {
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
        <div className="flex flex-center" style={{ height: "50vh" }}>
          <BuildFirstItem
            handleOpen={handleOpen}
            item="question set"
            message="Welcome to your question sets! Build quizzes, exams, and other assessments here."
          />
        </div>
        <AddQSetForm open={open} handleClose={handleClose} user={user} />
      </Page>
    );
  }

  if (qSets.length > 0) {
    return (
      <Page>
        <PageHeader title="Question Sets" />
        <Box className="flex flex-row" sx={{ px: 2 }}>
          <Box className="flex-col" sx={{ width: "300px", mx: "15px" }}>
            <Box
              className="flex flex-align-center flex-space-between "
              sx={{ py: 1 }}
            >
              <SearchField onChange={handleSearchTerm} value={searchTerm} />
              <IconButton onClick={toggleOrder}>
                <SwapVertIcon style={{ color: "gray" }} />
              </IconButton>
            </Box>
            <Divider />
            <QSetList
              deleteQSet={deleteQSet}
              qSets={filtered}
              searchTerm={searchTerm}
              selQSet={selQSet}
              setSelQSet={setSelQSet}
            />
            <Divider />
            <AddQSetBtn onClick={handleOpen} />
            <AddQSetForm open={open} handleClose={handleClose} user={user} />
          </Box>
          <Box className="flex-col flex-align-center flex-grow relative">
            <QSetDetails openAdaptiveForm={openAdaptiveForm} qSet={selQSet} />
            <AdaptiveParamsForm
              qSet={selQSet}
              open={adaptiveFormOpen}
              handleClose={closeAdaptiveForm}
              user={user}
            />
          </Box>
        </Box>
      </Page>
    );
  }
}

function QSetList({ deleteQSet, qSets, searchTerm, selQSet, setSelQSet }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selItem, setSelItem] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  if (qSets?.length === 0) {
    <List disablePadding sx={{ height: "65vh", overflow: "auto" }}>
      <ListItem component="div" disablePadding sx={{ bgcolor: "none", p: 2 }}>
        <ListItemText>
          No documents with name containing &quot;{searchTerm}&quot;
        </ListItemText>
      </ListItem>
    </List>;
  }

  return (
    <List disablePadding sx={{ height: "65vh", overflow: "auto" }}>
      {qSets.map((qSet) => (
        <ListItem
          component="div"
          disablePadding
          key={qSet.id}
          sx={{
            bgcolor: selQSet?.id === qSet.id ? "whitesmoke" : "none",
          }}
        >
          <ListItemButton onClick={() => setSelQSet(qSet)}>
            {qSet?.title}
          </ListItemButton>
          <MoreOptionsBtn
            item={qSet}
            setAnchorEl={setAnchorEl}
            setSelItem={setSelItem}
          />
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
        </ListItem>
      ))}
    </List>
  );
}

function AddQSetBtn({ onClick }) {
  return (
    <Button fullWidth onClick={onClick} startIcon={<AddIcon />}>
      Add QUESTION SET
    </Button>
  );
}

function QSetDetails({ openAdaptiveForm, qSet }) {
  const navigate = useNavigate();
  const [adaptiveModeOn, setAdaptiveModeOn] = useState(false);

  const numQuestions = qSet.questions?.length || 0;

  function redirectToQSetEditor() {
    const qSetTitle = qSet.title.replace(/\s/g, "-");
    navigate(`/content/question-sets/${qSetTitle}/${qSet.id}`);
  }

  function toggleAdaptive(e) {
    console.log(e);
    setAdaptiveModeOn(!adaptiveModeOn);
    // const fieldValue = event.target.checked ? "adaptive" : "normal";
    // const toggleMode = () => setAdaptiveModeOn(!adaptiveModeOn);
    // const updatedValues = {
    //   mode: event.target.checked ? "adaptive" : "normal",
    // };
    // updateUserQSet(user, qSet, updatedValues, toggleMode);
  }

  if (!qSet) return null;

  return (
    <Card sx={{ maxWidth: "500px" }}>
      <CardContent>
        <Typography variant="h6">{qSet.title}</Typography>
        <Typography display="inline" variant="subtitle1">
          added {formatDate(qSet.created)}
        </Typography>
        <Typography display="inline" sx={{ mx: 3 }}>
          |
        </Typography>
        <Typography display="inline">{numQuestions} questions</Typography>
        <br />
        <Box className="flex flex-align-center flex-space-between">
          <Box sx={{ minWidth: "200px" }}>
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
          </Box>
          <Button disabled={!adaptiveModeOn} onClick={openAdaptiveForm}>
            Edit Adaptive Parameters
          </Button>
        </Box>
        <Typography>Not deployed in any courses yet</Typography>
        <Box className="flex flex-justify-end"></Box>
      </CardContent>

      <CardActions>
        <Button onClick={redirectToQSetEditor} variant="contained">
          EDIT
        </Button>
      </CardActions>
    </Card>
  );

  // return (
  //   <Box width="95%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1 }}>
  //     <Typography variant="h6">{qSet.title}</Typography>
  //     <Box>
  //       <Button>Preview</Button>
  //       <VertDivider />
  //       <Button onClick={redirectToBuild}>Build Questions</Button>
  //     </Box>

  //     <Typography>{numQuestions} questions</Typography>
  //   </Box>
  // );
}
