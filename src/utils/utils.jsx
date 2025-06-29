import React from "react";

const renderTextWithLineBreaks = (text) => {
  if (!text && text !== 0) return null;
  const parts = String(text).split(/<br\s*\/?>|\n/);
  return parts.map((part, idx) => (
    <React.Fragment key={idx}>
      {part}
      {idx < parts.length - 1 && <br />}
    </React.Fragment>
  ));
};

export default renderTextWithLineBreaks;
