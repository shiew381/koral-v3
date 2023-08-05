import {
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import LinkIcon from "@mui/icons-material/Link";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { Link as RouterLink } from "react-router-dom";

export function NavMenu({ open }) {
  return (
    <Drawer open={open}>
      <List sx={{ width: "250px" }}>
        <Section title="My Classroom" />
        <NavLink
          icon={<CoPresentIcon />}
          path="classroom/courses"
          text="Courses"
        />
        <Break />
        <Section title="My Content" />
        <NavLink
          icon={<ArticleIcon />}
          path="content/documents"
          text="Documents"
        />
        <NavLink icon={<ImageIcon />} path="content/images" text="Images" />
        <NavLink
          icon={<AppRegistrationIcon />}
          path="content/question-sets"
          text="Question Sets"
        />
        <NavLink icon={<LinkIcon />} path="content/links" text="Links" />
        <Break />
        <Section title="Community" />
        <NavLink
          icon={<AutoStoriesIcon />}
          path="community/libraries"
          text="Libraries"
        />
      </List>
    </Drawer>
  );
}

function NavLink({ path, icon, text }) {
  return (
    <ListItemButton component={RouterLink} sx={{ pl: 4 }} to={path}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItemButton>
  );
}

function Section({ title }) {
  return (
    <ListItem>
      <ListItemText primary={title} />
    </ListItem>
  );
}

function Break() {
  return <Divider sx={{ pb: 4 }} />;
}
