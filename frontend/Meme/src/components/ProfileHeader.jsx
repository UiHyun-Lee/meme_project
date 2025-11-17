// ProfileHeader.jsx
import React, { useState } from "react";
import { logout } from "../utils/login";

export default function ProfileHeader() {
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  const picture = localStorage.getItem("userPicture");

  const [open, setOpen] = useState(false);

  if (!isLoggedIn) return null;

  return (
    <div style={{
      position: "relative",
      display: "inline-block",
      marginRight: "20px"
    }}>
      <img
        src={picture}
        alt="profile"
        onClick={() => setOpen(!open)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          cursor: "pointer",
          border: "2px solid white"
        }}
      />

      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "50px",
          width: "200px",
          background: "white",
          color: "black",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
            {name}
          </div>
          <div style={{ marginBottom: "15px", fontSize: "14px", color: "#555" }}>
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
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
