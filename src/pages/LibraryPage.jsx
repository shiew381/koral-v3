import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  // countLibraryQuestions,
  deleteLibraryQuestion,
  fetchLibrary,
  fetchLibraryQnsAfter,
  fetchLibraryQnsBefore,
  fetchLibraryQuestions,
  updateTags,
} from "../utils/firestoreClient";
import parse from "html-react-parser";
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import RedoIcon from "@mui/icons-material/Redo";
import CopyrightIcon from "@mui/icons-material/Copyright";
import { LoadingIndicator, Page } from "../components/common/Pages";
import MultipleChoice from "../components/question-sets/QnMultipleChoice";
import ShortAnswer from "../components/question-sets/QnShortAnswer";
import FreeResponse from "../components/question-sets/QnFreeResponse";
import { QnBuilder } from "../components/forms/QnBuilder";
import { QnImporter } from "../components/forms/QnImporter";
import { TagsForm } from "../components/forms/TagsForm";
import { Panel } from "../components/common/DashboardCpnts";
import { SearchField } from "../components/common/InputFields";
import { BtnContainer } from "../components/common/Buttons";
import "../css/Library.css";
import { SearchSuggestionForm } from "../components/forms/SearchSuggestionForm";
import { formatAuthorNames } from "../utils/commonUtils";

export default function LibraryPage() {
  const navigate = useNavigate();

  const params = useParams();
  const libID = params.libID;
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
      fetchLibrary(libID, setLibrary, setLoading);
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
    <div className="library-container relative">
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
          <Tab label="LICENSE" />
        </Tabs>
      </div>
      <div className="tabs-horiz-container">
        <Tabs value={tabIndex} onChange={selectTab} variant="scrollable">
          <Tab label="QUESTIONS" />
          <Tab label="LICENSE" />
        </Tabs>
      </div>
      {tabIndex === 0 && <QuestionSetsPanel library={library} libID={libID} />}
      {tabIndex === 1 && <LicensePanel library={library} />}
    </div>
  );
}

