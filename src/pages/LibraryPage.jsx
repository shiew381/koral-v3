import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  countLibraryQuestions,
  deleteLibraryQuestion,
  fetchLibrary,
  fetchLibraryQuestions,
  updateTags,
} from "../utils/firestoreClient";
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { LoadingIndicator, Page } from "../components/common/Pages";
import { QnBuilder } from "../components/forms/QnBuilder";
import MultipleChoice from "../components/question-sets/QnMultipleChoice";
import ShortAnswer from "../components/question-sets/QnShortAnswer";
import FreeResponse from "../components/question-sets/QnFreeResponse";
import { TagsForm } from "../components/forms/TagsForm";
import { Panel } from "../components/common/DashboardCpnts";
import { SearchField } from "../components/common/InputFields";

export default function LibraryPage() {
  const navigate = useNavigate();

  const params = useParams();
  const libraryID = params.libraryID;
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [library, setLibrary] = useState(null);

  function redirectToLibraries() {
    navigate("/community/libraries");
  }

  function selectTab(e, newIndex) {
    setTabIndex(newIndex);
  }

  useEffect(
    () => {
      fetchLibrary(libraryID, setLibrary, setLoading);
    },
    //eslint-disable-next-line
    []
  );

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  if (!library) {
    return null;
  }

  return (
    <div className="dashboard-container relative">
      <div style={{ position: "absolute" }}>
        <Button startIcon={<ChevronLeftIcon />} onClick={redirectToLibraries}>
          All Libraries
        </Button>
      </div>
      <div className="tabs-vert-container">
        <Box className="flex flex-center">
          <img src={library.image?.url} width="100px" />
        </Box>

        <Tabs
          className="tabs-vert"
          onChange={selectTab}
          orientation="vertical"
          sx={{
            borderRight: 1,
            borderColor: "divider",
            minHeight: "50vh",
          }}
          value={tabIndex}
        >
          <Tab label="QUESTIONS" />
        </Tabs>
      </div>
      <div className="tabs-horiz-container">
        <Tabs value={tabIndex} onChange={selectTab} variant="scrollable">
          <Tab label="QUESTIONS" />
        </Tabs>
      </div>
      <QuestionSetsPanel library={library} libraryID={libraryID} />
    </div>
  );
}

function QuestionSetsPanel({ libraryID, library }) {
  const [openBuilder, setOpenBuilder] = useState(false);
  const [openTag, setOpenTag] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selQuestion, setSelQuestion] = useState(null);
  const tags = selQuestion?.tags || null;

  const type = selQuestion?.type;
  const listStyle = {
    marginTop: "5px",
    padding: 0,
    width: "300px",
    height: "500px",
    overflow: "auto",
  };

  function handleOpenBuilder() {
    setOpenBuilder(true);
  }

  function handleCloseBuilder() {
    setOpenBuilder(false);
  }

  function handleOpenTag() {
    setOpenTag(true);
  }

  function handleCloseTag() {
    setOpenTag(false);
  }

  function deleteTag(ind) {
    const updatedTags = tags.filter((el, index) => ind !== index);
    const questionID = selQuestion.id;
    updateTags(updatedTags, libraryID, questionID);
  }

  function deleteQuestion() {
    deleteLibraryQuestion(selQuestion, libraryID);
  }

  function refreshQuestion() {
    const found = questions.find((question) => question.id === selQuestion.id);
    setSelQuestion(found);
  }

  useEffect(
    () => {
      fetchLibraryQuestions(libraryID, setQuestions);
    },
    //eslint-disable-next-line
    []
  );

  useEffect(
    () => {
      if (selQuestion?.id) {
        refreshQuestion();
      }
    },
    //eslint-disable-next-line
    [questions]
  );

  return (
    <>
      <Panel>
        <Box className="flex flex-row" sx={{ pt: "80px" }}>
          <Box>
            <SearchField />
            <List sx={listStyle}>
              {questions.map((question) => (
                <ListItemButton
                  key={question.id}
                  onClick={() => setSelQuestion(question)}
                  sx={{
                    bgcolor:
                      question?.id === selQuestion?.id
                        ? "rgba(0,180,235,0.1)"
                        : "transparent",
                  }}
                >
                  <ListItemText>{formatPrompt(question.prompt)}</ListItemText>
                </ListItemButton>
              ))}
            </List>

            <div
              style={{
                textAlign: "center",
                paddingTop: "5px",
                paddingBottom: "5px",
                backgroundColor: "rgba(0,0,0,0.05)",
              }}
            >
              1 - {questions.length} of {library.questionCount} questions
            </div>
            <Divider />
            <Button
              fullWidth
              onClick={handleOpenBuilder}
              startIcon={<AddIcon />}
            >
              ADD QUESTION
            </Button>
            <Button fullWidth onClick={() => countLibraryQuestions(libraryID)}>
              Count Questions
            </Button>
          </Box>
          <Box>
            {!selQuestion && (
              <Box className="select-question-cta">
                <Typography color="primary">
                  Please select a question from the list
                </Typography>
              </Box>
            )}
            {selQuestion && (
              <Card className="question-card">
                <Typography color="text.secondary" sx={{ pl: "10px" }}>
                  Question ID: {selQuestion.id}
                </Typography>
                {type === "multiple choice" && (
                  <MultipleChoice mode="preview" question={selQuestion} />
                )}
                {type === "short answer" && (
                  <ShortAnswer mode="preview" question={selQuestion} />
                )}
                {type === "free response" && (
                  <FreeResponse mode="preview" question={selQuestion} />
                )}
              </Card>
            )}
            {selQuestion && (
              <Card className="tags-card">
                <span style={{ marginLeft: "10px", marginRight: "10px" }}>
                  Tags:
                </span>
                {tags?.map((tag, ind) => (
                  <Chip
                    key={tag}
                    label={tag}
                    sx={{ mr: 1, mb: 1 }}
                    onDelete={() => deleteTag(ind)}
                  />
                ))}
                <Chip
                  icon={<AddIcon />}
                  onClick={handleOpenTag}
                  label="add tag"
                  sx={{ mr: 1, mb: 1 }}
                  variant="outlined"
                />
              </Card>
            )}
            {selQuestion && (
              <Box
                className="flex flex-center"
                width="600px"
                sx={{ p: "20px" }}
              >
                <Button onClick={deleteQuestion}>DELETE QUESTION</Button>
              </Box>
            )}
          </Box>
        </Box>
      </Panel>
      <QnBuilder
        collection="library"
        libraryID={libraryID}
        open={openBuilder}
        handleClose={handleCloseBuilder}
        edit={false}
      />
      <TagsForm
        handleClose={handleCloseTag}
        libraryID={libraryID}
        questionID={selQuestion?.id}
        open={openTag}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
      />
    </>
  );
}

function formatPrompt(str) {
  const newStr = str
    .replaceAll(/<\/{0,1}div>/g, "")
    .replaceAll(/<\/{0,1}strong>/g, "")
    .replaceAll(/<\/{0,1}sub>/g, "")
    .replaceAll(/<\/{0,1}sup>/g, "")
    .replaceAll(/<br\/{0,1}>/g, "");
  return newStr;
}
