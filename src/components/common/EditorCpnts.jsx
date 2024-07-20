import {
  Button,
  CircularProgress,
  SvgIcon,
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
    <ToggleButtonGroup disabled={disabled || Boolean(file)} size="small">
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

export function BtnGroupTeX({ disabled, insertTeX }) {
  return (
    <ToggleButtonGroup disabled={disabled} size="small">
      <ToggleButton className="editor-btn" onClick={insertTeX} value="TeX">
        <SvgIcon>
          <svg
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 272.44 271.28"
            strokeWidth={10}
            stroke="currentColor"
          >
            <rect fill="none" stroke="none" width="271.28" height="271.28" />
            <path
              d="M340.15,358.2q2,17.67,3.91,35.33l-3.5-.14c-.05-2.56-.61-22.1-11.55-27.46-4-1.94-10.95-2.81-13.66-3.14a87.49,87.49,0,0,0-10.79-.54c-4.72-.07-11.11-.11-18.79,0a4.24,4.24,0,0,0-3.32,1.61,3.86,3.86,0,0,0-.72,2.34l.18,43.06,21.44-.23c2.48-.57,6.77-2,8.62-5.66.92-1.79,1.06-3.85,1.35-8,.17-2.29.17-4.2.14-5.52l3.1-.14q-.07,21.24-.14,42.47l-3.1.27v-3.77c.15-.78,1.2-6.67-2.83-11.19a12.39,12.39,0,0,0-5.93-3.64L282,413.48v47.28a2.88,2.88,0,0,0,2.33,3.42c13.86.12,25.09,0,33.17,0A25.63,25.63,0,0,0,331,461.11a21.28,21.28,0,0,0,4.88-3.94c4.8-5.13,6.43-12.8,7.15-16.18a45.87,45.87,0,0,0,.94-7.55l-8.9-.14.41-4a23,23,0,0,0,13.61-3.37,18.56,18.56,0,0,0,5.13-4.86l29.39-43.68-32.63-46.11A12.3,12.3,0,0,0,347,328a12,12,0,0,0-3.19-1.13l-6.65.32-.81-4.58H372v4.18a4.91,4.91,0,0,0-6.87,6.47l24.13,35.19,20.5-28.86c3.19-2.56,4.08-6.75,2.42-9.7s-5.42-3.47-5.79-3.51c.13-1.17.27-2.34.4-3.5H436c0,1.34.09,2.69.13,4a22.7,22.7,0,0,0-13.21,3,21.62,21.62,0,0,0-7.14,7.41c-4.66,7.43-12.76,18.81-24,34.11l36,53.53a9.62,9.62,0,0,0,3.77,3.37c1.85.91,3.66,1,7.28,1.08,1.42.05,2.59,0,3.37,0,0,1.26.09,2.52.14,3.78h-34l-.27-4.86c2.61.85,5.18-.17,6.07-2a4.46,4.46,0,0,0-.14-3.64l-28.31-41L359,420.09a6.22,6.22,0,0,0-.54,4.18c.65,2.59,3.24,4.58,6.47,4.85v4.05H347.3q-2.43,17.65-4.85,35.32l-84.54.14v-4.18a33.51,33.51,0,0,0,6.87-.14c2.88-.35,3.68-.74,4.21-1.15,1.87-1.47,2.05-4.11,2.13-5.05,3.87-47.4,1.75-61.38,0-89.53a6.45,6.45,0,0,0-1.89-4.58c-1.48-1.38-3.42-1.52-6.74-1.75a29.55,29.55,0,0,0-4.45,0c0-1.31-.09-2.61-.13-3.91l7.95-.54a51,51,0,0,0-1.21-14.43c-.92-4-1.57-6.81-3.64-9.44-4.58-5.81-12.64-6.29-15.37-6.34l-16-.27a5,5,0,0,0-4.31,7.15v89A6.86,6.86,0,0,0,228,428a5.91,5.91,0,0,0,3.51.81,91.9,91.9,0,0,1,12.14.81v3.51H197l-.27-3.24,11.06-.54c.58.07,3.51.34,5.39-1.62a7,7,0,0,0,1.62-3.77,12.07,12.07,0,0,0,0-4.85l-.54-84.68a4.79,4.79,0,0,0-5.66-7.28,91.72,91.72,0,0,0-18.47.81c-3.6.54-6.68,1.24-9.31,3.64a15.29,15.29,0,0,0-3.5,5.12c-1.48,3.14-1.66,5.5-2.29,10.65-.31,2.46-.79,6.17-1.49,10.79l-3,.81L173,322.88h94.12L269,358.47Z"
              transform="translate(-169.91 -244.34)"
            />
          </svg>
        </SvgIcon>
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

export function RemoveTeXFieldBtn({ caption, onClick }) {
  return (
    <TemplateBtn caption={caption} onClick={onClick}>
      DELETE
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
