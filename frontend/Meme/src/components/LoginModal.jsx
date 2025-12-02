// import React from "react";
// import axios from "axios";
// import { GoogleLogin } from "@react-oauth/google";
// // import jwt_decode from "jwt-decode";
//
// export default function LoginModal({ onClose, onSuccess }) {
//   const handleGoogleSuccess = async (res) => {
//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/auth/google/",
//         { id_token: res.credential }
//       );
//
// //       const userInfo = jwt_decode(res.credential);
//
//       // Save tokens
//       localStorage.setItem("accessToken", response.data.access);
//       localStorage.setItem("refreshToken", response.data.refresh);
//       localStorage.setItem("userEmail", response.data.email);
// //       localStorage.setItem("userEmail", userInfo.email);
// //       localStorage.setItem("userName", userInfo.name);
// //       localStorage.setItem("userPicture", userInfo.picture);
//
//       onSuccess();
//     }catch (err) {
//   console.error("Google login error:", {
//     message: err.message,
//     status: err.response?.status,
//     data: err.response?.data,
//     full: err,
//   });
//   alert("Google Login failed");
// }
//   };
//
//   return (
//     <div style={backdrop}>
//       <div style={modal}>
//         <h3 style={{ marginBottom: "15px" }}>Login Required</h3>
//
//         <GoogleLogin
//           onSuccess={handleGoogleSuccess}
//           onError={() => alert("Google Login Error")}
//         />
//
//         <button onClick={onClose} style={closeBtn}>Cancel</button>
//       </div>
//     </div>
//   );
// }
//
// // styles
// const backdrop = {
//   position: "fixed",
//   inset: 0,
//   backgroundColor: "rgba(0,0,0,0.5)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 9999,
// };
//
// const modal = {
//   background: "#212121",
//   padding: "20px",
//   borderRadius: "8px",
//   width: "300px",
//   textAlign: "center",
// };
//
// const closeBtn = {
//   marginTop: "15px",
//   padding: "8px 16px",
//   background: "orange",
//   border: "none",
//   borderRadius: "6px",
//   cursor: "pointer",
// };


import React from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from '../api'

// JWT decode 직접 구현
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
      // 1) 서버 인증
      const response = await googleLogin(res.credential)

      // 2) 토큰 디코드 (jwt-decode 없이)
      const userInfo = decodeJwt(res.credential);

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("userEmail", userInfo.email);
      localStorage.setItem("userName", userInfo.name);

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

// 🔥 style은 반드시 컴포넌트 아래에 정의해야 함
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
