import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LoadingIndicator, Page } from "../components/common/Pages";
import { BackToStudentDashboard } from "../components/common/CourseCpnts";
import {
  getDocument,
  getImage,
  getLink,
  getResource,
} from "../utils/firestoreClient";
import { Box, Link, Typography } from "@mui/material";
import { VertDivider } from "../components/common/Dividers";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function CourseResourcePage() {
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [item, setItem] = useState(null);
  const { courseID, resourceID } = useParams();

  useEffect(
    () => {
      getResource(courseID, resourceID, setResource);
    },
    //eslint-disable-next-line
    []
  );

  useEffect(
    () => {
      if (!resource) {
        return;
      }

      const docRef = resource.source?.docRef;
      const docRefArr = docRef.split("/");
      const userID = docRefArr[1];
      const itemID = docRefArr[3];

      if (resource.type === "image") {
        getImage(userID, itemID, setItem, setLoading);
      }

      if (resource.type === "document") {
        getDocument(userID, itemID, setItem, setLoading);
      }

      if (resource.type === "link") {
        getLink(userID, itemID, setItem, setLoading);
      }
    },
    //eslint-disable-next-line
    [resource?.id]
  );

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <Page>
      <BackToStudentDashboard />
      <Box className="page-main flex flex-column flex-justify-center">
        {resource.type === "document" && (
          <Box className="flex flex-col flex-align-center" sx={{ px: 2 }}>
            <br />
            <DocEmbed doc={item} />
            <DocDetails doc={item} />

            <div style={{ minHeight: "50px" }}>&nbsp;</div>
          </Box>
        )}
        {resource.type === "image" && (
          <Box className="flex flex-col flex-align-center" sx={{ px: 2 }}>
            <br />
            <br />
            <img
              src={item.url}
              style={{
                minWidth: "280px",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
            <ImageDetails image={item} />
          </Box>
        )}
        {resource.type === "link" && (
          <Box
            className="flex flex-col flex-align-center"
            sx={{ width: "100vw" }}
          >
            <br />
            <LinkEmbed link={item} />
            <LinkDetails link={item} />
          </Box>
        )}
      </Box>
    </Page>
  );
}

function DocEmbed({ doc }) {
  const url = doc?.url + `#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  if (!doc) {
    return null;
  }

  return (
    <iframe
      src={url}
      width="800px"
      style={{
        minHeight: "1020px",
        border: "none",
        padding: "none",
      }}
      type="application/pdf"
      title="embdeded pdf"
    />
  );
}

function DocDetails({ doc }) {
  if (!doc) return null;

  const fileSize = doc.size / 1000000;

  return (
    <Box width="96%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1, my: 1 }}>
      <Typography variant="h6">{doc.name}</Typography>
      <Typography display="inline" variant="subtitle1">
        size: {fileSize.toFixed(2)} MB
      </Typography>
      <VertDivider />
      <Link href={doc.url} target="blank" rel="noreferrer" underline="hover">
        open in new tab{" "}
        <OpenInNewIcon
          fontSize="5px"
          sx={{ position: "relative", top: "3px" }}
        />
      </Link>
    </Box>
  );
}

function ImageDetails({ image }) {
  const fileSize = image.size / 1000000;

  return (
    <Box width="96%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1, my: 1 }}>
      <Typography variant="h6">{image.name}</Typography>
      <Typography display="inline" variant="subtitle1">
        size: {fileSize.toFixed(2)} MB
      </Typography>
      <VertDivider />
      <Link href={image.url} target="blank" rel="noreferrer" underline="hover">
        open in new tab
        <OpenInNewIcon
          fontSize="5px"
          sx={{ position: "relative", top: "3px" }}
        />
      </Link>
    </Box>
  );
}

function LinkEmbed({ link }) {
  if (!link) {
    return null;
  }

  return (
    <iframe
      src={link.url}
      width="90%"
      style={{
        minHeight: "72vh",
        border: "none",
        padding: "none",
      }}
      type="application/pdf"
      title="embdeded pdf"
    />
  );
}

function LinkDetails({ link }) {
  return (
    <Box width="88%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1, my: 1 }}>
      <Typography variant="h6">{link.title}</Typography>

      <Link href={link.url} target="blank" rel="noreferrer" underline="hover">
        open in new tab
        <OpenInNewIcon
          fontSize="5px"
          sx={{ position: "relative", top: "3px" }}
        />
      </Link>
    </Box>
  );
}
