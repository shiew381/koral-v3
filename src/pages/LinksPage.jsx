import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { filterByTerm } from "../utils/filterUtils";
import { formatDate } from "../utils/dateUtils";
import { deleteUserContent, fetchUserLinks } from "../utils/firestoreClient";
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { SearchField } from "../components/common/InputFields";
import { VertDivider } from "../components/common/Dividers";
import AddIcon from "@mui/icons-material/Add";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { BuildFirstItem } from "../components/common/CallsToAction";
import {
  LoadingIndicator,
  Page,
  PageHeader,
} from "../components/common/Pages.jsx";
import { AddLinkForm } from "../components/forms/AddLinkForm";
import { MenuOption, MoreOptionsMenu } from "../components/common/Menus";
import { MoreOptionsBtn } from "../components/common/Buttons";

export default function LinksPage() {
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selLink, setSelLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = filterByTerm(links, searchTerm);

  const { user } = useAuth();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function toggleOrder() {
    const updated = [...links].reverse();
    setLinks(updated);
  }

  function handleSearchTerm(e) {
    setSearchTerm(e.target.value.toLowerCase());
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserLinks(user, setLinks, setLoading);
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

  if (links.length === 0) {
    return (
      <Page>
        <PageHeader title="Links" />
        <BuildFirstItem
          handleOpen={handleOpen}
          item="link"
          message="Welcome to your links! Embed content from other websites here."
        />
        <AddLinkForm open={open} handleClose={handleClose} user={user} />
      </Page>
    );
  }

  if (links.length > 0) {
    return (
      <Page>
        <PageHeader title="Links" />
        <Box className="flex flex-row hide-if-tablet" sx={{ px: 2 }}>
          <Box className="flex-col" sx={{ width: "300px", mx: "15px" }}>
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
            <LinkList
              links={filtered}
              searchTerm={searchTerm}
              selLink={selLink}
              setSelLink={setSelLink}
              user={user}
            />
            <Divider />
            <AddLinkBtn onClick={handleOpen} />
          </Box>
          <Box className="flex flex-justify-center flex-grow relative">
            <Box sx={{ width: "100%" }}>
              <LinkEmbed link={selLink} />
              <LinkDetails link={selLink} />
            </Box>
          </Box>
        </Box>
        <Box className="show-if-tablet" sx={{ px: "3px" }}>
          <FormControl fullWidth>
            <InputLabel>Link</InputLabel>
            <Select
              value={selLink}
              label="Link"
              onChange={(e) => setSelLink(e.target.value)}
              sx={{ maxWidth: "400px" }}
            >
              {links.map((link) => (
                <MenuItem value={link} key={link.id}>
                  <Typography color="textSecondary">{link.title}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <Box className="flex-col flex-center flex-grow relative">
            <LinkEmbed link={selLink} />
            <LinkDetails link={selLink} />
          </Box>
        </Box>
        <AddLinkForm open={open} handleClose={handleClose} user={user} />
      </Page>
    );
  }
}

function LinkList({ links, searchTerm, selLink, setSelLink, user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selItem, setSelItem] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  if (links?.length == 0) {
    return (
      <List disablePadding sx={{ height: "65vh", overflow: "auto" }}>
        <ListItem component="div" disablePadding sx={{ bgcolor: "none", p: 2 }}>
          <ListItemText>
            No links with name containing &quot;{searchTerm}&quot;
          </ListItemText>
        </ListItem>
      </List>
    );
  }

  return (
    <List disablePadding sx={{ height: "65vh", overflow: "auto" }}>
      {links.map((link) => (
        <ListItem
          component="div"
          disablePadding
          key={link.id}
          secondaryAction={
            <MoreOptionsBtn
              item={link}
              setAnchorEl={setAnchorEl}
              setSelItem={setSelItem}
            />
          }
          sx={{
            bgcolor: selLink?.id === link.id ? "whitesmoke" : "none",
          }}
        >
          <ListItemButton onClick={() => setSelLink(link)}>
            {link?.title}
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
            href={selItem?.url}
            target="_blank"
            onClick={handleCloseMenu}
          >
            Open in new tab
          </ListItemButton>
        </MenuOption>
        <MenuOption>
          <ListItemButton
            onClick={() => {
              deleteUserContent(user, "links", selItem?.id);
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

function AddLinkBtn({ onClick }) {
  return (
    <Button
      color="secondary"
      fullWidth
      onClick={onClick}
      startIcon={<AddIcon />}
    >
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
    <Box width="100%">
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
    <Box width="97%" sx={{ bgcolor: "whitesmoke", px: 2, py: 1 }}>
      <Typography variant="h6">{link.title}</Typography>
      <Typography display="inline">{link.description}</Typography>
      <VertDivider />
      <Typography display="inline" variant="subtitle1">
        added: {formatDate(link.dateCreated)}
      </Typography>
      <VertDivider />

      <Link
        color="secondary"
        href={link.url}
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
