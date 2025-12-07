import React from "react";
import ProfileHeader from "./ProfileHeader";

export default function Header() {
  const isLoggedIn = !!localStorage.getItem("accessToken");

  return (
    <header
      style={{
        padding: "12px 20px",
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
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>Meme Battle</div>

      {/* RIGHT SIDE */}
      <div>
        {!isLoggedIn ? (
          <button
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
