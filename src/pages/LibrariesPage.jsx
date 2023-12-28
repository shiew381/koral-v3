import { useState, useEffect } from "react";
import { Page, PageHeader } from "../components/common/Pages";
import { fetchLibraries } from "../utils/firestoreClient";
import { Box, Card, CardActionArea, CardMedia } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LibrariesPage() {
  const [libraries, setLibraries] = useState([]);

  useEffect(() => {
    fetchLibraries(setLibraries);
  }, []);

  return (
    <Page>
      <PageHeader title="Libraries" />
      <Box className="flex flex-wrap">
        {libraries.map((library) => (
          <LibraryCard key={library.id} library={library} />
        ))}
      </Box>
    </Page>
  );
}

function LibraryCard({ library }) {
  const image = library?.image || null;
  const navigate = useNavigate();

  function handleClick() {
    const libraryTitle = encodeURI(
      library.title.replace(/\s/g, "-").replace(/:/, "")
    );

    navigate(`/community/libraries/${libraryTitle}/${library.id}`);
  }

  return (
    <Card className="relative" sx={{ width: 300, height: 300, m: 2 }}>
      <CardActionArea onClick={handleClick}>
        <Box>
          <CardMedia
            component="img"
            //   height="190"
            image={image ? image.url : import.meta.env.VITE_COURSE_CARD_IMG}
            alt="pond lotus flower"
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}
