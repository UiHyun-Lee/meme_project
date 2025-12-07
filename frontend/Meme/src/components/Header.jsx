import React from "react";
import ProfileHeader from "./ProfileHeader";

export default function Header() {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <header
      style={{
        padding: "8px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1f1f1f",
        color: "white",
        borderBottom: "1px solid #333",
        borderRadius: "6px"
      }}
    >
      {/* LEFT SIDE */}
      <div
        className="header-title"
        style={{ fontSize: "20px", fontWeight: "bold" }}
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
              padding: "8px 16px",
              background: "#4f46e5",
              color: "white",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
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