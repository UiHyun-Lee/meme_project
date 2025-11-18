import React from "react";

export default function CookieBanner({ onAccept, onReject }) {
  return (
    <div style={outer}>
      <div style={inner}>
        <p style={text}>
          We use cookies to enable essential site functionality, provide secure
          Google login for uploading memes, and analyze usage to improve our
          platform. For details, please see the{" "}
          <a
            href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
            target="_blank"
            rel="noopener noreferrer"
            style={link}
          >
            Privacy Policy
          </a>
          .
        </p>

        <div style={buttonsRow}>
          <button style={acceptBtn} onClick={onAccept}>
            Accept all
          </button>
          <button style={rejectBtn} onClick={onReject}>
            Only necessary
          </button>
        </div>
      </div>
    </div>
  );
}

const outer = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  padding: "8px",
};

const inner = {
  width: "100%",
  maxWidth: "900px",
  background: "#02244a", // 진한 파란색
  color: "white",
  borderRadius: "18px 18px 0 0",
  padding: "16px 18px 12px",
  boxShadow: "0 -4px 12px rgba(0,0,0,0.35)",
  boxSizing: "border-box",
};

const text = {
  fontSize: "14px",
  lineHeight: 1.5,
  textAlign: "center",
  margin: "0 0 16px",
};

const link = {
  color: "#ffd54f",
  textDecoration: "underline",
};

const buttonsRow = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
};

const baseBtn = {
  flex: 1,
  maxWidth: "150px",
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  fontWeight: 600,
  fontSize: "14px",
  cursor: "pointer",
};

const acceptBtn = {
  ...baseBtn,
  background: "#1976d2",
  color: "white",
};

const rejectBtn = {
  ...baseBtn,
  background: "#0d47a1",
  color: "white",
};
