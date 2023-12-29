import parse from "html-react-parser";
import TeX from "@matejmazur/react-katex";

export function fullParse(str) {
  if (typeof str !== "string") {
    return "parsing error - not a string";
  }

  return parse(str, {
    replace: (domNode) => {
      if (domNode.name === "inlinetex") {
        return <TeX>{String.raw`${domNode.children[0].data}`}</TeX>;
      } else if (domNode.name === "blocktex") {
        return <TeX block>{String.raw`${domNode.children[0].data}`}</TeX>;
      } else {
        return "";
      }
    },
  });
}
