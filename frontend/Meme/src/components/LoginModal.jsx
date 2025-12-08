import React from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from '../api'

// JWT decode
function decodeJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export default function LoginModal({ onClose, onSuccess }) {
  const handleGoogleSuccess = async (res) => {
    try {
      // server aut
      const response = await googleLogin(res.credential)

      // token decode
      const userInfo = decodeJwt(res.credential);

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("userEmail", userInfo.email);
      localStorage.setItem("userName", userInfo.name);

      window.dispatchEvent(new Event("googleLoginSuccess"));

      onSuccess();
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google Login failed");
    }
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <h3>Login Required</h3>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google Login Error")}
        />

        <button onClick={onClose} style={closeBtn}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#212121",
  padding: "20px",
  borderRadius: "8px",
  width: "300px",
  textAlign: "center",
};

const closeBtn = {
  marginTop: "15px",
  padding: "8px 16px",
  background: "orange",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