function QuestionSetsPanel({ libID, library }) {
  const [openBuilder, setOpenBuilder] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openSearchSuggestion, setOpenSearchSuggestion] = useState(false);
  const [openTag, setOpenTag] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [questions, setQuestions] = useState([]);
  const [checkedQns, setCheckedQns] = useState([]);
  const checkedQnIDs = checkedQns.map((el) => el.id);
  const [selQuestion, setSelQuestion] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [totalCount, setTotalCount] = useState(library.questionCount);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(false);
  const [viewChecked, setViewChecked] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useAuth();

  const suggestions = library.searchSuggestions || [];
  const suggestionsFiltered = suggestions?.filter((el) =>
    el.includes(searchTerm)
  );

  const isEditor = library.editorIDs?.includes(user.uid);

  const countPerPage = 10;

  const lastPage = Math.ceil(totalCount / countPerPage);

  const tags = selQuestion?.tags || null;

  const type = selQuestion?.type;

  const listStyle = {
    padding: 0,
    paddingBottom: 4,
    width: "300px",
    height: "500px",
    overflow: "auto",
  };

  const suggestionStyle = {
    bgcolor: "rgba(239, 248, 251,0.9)",
    "&:hover": {
      backgroundColor: "rgba(201, 231, 240, 0.9)",
    },
  };

  function deleteQuestion() {
    deleteLibraryQuestion(selQuestion, libID, setTotalCount);
  }

  function deleteTag(ind) {
    const updatedTags = tags.filter((el, index) => ind !== index);
    const questionID = selQuestion.id;
    updateTags(updatedTags, libID, questionID);
  }

  function handleCloseBuilder() {
    setOpenBuilder(false);
    setEdit(false);
  }

  function handleCloseSearchSuggestion() {
    setOpenSearchSuggestion(false);
  }

  function handleCloseTag() {
    setOpenTag(false);
  }

  function handleBack() {
    fetchLibraryQnsBefore(
      libID,
      searchTerm,
      countPerPage,
      firstDoc,
      isEditor,
      setQuestions,
      setFirstDoc,
      setLastDoc,
      setPage,
      setFetching
    );
  }

  function handleChange(e) {
    setSearchTerm(e.target.value);
  }

  function handleKeyUp(e) {
    if (e.code === "Enter") {
      handleSearch();
    }

    if (e.code === "Backspace" && e.target.value === "") {
      handleSearch();
      resetTotalCount();
    }
  }

  function handleNext() {
    fetchLibraryQnsAfter(
      libID,
      searchTerm,
      countPerPage,
      lastDoc,
      isEditor,
      setQuestions,
      setFirstDoc,
      setLastDoc,
      setPage,
      setFetching
    );
  }

  function handleOpenBuilder() {
    setOpenBuilder(true);
  }

  function handleOpenImport() {
    setOpenImport(true);
  }

  function handleCloseImport() {
    setOpenImport(false);
  }

  function handleOpenEdit() {
    setOpenBuilder(true);
    setEdit(true);
  }

  function handleOpenSearchSuggestion() {
    setOpenSearchSuggestion(true);
    setSearchFocused(false);
  }

  function handleOpenTag() {
    setOpenTag(true);
  }

  function handleSearch(term) {
    const activeTerm = term || searchTerm;

    fetchLibraryQuestions(
      libID,
      activeTerm,
      countPerPage,
      isEditor,
      setQuestions,
      setLastDoc,
      setTotalCount,
      setPage,
      setFetching
    );
  }

  function handleSearchFocus() {
    setSearchFocused(true);
  }

  function handleSearchBlur(e) {
    const classList = e.relatedTarget?.classList;
    if (classList?.contains("search-suggestion")) {
      return;
    }
    setSearchFocused(false);
  }

  function handleCheck(e) {
    const qID = e.target.value;
    const foundQuestion = questions.find((question) => question.id === qID);

    if (e.target.checked) {
      setCheckedQns([...checkedQns, foundQuestion]);
    } else {
      const index = checkedQnIDs.indexOf(qID);
      const copy = [...checkedQns];
      copy.splice(index, 1);
      setCheckedQns(copy);
    }
  }

  function incrementQnCount() {
    setTotalCount((prev) => prev + 1);
  }

  function refreshQuestion() {
    const found = questions.find((question) => question.id === selQuestion.id);
    setSelQuestion(found);
  }

  function resetTotalCount() {
    setTotalCount(library.questionCount);
  }

  function showChecked() {
    setQuestions(checkedQns);
    setTotalCount(checkedQns.length);
    setViewChecked(true);
  }

  function showAll() {
    handleSearch();
    resetTotalCount();
    setViewChecked(false);
  }

  useEffect(handleSearch, []);

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
        <Box className="flex flex-row" sx={{ pt: "40px" }}>
          <Box className="relative">
            <Box className="flex flex-center">
              <SearchField
                fullWidth
                library
                fetching={fetching}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onClick={() => handleSearch(searchTerm)}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                placeholder="search by topic"
                value={searchTerm}
              />
            </Box>
            <br />
            <Box className="relative">
              <List sx={listStyle}>
                {questions.map((question) => (
                  <ListItem
                    disablePadding
                    key={question.id}
                    secondaryAction={
                      <Checkbox
                        edge="end"
                        onChange={handleCheck}
                        value={question.id}
                        checked={checkedQnIDs?.includes(question.id) || false}
                      />
                    }
                  >
                    <ListItemButton
                      onClick={() => setSelQuestion(question)}
                      sx={{
                        bgcolor:
                          question?.id === selQuestion?.id
                            ? "rgba(0,180,235,0.1)"
                            : "transparent",
                      }}
                    >
                      <ListItemText>
                        {parse(formatPrompt(question.prompt))}
                      </ListItemText>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <div className="question-counter">
                <IconButton
                  disabled={page === 1 || fetching}
                  onClick={handleBack}
                  size="small"
                >
                  <ArrowLeftIcon />
                </IconButton>
                <span
                  style={{
                    marginLeft: "2px",
                    marginRight: "2px",
                    position: "relative",
                    top: "1px",
                  }}
                >
                  {(page - 1) * countPerPage + 1} -{" "}
                  {(page - 1) * countPerPage + questions.length} of {totalCount}{" "}
                  questions
                </span>
                <IconButton
                  disabled={page === lastPage || fetching}
                  onClick={handleNext}
                  size="small"
                >
                  <ArrowRightIcon />
                </IconButton>
              </div>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <BtnContainer>
              {viewChecked ? (
                <Button
                  fullWidth
                  onClick={handleOpenImport}
                  startIcon={<RedoIcon />}
                  variant="contained"
                >
                  COPY TO QUESTION SET
                </Button>
              ) : (
                <Button
                  disabled={checkedQns.length === 0}
                  onClick={showChecked}
                  fullWidth
                >
                  VIEW SELECTED
                </Button>
              )}
            </BtnContainer>
            {viewChecked && (
              <BtnContainer center>
                <Button onClick={showAll} fullWidth>
                  VIEW ALL
                </Button>
              </BtnContainer>
            )}
            {isEditor && (
              <Button
                fullWidth
                onClick={handleOpenBuilder}
                startIcon={<AddIcon />}
              >
                ADD QUESTION
              </Button>
            )}
            {/* <Button fullWidth onClick={() => countLibraryQuestions(libID)}>
              Count Questions
            </Button> */}

            {searchFocused && (
              <Box
                sx={{
                  position: "absolute",
                  top: "57px",
                  width: "300px",
                  overflow: "auto",
                  maxHeight: "70vh",
                }}
              >
                <List disablePadding>
                  {isEditor && (
                    <ListItemButton
                      className="search-suggestion"
                      onClick={() => {
                        console.log("pizza");
                        handleOpenSearchSuggestion();
                      }}
                      sx={suggestionStyle}
                    >
                      <ListItemText primary="+ search suggestion" />
                    </ListItemButton>
                  )}
                  {isEditor && <Divider sx={{ border: "1px solid silver" }} />}
                  {suggestionsFiltered.map((term) => (
                    <ListItemButton
                      className="search-suggestion"
                      key={term}
                      onClick={() => {
                        setSearchTerm(term);
                        setSearchFocused(false);
                        handleSearch(term);
                      }}
                      sx={suggestionStyle}
                    >
                      <ListItemText primary={term} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )}
            <div style={{ height: "50px" }}></div>
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
                {isEditor && (
                  <div className="flex flex-row flex-space-between flex-center">
                    <Typography color="text.secondary" sx={{ pl: "10px" }}>
                      Question ID: {selQuestion.id}
                    </Typography>
                    <Button onClick={handleOpenEdit}>Edit</Button>
                  </div>
                )}

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
                {isEditor &&
                  tags?.map((tag, ind) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={{ mr: 1, mb: 1 }}
                      onDelete={() => deleteTag(ind)}
                    />
                  ))}
                {!isEditor &&
                  tags?.map((tag) => (
                    <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1 }} />
                  ))}
                {isEditor && (
                  <Chip
                    icon={<AddIcon />}
                    onClick={handleOpenTag}
                    label="add tag"
                    sx={{ mr: 1, mb: 1 }}
                    variant="outlined"
                  />
                )}
              </Card>
            )}
            {isEditor && selQuestion && (
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
        edit={edit}
        libID={libID}
        handleClose={handleCloseBuilder}
        open={openBuilder}
        selQuestion={selQuestion}
        setEdit={setEdit}
        setSelQuestion={setSelQuestion}
        incrementQnCount={incrementQnCount}
      />
      <SearchSuggestionForm
        handleClose={handleCloseSearchSuggestion}
        libID={libID}
        open={openSearchSuggestion}
        searchTerm={searchTerm}
        suggestions={suggestions}
      />
      <TagsForm
        handleClose={handleCloseTag}
        libraryID={libID}
        questionID={selQuestion?.id}
        open={openTag}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
      />
      <QnImporter
        handleClose={handleCloseImport}
        open={openImport}
        checkedQns={checkedQns}
        user={user}
      />
    </>
  );
}

function LicensePanel({ library }) {
  const license = library?.license || null;
  const title = license?.title || "(no title)";
  const licenseType = license?.type || "All Rights Reserved";
  const authors = formatAuthorNames(license?.authors);
  const dateApplied = license?.dateApplied?.toDate() || new Date();
  const yearApplied = dateApplied.getFullYear();
  const isCreativeCommons = licenseType.includes("Creative Commons");
  const allRightsReserved = licenseType === "All Rights Reserved";

  return (
    <Panel>
      <div style={{ height: "15vh" }}></div>
      <Typography>
        <strong>
          <CopyrightIcon
            sx={{ position: "relative", top: "7px", right: "5px" }}
          />
          {yearApplied} {title} by {authors}
        </strong>
      </Typography>
      {allRightsReserved ? (
        <Typography>
          <strong>{licenseType}</strong>
        </Typography>
      ) : (
        <Typography>
          <strong>is licensed under {licenseType}</strong>
        </Typography>
      )}
      <div style={{ height: "8vh" }}></div>
      <Typography>What {licenseType} license means:</Typography>
      <br />
      <LicenseMessage licenseType={licenseType} />
      <br />
      {isCreativeCommons && (
        <Typography>
          Visit the
          <Link
            href="https://creativecommons.org/licenses/"
            target="_blank"
            sx={{ mx: "6px" }}
          >
            Creative Commons website
          </Link>
          to learn more
        </Typography>
      )}
    </Panel>
  );
}

function LicenseMessage({ licenseType }) {
  if (licenseType === "Creative Commons BY SA") {
    return (
      <>
        <Typography>
          You must provide attribution to the original author(s)
        </Typography>
        <Typography>
          when reusing of modifying any content from this library
        </Typography>
        <Typography>and relicense under the like terms</Typography>
      </>
    );
  }

  if (licenseType === "All Rights Reserved") {
    return (
      <>
        <Typography>
          You must contact the author&#40;s&#41; to request permission
        </Typography>
        <Typography>
          when reusing of modifying any content from this library
        </Typography>
      </>
    );
  }
}

function formatPrompt(str) {
  const newStr = str
    .replaceAll(/<br\/{0,1}>/g, "")
    .replaceAll(
      /<div\sclass="equation-container.+<\/span><\/div>/g,
      `<br/><div style="color:silver;text-align:center;">(equation)</div><br/>`
    );
  return newStr;
}
