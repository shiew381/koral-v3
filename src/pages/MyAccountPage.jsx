import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchLibrariesAsEditor,
  fetchUserInfo,
} from "../utils/firestoreClient";
import { formatDate } from "../utils/dateUtils";
import { Box } from "@mui/material";
import { Page, PageHeader } from "../components/common/Pages";

export default function MyAccountPage() {
  const [libraries, setLibraries] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const { user } = useAuth();
  const userDisplayName = userInfo?.firstName + " " + userInfo?.lastName;
  const userEmail = user?.email;
  const dateCreated = new Date(Number(user?.metadata?.createdAt));
  const dateLastLogin = new Date(Number(user?.metadata?.lastLoginAt));
  const cellStyle = { textAlign: "right", padding: "8px", minWidth: "150px" };
  const cellStyle2 = { padding: "8px", minWidth: "150px" };

  useEffect(
    () => {
      if (!user) return;
      fetchUserInfo(user, setUserInfo);
    },
    //eslint-disable-next-line
    [user?.uid]
  );

  useEffect(
    () => {
      if (!user) return;
      fetchLibrariesAsEditor(user, setLibraries);
    },
    //eslint-disable-next-line
    [user?.uid]
  );

  if (!user) {
    return null;
  }

  console.log(userInfo);

  return (
    <Page>
      <PageHeader title="My Account" />
      <Box className="flex flex-center flex-col" sx={{ height: "60vh" }}>
        <table>
          <tbody>
            <tr>
              <td style={cellStyle}>name</td>
              <td style={cellStyle2}>{userDisplayName}</td>
            </tr>
            <tr>
              <td style={cellStyle}>email</td>
              <td style={cellStyle2}>{userEmail}</td>
            </tr>
            <tr>
              <td style={cellStyle}>account created</td>
              <td style={cellStyle2}>{formatDate(dateCreated)}</td>
            </tr>
            <tr>
              <td style={cellStyle}>last login</td>
              <td style={cellStyle2}>{formatDate(dateLastLogin)}</td>
            </tr>
          </tbody>
        </table>
        <br />
        <br />
        {libraries.length > 0 && (
          <table>
            <thead>
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  <strong>Permissions</strong>
                </td>
              </tr>
            </thead>
            <tbody>
              {libraries.map((library) => (
                <tr key={library.id}>
                  <td style={cellStyle}>{library.title}</td>
                  <td style={cellStyle2}>library editor</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </Page>
  );
}
