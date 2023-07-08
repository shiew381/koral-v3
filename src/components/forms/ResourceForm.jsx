import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import {
  addResource,
  getUserDocuments,
  getUserImages,
  getUserLinks,
} from "../../utils/firestoreClient";

function getTitle(type, selItem) {
  if (!selItem) return "";
  switch (type) {
    case "document":
    case "image": {
      return selItem.name;
    }
    case "link": {
      return selItem.title;
    }

    default:
      break;
  }
}

function getDocRef(type, selItem, user) {
  switch (type) {
    case "document": {
      return `users/${user?.uid}/documents/${selItem?.id}`;
    }
    case "image": {
      return `users/${user?.uid}/images/${selItem?.id}`;
    }
    case "link": {
      return `users/${user?.uid}/links/${selItem?.id}`;
    }
    default:
      return "";
  }
}

export function ResourceForm({ course, handleClose, open, user }) {
  const [type, setType] = useState("document");
  const [selItem, setSelItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const values = {
    type: type,
    title: getTitle(type, selItem),
    source: {
      type: "user content",
      docRef: getDocRef(type, selItem, user),
    },
  };

  function handleKeyUp(e) {
    if (e.code === "Enter") {
      handleSubmit();
    }
  }

  function handleSubmit() {
    addResource(course, values, handleClose, setSubmitting);
  }

  function handleType(e) {
    setType(e.target.value);
  }

  function resetForm() {
    setType("document");
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      handleKeyUp={handleKeyUp}
      customStyle={{ maxWidth: "500px" }}
    >
      <LightboxHeader title="Add Resource" />

      <FormControl>
        <InputLabel>type</InputLabel>
        <Select
          label="type"
          onChange={handleType}
          sx={{ mr: "15px", minWidth: "160px" }}
          value={type}
        >
          <MenuItem value="document">Document</MenuItem>
          <MenuItem value="image">Image</MenuItem>
          <MenuItem value="link">Link</MenuItem>
        </Select>
      </FormControl>
      {type == "document" && (
        <DocumentSelect selItem={selItem} setSelItem={setSelItem} user={user} />
      )}
      {type == "document" && <DocumentPreview selItem={selItem} />}
      {type === "image" && (
        <ImageSelect selItem={selItem} setSelItem={setSelItem} user={user} />
      )}
      {type === "image" && <ImagePreview selItem={selItem} />}
      {type === "link" && (
        <LinkSelect selItem={selItem} setSelItem={setSelItem} user={user} />
      )}
      {type === "link" && <LinkPreview selItem={selItem} />}
      <BtnContainer right>
        <SubmitBtn
          label="ADD"
          onClick={handleSubmit}
          disabled={submitting}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}

function DocumentSelect({ selItem, setSelItem, user }) {
  const [documents, setDocuments] = useState([]);

  function handleItemSelect(e) {
    const foundDocument = documents.find(
      (document) => document.id === e.target.value
    );
    setSelItem(foundDocument);
  }

  useEffect(
    () => {
      if (!user) return;
      getUserDocuments(user, setDocuments, setSelItem);
    },
    //eslint-disable-next-line
    [user]
  );

  if (!selItem) {
    return null;
  }

  return (
    <Select
      value={selItem?.id || ""}
      onChange={handleItemSelect}
      sx={{ minWidth: "180px", maxWidth: "220px" }}
    >
      {documents.map((document) => (
        <MenuItem key={document.id} value={document.id}>
          {document?.name}
        </MenuItem>
      ))}
    </Select>
  );
}

function DocumentPreview({ selItem }) {
  const url = selItem?.url + "#toolbar=0&view=FitH";

  if (!selItem) return <Box style={{ minHeight: "250px" }}></Box>;

  return (
    <Box sx={{ p: "20px" }}>
      <iframe
        src={url}
        width="100%"
        height="250px"
        style={{
          minWidth: "200px",
          border: "none",
          padding: "none",
        }}
        type="application/pdf"
        title="embdeded pdf"
      />
    </Box>
  );
}

function LinkSelect({ selItem, setSelItem, user }) {
  const [links, setLinks] = useState([]);

  function handleItemSelect(e) {
    const foundImage = links.find((qSet) => qSet.id === e.target.value);
    setSelItem(foundImage);
  }

  useEffect(
    () => {
      if (!user) return;
      getUserLinks(user, setLinks, setSelItem);
    },
    //eslint-disable-next-line
    [user]
  );

  if (!selItem) {
    return null;
  }

  return (
    <Select
      value={selItem?.id || ""}
      onChange={handleItemSelect}
      sx={{ minWidth: "180px", maxWidth: "220px" }}
    >
      {links.map((link) => (
        <MenuItem key={link.id} value={link.id}>
          {link.title}
        </MenuItem>
      ))}
    </Select>
  );
}

function LinkPreview({ selItem }) {
  if (!selItem) return <Box style={{ minHeight: "250px" }}></Box>;

  return (
    <Box sx={{ p: "20px" }}>
      <iframe
        src={selItem.url}
        width="100%"
        height="540px"
        style={{ maxHeight: "30vh", border: "none", padding: "none" }}
        title="embdeded link"
      />
    </Box>
  );
}

function ImageSelect({ selItem, setSelItem, user }) {
  const [images, setImages] = useState([]);

  function handleItemSelect(e) {
    const foundImage = images.find((qSet) => qSet.id === e.target.value);
    setSelItem(foundImage);
  }

  useEffect(
    () => {
      if (!user) return;
      getUserImages(user, setImages, setSelItem);
    },
    //eslint-disable-next-line
    [user]
  );

  if (!selItem) {
    return null;
  }

  return (
    <Select
      value={selItem?.id || ""}
      onChange={handleItemSelect}
      sx={{ minWidth: "180px", maxWidth: "220px" }}
    >
      {images.map((image) => (
        <MenuItem key={image.id} value={image.id}>
          {image?.name}
        </MenuItem>
      ))}
    </Select>
  );
}

function ImagePreview({ selItem }) {
  if (!selItem) return <Box style={{ minHeight: "250px" }}></Box>;

  return (
    <div
      className="flex flex-center flex-col"
      style={{ height: "300px", maxWidth: "100%", padding: 10 }}
    >
      <img
        src={selItem?.url}
        style={{ maxHeight: "150px", maxWidth: "300px", minHeight: "100px" }}
        alt=""
      />
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Preview
      </Typography>
    </div>
  );
}
