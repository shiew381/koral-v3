import { useState, useEffect } from "react";
import { filterByTerm } from "../utils/filterUtils";
import { formatDate } from "../utils/dateUtils";
import { fetchUserLinks } from "../utils/firestoreClient";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from "@mui/material";
import { SearchField } from "../components/common/InputFields";
import { VertDivider } from "../components/common/Dividers";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { BuildFirstItem } from "../components/common/CallsToAction";
import {
  LoadingIndicator,
  Page,
  PageHeader,
} from "../components/common/Pages.jsx";
import { useAuth } from "../contexts/AuthContext";
import { AddLinkForm } from "../components/forms/AddLinkForm";

export default function LinksPage() {
  const [fetching, setFetching] = useState(true);
  const [links, setLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selLink, setSelLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filtered = filterByTerm(links, searchTerm);

  function toggleOrder() {
    const updated = [...links].reverse();
    setLinks(updated);
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value.toLowerCase());
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserLinks(user, setLinks, setFetching);
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

  if (links.length === 0) {
    return (
      <Page>
        <PageHeader title="Links" />
        <pre>{JSON.stringify(user)}</pre>
        <div className="flex flex-center" style={{ height: "50vh" }}>
          <BuildFirstItem
            handleOpen={handleOpen}
            item="link"
            message="Welcome to your links! Embed content from other websites here."
          />
        </div>
        <AddLinkForm open={open} handleClose={handleClose} user={user} />
      </Page>
    );
  }

  if (links.length > 0) {
    return (
      <Page>
        <PageHeader title="Links" />
        <Box className="flex flex-row">
          <Box className="flex-col" sx={{ width: "300px", mx: "15px" }}>
            <Box>
              <SearchField onChange={handleSearch} value={searchTerm} />
              <IconButton onClick={toggleOrder}>
                <SwapVertIcon style={{ color: "gray" }} />
              </IconButton>
            </Box>

            <Divider />
            <LinkList
              links={filtered}
              selLink={selLink}
              setSelLink={setSelLink}
            />
            <Divider />
            <AddLinkBtn onClick={handleOpen} />
            <AddLinkForm open={open} handleClose={handleClose} user={user} />
          </Box>
          <Box className="flexflex-col flex-align-center flex-grow relative">
            <LinkEmbed link={selLink} />
            <LinkDetails link={selLink} />
          </Box>
        </Box>
      </Page>
    );
  }
}

function LinkList({ links, selLink, setSelLink }) {
  if (!links) return null;

  return (
    <List disablePadding sx={{ height: "65vh", overflow: "auto" }}>
      {links.map((doc) => (
        <ListItem
          component="div"
          disablePadding
          key={doc.id}
          sx={{
            bgcolor: selLink?.id === doc.id ? "whitesmoke" : "none",
          }}
        >
          <ListItemButton onClick={() => setSelLink(doc)}>
            {doc?.title}
          </ListItemButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </ListItem>
      ))}
    </List>
  );
}

function AddLinkBtn({ onClick }) {
  return (
    <Button fullWidth onClick={onClick} startIcon={<AddIcon />}>
      ADD LINK
    </Button>
  );
}

function LinkEmbed({ link }) {
  const url = link?.url + `#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  if (!link)
    return (
      <div className="flex flex-center" style={{ height: "50vh" }}>
        <Typography align="center">
          Please select a link from the list
        </Typography>
      </div>
    );

  return (
    <Box width="98%" sx={{ px: 0 }}>
      <iframe
        src={url}
        width="100%"
        height="540px"
        style={{ minWidth: "200px", border: "none", padding: "none" }}
        title="embdeded link"
      />
    </Box>
  );
}

function LinkDetails({ link }) {
  if (!link) return null;

  return (
    <Box width="95%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1 }}>
      <Typography variant="h6">{link.title}</Typography>
      <Typography display="inline" variant="subtitle1">
        created: {formatDate(link.created)}
      </Typography>
      <VertDivider />

      <Link href={link.url} target="blank" rel="noreferrer" underline="hover">
        open in new tab{" "}
        <OpenInNewIcon
          fontSize="5px"
          sx={{ position: "relative", top: "3px" }}
        />
      </Link>
    </Box>
  );
}
