import React from "react";
import ProfileHeader from "./ProfileHeader";

export default function Header() {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <header
      style={{
        padding: "0.5rem 0.7rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1f1f1f",
        color: "white",
        borderBottom: "1px solid #333",
        borderRadius: "6px",
      }}
    >
      {/* LEFT SIDE */}
      <div
        className="header-title"
        style={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          lineHeight: "1.4rem",
          margin: 0,
          padding: 0,
          marginLeft: "1rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        Meme Battle
      </div>

      {/* RIGHT SIDE */}
      <div>
        {!isLoggedIn ? (
          <button
            className="header-title"
            onClick={() => window.dispatchEvent(new Event("openGoogleLogin"))}
            style={{
              padding: "0.5rem 1rem",
              background: "#4f46e5",
              color: "white",
              borderRadius: "0.4rem",
              border: "none",
              cursor: "pointer",
              fontSize: "0.9rem",
              margin: 0,
            }}
          >
            Login
          </button>
        ) : (
          <ProfileHeader />
        )}
      </div>
    </header>
  );
}
