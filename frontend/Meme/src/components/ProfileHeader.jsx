// ProfileHeader.jsx
import React, { useState } from "react";
import { logout } from "../utils/login";

export default function ProfileHeader() {
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");

  const [open, setOpen] = useState(false);

  if (!isLoggedIn) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>

      {/* --- only name--- */}
      <span
        onClick={() => setOpen(!open)}
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          color: "white",
          padding: "6px 10px",
          borderRadius: "6px",
          background: "rgba(255,255,255,0.1)"
        }}
      >
        Hi, {name} !
      </span>

      {/* --- Dropdown 메뉴 --- */}
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "45px",
            width: "220px",
            background: "#1f1f1f",
            color: "white",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 999
          }}
        >
          <div style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "16px" }}>
            {name}
          </div>
          <div style={{ marginBottom: "15px", fontSize: "14px", color: "gray" }}>
            {email}
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "8px",
              background: "#e53935",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        </div>
      )}

    </div>
  );
}
