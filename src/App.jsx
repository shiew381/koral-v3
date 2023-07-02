import "../src/css/App.css";
import { Button } from "@mui/material";

function App() {
  return (
    <div>
      <Button>hello</Button>
      <span> {import.meta.env.VITE_APP_TITLE}</span>
    </div>
  );
}

export default App;
