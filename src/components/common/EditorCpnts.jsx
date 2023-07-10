import {
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import SubscriptIcon from "@mui/icons-material/Subscript";
import SuperscriptIcon from "@mui/icons-material/Superscript";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import FunctionsIcon from "@mui/icons-material/Functions";

export function EditorLabel({ label, handleClick }) {
  return (
    <div className="editor-label" onClick={handleClick}>
      {label}
    </div>
  );
}

export function EquationTab({ handleTab, tab, value }) {
  const label = value.toUpperCase();
  const sharedTabStyle = {
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderRadius: "8px 8px 0 0",
    cursor: "pointer",
    fontSize: "12px",
    marginRight: "6px",
    paddingTop: "6px",
    paddingLeft: "10px",
    paddingRight: "10px",
    paddingBottom: "4px",
  };

  const activeTabStyle = {
    backgroundColor: "#5FA1B5",
    borderBottom: "1px solid #5FA1B5",
    color: "white",
    ...sharedTabStyle,
  };

  const idleTabStyle = {
    backgroundColor: "rgb(230,230,230)",
    borderBottom: "none",
    color: "rgb(200,200,200)",
    ...sharedTabStyle,
  };

  return (
    <button
      className="editor-btn"
      onClick={handleTab}
      style={tab === value ? activeTabStyle : idleTabStyle}
      value={value}
    >
      {label}
    </button>
  );
}

//Editor toolbar buttons

export function BtnGroupFontStyle({ disabled, handleFormat }) {
  function bold() {
    handleFormat("STRONG");
  }

  function italicize() {
    handleFormat("EM");
  }

  function underline() {
    handleFormat("U");
  }

  return (
    <ToggleButtonGroup disabled={disabled} size="small">
      <ToggleButton className="editor-btn" onClick={bold} value="bold">
        <FormatBoldIcon />
      </ToggleButton>
      <ToggleButton className="editor-btn" onClick={italicize} value="italic">
        <FormatItalicIcon />
      </ToggleButton>
      <ToggleButton
        className="editor-btn"
        onClick={underline}
        value="underline"
      >
        <FormatUnderlinedIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export function BtnGroupScript({ disabled, handleFormat }) {
  function superscript() {
    handleFormat("SUP");
  }

  function subscript() {
    handleFormat("SUB");
  }
  return (
    <ToggleButtonGroup disabled={disabled} size="small">
      <ToggleButton
        className="editor-btn"
        onClick={superscript}
        value="superscript"
      >
        <SuperscriptIcon />
      </ToggleButton>
      <ToggleButton
        className="editor-btn"
        onClick={subscript}
        value="subscript"
      >
        <SubscriptIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export function BtnGroupList({ disabled, insertList }) {
  return (
    <ToggleButtonGroup disabled={disabled} size="small">
      <ToggleButton className="editor-btn" onClick={insertList} value="list">
        <FormatListBulletedIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export function BtnGroupImage({
  disabled,
  file,
  handleSelectFile,
  uploadProgress,
}) {
  return (
    <ToggleButtonGroup disabled={disabled || file} size="small">
      <ToggleButton
        className="editor-btn"
        component="label"
        value="image upload"
      >
        {file ? (
          <CircularProgress
            variant="determinate"
            value={uploadProgress}
            size="25px"
          />
        ) : (
          <AddPhotoAlternateIcon />
        )}
        <input type="file" hidden onChange={handleSelectFile} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export function BtnGroupEquation({ disabled, insertEquation }) {
  return (
    <ToggleButtonGroup disabled={disabled} size="small">
      <ToggleButton
        className="editor-btn"
        onClick={insertEquation}
        value="equation"
      >
        <FunctionsIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export function Symbols({ chars, insertChar }) {
  return (
    <div className="eq-symbols-container">
      {chars.map((char) => (
        <SymbolBtn char={char} key={char.caption} insertChar={insertChar} />
      ))}
    </div>
  );
}

function SymbolBtn({ char, insertChar }) {
  const btnStyle = {
    fontFamily: "Computer Modern",
    color: "gray",
    p: 0,
    minWidth: "35px",
    minHeight: "30px",
    textTransform: "none",
  };

  return (
    <Tooltip title={char.caption} placement="bottom">
      <Button
        className="editor-btn eq-symbol"
        onClick={() => insertChar(char.symbol)}
        sx={btnStyle}
      >
        {char.symbol}
      </Button>
    </Tooltip>
  );
}

// EQUATION TEMPLATES BUTTTONS

export function ParenTemplateBtn({ caption, onClick }) {
  return (
    <TemplateBtn caption={caption} onClick={onClick}>
      <ParenthesesIcon />
    </TemplateBtn>
  );
}

export function FractionTemplateBtn({ caption, onClick }) {
  return (
    <TemplateBtn caption={caption} onClick={onClick}>
      <FractionIcon />
    </TemplateBtn>
  );
}

export function SqrtTemplateBtn({ caption, onClick }) {
  return (
    <TemplateBtn caption={caption} onClick={onClick}>
      <SqrtIcon />
    </TemplateBtn>
  );
}

export function VectorTemplateBtn({ caption, onClick }) {
  return (
    <TemplateBtn caption={caption} onClick={onClick}>
      <VectorIcon />
    </TemplateBtn>
  );
}

function TemplateBtn({ caption, children, onClick }) {
  return (
    <Tooltip title={caption} placement="bottom">
      <Button className="editor-btn" onClick={onClick} sx={{ minWidth: 0 }}>
        {children}
      </Button>
    </Tooltip>
  );
}

// EQUATION TEMPLATES ICONS

export function ParenthesesIcon() {
  return (
    <>
      <span className="eq-btn-parentheses-decoration">{"("}</span>
      <span className="eq-btn-parentheses-arg"></span>
      <span className="eq-btn-parentheses-decoration">{")"}</span>
    </>
  );
}

function FractionIcon() {
  return (
    <div className="eq-fraction">
      <span className="eq-btn-numerator" />
      <hr className="eq-btn-fraction-divider" />
      <span className="eq-btn-denominator" />
    </div>
  );
}

function SqrtIcon() {
  return (
    <span className="eq-btn-sqrt">
      <span className="eq-btn-sqrt-tail-1"></span>
      <span className="eq-btn-sqrt-tail-2"></span>
      <span className="eq-btn-sqrt-main">
        <span className="eq-btn-sqrt-arg"></span>
      </span>
    </span>
  );
}

function VectorIcon() {
  return (
    <span className="eq-btn-vector">
      <span className="eq-btn-vector-decoration">⇀</span>
      <span className="eq-btn-vector-arg"></span>
    </span>
  );
}
