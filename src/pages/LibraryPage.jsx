import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLibrary, fetchLibraryQuestions } from "../utils/firestoreClient";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { LoadingIndicator, Page } from "../components/common/Pages";
import { QuestionBuilder } from "../components/forms/QnBuilder";
import MultipleChoice from "../components/question-sets/QnMultipleChoice";
import ShortAnswer from "../components/question-sets/QnShortAnswer";
import FreeResponse from "../components/question-sets/QnFreeResponse";
import { TagsForm } from "../components/forms/TagsForm";

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

  useEffect(() => {
    fetchLibrary(libraryID, setLibrary, setLoading);
  }, []);

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
      <QuestionSetsPanel libraryID={libraryID} />
    </div>
  );
}

function QuestionSetsPanel({ libraryID }) {
  const [openBuilder, setOpenBuilder] = useState(false);
  const [openTag, setOpenTag] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selQuestion, setSelQuestion] = useState(null);
  const tags = selQuestion?.tags || null;

  const type = selQuestion?.type;
  const listStyle = {
    padding: 0,
    width: "200px",
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

  function deleteTag() {
    console.log("hello");
  }

  useEffect(() => {
    fetchLibraryQuestions(libraryID, setQuestions);
  }, []);

  return (
    <>
      <div className="flex flex-row" style={{ padding: "50px" }}>
        <Box>
          <List sx={listStyle}>
            {questions.map((question) => (
              <ListItemButton
                key={question.id}
                onClick={() => setSelQuestion(question)}
              >
                <ListItemText>{formatPrompt(question.prompt)}</ListItemText>
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: "2px" }} />
          <Button fullWidth onClick={handleOpenBuilder} startIcon={<AddIcon />}>
            ADD QUESTION
          </Button>
        </Box>
        <Box>
          <Card className="question-card">
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
          {selQuestion && (
            <Card className="tags-card">
              Tags
              {tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  sx={{ mr: 1, mb: 1 }}
                  onDelete={() => deleteTag()}
                />
              ))}
              <Chip
                icon={<AddIcon />}
                onClick={handleOpenTag}
                label="add topic"
                sx={{ mr: 1, mb: 1 }}
                variant="outlined"
              />
            </Card>
          )}
        </Box>
      </div>
      <QuestionBuilder
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
      />
    </>
  );
}

function formatPrompt(str) {
  const newStr = str
    .replaceAll(/<\/{0,1}div>/g, "")
    .replaceAll(/<br\/{0,1}>/g, "");
  return newStr;
}
