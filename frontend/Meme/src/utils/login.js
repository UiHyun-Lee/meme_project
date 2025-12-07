export async function ensureLogin() {
  return new Promise((resolve) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      resolve(true); // login.
      return;
    }

    window.dispatchEvent(new Event("openGoogleLogin"));
    resolve(false);
  });
}

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};