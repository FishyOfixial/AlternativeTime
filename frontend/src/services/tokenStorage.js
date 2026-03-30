const ACCESS_TOKEN_KEY = "at.frontend.access";
const REFRESH_TOKEN_KEY = "at.frontend.refresh";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredTokens() {
  if (!canUseStorage()) {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY)
  };
}

export function setStoredTokens({ accessToken, refreshToken }) {
  if (!canUseStorage()) {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredTokens() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
