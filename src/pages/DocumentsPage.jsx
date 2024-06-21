import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../hooks/useStorage";
import {
  addPointerToFile,
  fetchUserDocuments,
} from "../utils/firestoreClient.js";
import { getFileExtension } from "../utils/fileUtils";
import { formatDate } from "../utils/dateUtils";
import { filterByTerm } from "../utils/filterUtils";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { LoadingIndicator, Page, PageHeader } from "../components/common/Pages";
import { SearchField } from "../components/common/InputFields";
import { VertDivider } from "../components/common/Dividers";
import { MoreOptionsBtn } from "../components/common/Buttons";
import { MoreOptionsMenu, MenuOption } from "../components/common/Menus";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";
import { deleteUserContent } from "../utils/firestoreClient.js";

export default function DocumentsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [selDocument, setSelDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = filterByTerm(documents, searchTerm);

  const [file, setFile] = useState();
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const filePath = `users/${user?.uid}/documents/${file?.name}`;

  function deleteDocument(doc) {
    const storagePath = `users/${user.uid}/documents/${doc?.name}`;
    const storageRef = ref(storage, storagePath);

    deleteObject(storageRef)
      .then(() => deleteUserContent(user, "documents", doc.id))
      .catch((error) => console.log(error));

    if (doc.id === selDocument.id) {
      setSelDocument(null);
    }
  }

  function handleSearchTerm(e) {
    setSearchTerm(e.target.value.toLowerCase());
  }

  function handleSelectFile(e) {
    let selectedFile = e.target.files[0];
    const fileType = selectedFile?.type;
    const fileExtension = getFileExtension(selectedFile);
    const acceptedTypes = ["application/pdf"];
    const acceptedExtensions = ["pdf"];

    const validFile =
      selectedFile &&
      (acceptedTypes.includes(fileType) ||
        acceptedExtensions.includes(fileExtension));

    if (!validFile) {
      setError(true);
      setErrorMessage("Please choose a PDF file");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(false);
    setErrorMessage("");
  }

  function handleUploadSuccess(url) {
    addPointerToFile(user, file, url, "documents");
  }

  function toggleOrder() {
    const updated = [...documents].reverse();
    setDocuments(updated);
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserDocuments(user, setDocuments, setLoading);
    },
    //eslint-disable-next-line
    [user]
  );

  useStorage(file, setFile, filePath, setUploadProgress, handleUploadSuccess);

  if (!user) {
    return null;
  }

  if (loading)
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );

  if (documents.length === 0) {
    return (
      <Page>
        <PageHeader title="Documents" />
        <div
          className="flex flex-center"
          style={{ height: "50vh", padding: "20px" }}
        >
          <div>
            <Typography align="center" color="primary" variant="h6">
              Welcome to your documents! Choose a PDF file to upload.
            </Typography>
            <br />
            <UploadDocument
              file={file}
              handleSelectFile={handleSelectFile}
              uploadProgress={uploadProgress}
            />
            {error && (
              <Alert severity="warning" sx={{ my: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </Page>
    );
  }

  if (documents.length > 0) {
    return (
      <Page>
        <PageHeader title="Documents" />
        <Box className="flex flex-row hide-if-mobile" sx={{ px: 2 }}>
          <Box className="flex-col " sx={{ width: "300px", mx: "15px" }}>
            <Box
              className="flex flex-align-center flex-space-between"
              sx={{ py: 1 }}
            >
              <SearchField
                onChange={handleSearchTerm}
                placeholder="search by title"
                value={searchTerm}
              />
              <IconButton onClick={toggleOrder}>
                <SwapVertIcon style={{ color: "gray" }} />
              </IconButton>
            </Box>
            <Divider />
            <DocList
              deleteDocument={deleteDocument}
              documents={filtered}
              searchTerm={searchTerm}
              selDocument={selDocument}
              setSelDocument={setSelDocument}
            />
            <Divider />
            {error && <Alert severity="warning">{errorMessage}</Alert>}
            <UploadDocument
              file={file}
              handleSelectFile={handleSelectFile}
              uploadProgress={uploadProgress}
            />
          </Box>
          <Box className="flex flex-justify-center flex-grow relative">
            <Box sx={{ width: "100%" }}>
              <DocEmbed doc={selDocument} />
              <DocDetails doc={selDocument} />
            </Box>
          </Box>
        </Box>
        <Box className="show-if-mobile" sx={{ px: "3px" }}>
          <FormControl fullWidth>
            <InputLabel>Document</InputLabel>
            <Select
              value={selDocument}
              label="Document"
              onChange={(e) => setSelDocument(e.target.value)}
              sx={{ maxWidth: "400px" }}
            >
              {documents.map((doc) => (
                <MenuItem value={doc} key={doc.id}>
                  <Typography color="textSecondary">{doc.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <Box className="flex-col flex-center flex-grow relative">
            <DocEmbed doc={selDocument} />
            <DocDetails doc={selDocument} />
          </Box>
        </Box>
      </Page>
    );
  }
}

function DocList({
  documents,
  deleteDocument,
  searchTerm,
  selDocument,
  setSelDocument,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selItem, setSelItem] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  if (documents?.length == 0) {
    return (
      <List disablePadding sx={{ height: "63vh", overflow: "auto" }}>
        <ListItem component="div" disablePadding sx={{ bgcolor: "none", p: 2 }}>
          <ListItemText>
            No documents with name containing &quot;{searchTerm}&quot;
          </ListItemText>
        </ListItem>
      </List>
    );
  }

  return (
    <List disablePadding sx={{ height: "63vh", overflow: "auto" }}>
      {documents.map((doc) => (
        <ListItem
          component="div"
          disablePadding
          key={doc.id}
          secondaryAction={
            <MoreOptionsBtn
              item={doc}
              setAnchorEl={setAnchorEl}
              setSelItem={setSelItem}
            />
          }
          sx={{
            bgcolor: selDocument?.id === doc.id ? "whitesmoke" : "none",
          }}
        >
          <ListItemButton onClick={() => setSelDocument(doc)}>
            {doc?.name}
          </ListItemButton>
        </ListItem>
      ))}
      <MoreOptionsMenu
        anchorEl={anchorEl}
        handleClose={handleCloseMenu}
        open={menuOpen}
      >
        <MenuOption>
          <ListItemButton
            href={selDocument?.url}
            target="_blank"
            onClick={handleCloseMenu}
          >
            Open in new tab
          </ListItemButton>
        </MenuOption>
        <MenuOption>
          <ListItemButton
            onClick={() => {
              deleteDocument(selItem);
              handleCloseMenu();
            }}
          >
            Delete
          </ListItemButton>
        </MenuOption>
      </MoreOptionsMenu>
    </List>
  );
}

function UploadDocument({ file, uploadProgress, handleSelectFile }) {
  if (!file) {
    return (
      <Button
        color="secondary"
        component="label"
        fullWidth
        startIcon={<CloudUploadIcon />}
        sx={{ p: 2 }}
        variant="outlined"
      >
        UPLOAD DOCUMENT
        <input type="file" hidden onChange={handleSelectFile} />
      </Button>
    );
  }

  if (file) {
    return (
      <Box sx={{ width: "80%", maxWidth: "300px", py: "20px", margin: "auto" }}>
        <LinearProgress variant="determinate" value={uploadProgress} />
      </Box>
    );
  }
}

function DocEmbed({ doc }) {
  const url = doc?.url + `#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  if (!doc)
    return (
      <div className="flex flex-center" style={{ height: "50vh" }}>
        <Typography align="center">
          Please select a document from the list
        </Typography>
      </div>
    );

  return (
    <div style={{ height: "70vh", boxSizing: "content-box" }}>
      <iframe
        src={url}
        width="98%"
        height="98%"
        style={{ border: "none" }}
        type="application/pdf"
        title="embdeded pdf"
      />
    </div>
  );
}

function DocDetails({ doc }) {
  if (!doc) return null;

  const fileSize = doc.size / 1000000;

  return (
    <Box width="95%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1 }}>
      <Typography variant="h6">{doc.name}</Typography>
      <Typography display="inline" variant="subtitle1">
        uploaded: {formatDate(doc.dateUploaded)}
      </Typography>
      <VertDivider />
      <Typography display="inline" variant="subtitle1">
        size: {fileSize.toFixed(2)} MB
      </Typography>
      <VertDivider />
      <Link
        color="secondary"
        href={doc.url}
        target="blank"
        rel="noreferrer"
        underline="hover"
      >
        open in new tab
        <OpenInNewIcon
          fontSize="5px"
          sx={{ position: "relative", top: "3px" }}
        />
      </Link>
    </Box>
  );
}
