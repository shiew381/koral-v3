import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../hooks/useStorage";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";
import {
  addPointerToFile,
  deleteUserContent,
  fetchUserImages,
} from "../utils/firestoreClient.js";
import { getFileExtension } from "../utils/fileUtils";
import { formatDate } from "../utils/dateUtils";
import { filterByTerm } from "../utils/filterUtils";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  ListItemButton,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { LoadingIndicator, Page, PageHeader } from "../components/common/Pages";
import { ImagePreviewBox } from "../components/common/Lightbox";
import { MoreOptionsBtn } from "../components/common/Buttons";
import { SearchField } from "../components/common/InputFields";
import { MoreOptionsMenu, MenuOption } from "../components/common/Menus";
import "../css/ImagesPage.css";

export default function ImagesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [selImage, setSelImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = filterByTerm(images, searchTerm);

  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const filePath = `users/${user?.uid}/images/${file?.name}`;

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleCloseMenu = () => setAnchorEl(null);
  const handlePreviewOpen = () => setPreviewOpen(true);
  const handlePreviewClose = () => setPreviewOpen(false);

  function handleSelectFile(e) {
    let selectedFile = e.target.files[0];
    const fileType = selectedFile?.type;
    const fileExtension = getFileExtension(selectedFile);
    const acceptedTypes = ["image/png", "image/jpeg"];
    const acceptedExtensions = ["PNG", "jpeg"];

    const validFile =
      selectedFile &&
      (acceptedTypes.includes(fileType) ||
        acceptedExtensions.includes(fileExtension));

    if (!validFile) {
      setError(true);
      setErrorMessage("please select an image file (PNG or JPG)");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(false);
    setErrorMessage("");
  }

  function handleUploadSuccess(url) {
    addPointerToFile(user, file, url, "images");
  }

  function handleSearchTerm(e) {
    setSearchTerm(e.target.value.toLowerCase());
  }

  function deleteImage(image) {
    const storageRef = ref(storage, `users/${user.uid}/images/${image?.name}`);
    deleteObject(storageRef)
      .then(() => deleteUserContent(user, "images", image.id))
      .then(() => handleCloseMenu())
      .catch((error) => console.log(error));
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserImages(user, setImages, setLoading);
    },
    //eslint-disable-next-line
    [user]
  );

  useStorage(file, setFile, filePath, setUploadProgress, handleUploadSuccess);

  if (!user) return null;

  if (loading)
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );

  if (images.length === 0) {
    return (
      <Page>
        <PageHeader title="Images" />
        <div className="flex flex-center" style={{ height: "50vh" }}>
          <Box className="build-first-item">
            <Typography
              align="center"
              color="primary"
              sx={{ mb: 2 }}
              variant="h6"
            >
              Welcome to your images! Choose a JPEG or PNG file to upload.
            </Typography>
            <UploadImage
              file={file}
              handleSelectFile={handleSelectFile}
              uploadProgress={uploadProgress}
            />
            {error && (
              <Alert severity="warning" sx={{ my: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </Box>
        </div>
      </Page>
    );
  }

  if (images.length > 0) {
    return (
      <Page>
        <PageHeader title="Images" />
        <Box sx={{ px: 3 }}>
          <Box
            className="flex flex-align-center flex-space-between flex-wrap"
            sx={{ pb: 2 }}
            width="450px"
          >
            <SearchField
              onChange={handleSearchTerm}
              placeholder="search by title"
              value={searchTerm}
            />
            <UploadImage
              file={file}
              handleSelectFile={handleSelectFile}
              uploadProgress={uploadProgress}
            />
          </Box>
          {filtered.length === 0 && (
            <Box sx={{ p: 2 }}>
              No images with name containing &quot;{searchTerm}&quot;
            </Box>
          )}
          {error && (
            <Alert severity="warning" sx={{ my: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Box className="flex flex-row flex-wrap">
            {filtered.map((image) => (
              <Box
                key={image.id}
                className="img-container flex flex-center relative"
              >
                <img
                  alt={image.alt}
                  className="img-tile"
                  src={image.url}
                  onClick={() => {
                    handlePreviewOpen();
                    setSelImage(image);
                  }}
                />
                <ImageDetails info={image} />
                <Box sx={{ position: "absolute", bottom: 10, right: 5 }}>
                  <MoreOptionsBtn
                    item={image}
                    setAnchorEl={setAnchorEl}
                    setSelItem={setSelImage}
                  />
                </Box>
              </Box>
            ))}
          </Box>
          <MoreOptionsMenu
            anchorEl={anchorEl}
            handleClose={handleCloseMenu}
            open={menuOpen}
          >
            {/* <MenuOption>
              <ListItemButton>Download</ListItemButton>
            </MenuOption> */}
            <MenuOption>
              <ListItemButton href={selImage?.url} target="_blank">
                Open in new tab
              </ListItemButton>
            </MenuOption>
            <MenuOption>
              <ListItemButton onClick={() => deleteImage(selImage)}>
                Delete
              </ListItemButton>
            </MenuOption>
          </MoreOptionsMenu>
        </Box>

        <br />
        <br />
        <ImagePreviewBox
          open={previewOpen}
          onClose={handlePreviewClose}
          image={selImage}
        />
      </Page>
    );
  }
}

function ImageDetails({ info }) {
  return (
    <div className="img-details">
      <Typography sx={{ pt: 1, px: 2 }} variant="subtitle1">
        {info.name}
      </Typography>
      <Typography sx={{ px: 2, pb: 1 }} variant="subtitle2">
        uploaded {formatDate(info.dateUploaded)}
      </Typography>
    </div>
  );
}

function UploadImage({ file, uploadProgress, handleSelectFile }) {
  if (!file) {
    return (
      <Box sx={{ width: "170px" }}>
        <Button
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ px: 2 }}
        >
          upload image
          <input type="file" hidden onChange={handleSelectFile} />
        </Button>
      </Box>
    );
  }

  if (file) {
    return (
      <Box sx={{ width: "130px", px: "20px" }}>
        <LinearProgress variant="determinate" value={uploadProgress} />
      </Box>
    );
  }
}
