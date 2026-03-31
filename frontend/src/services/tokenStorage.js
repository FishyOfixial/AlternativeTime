const ACCESS_TOKEN_KEY = "at.frontend.access";
const REFRESH_TOKEN_KEY = "at.frontend.refresh";
const SESSION_USER_KEY = "at.frontend.user";

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

export function getStoredSession() {
  if (!canUseStorage()) {
    return { accessToken: null, refreshToken: null, user: null };
  }

  const rawUser = window.localStorage.getItem(SESSION_USER_KEY);

  return {
    ...getStoredTokens(),
    user: rawUser ? JSON.parse(rawUser) : null
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

export function setStoredSession({ accessToken, refreshToken, user }) {
  setStoredTokens({ accessToken, refreshToken });

  if (!canUseStorage()) {
    return;
  }

  if (user) {
    window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  }
}

export function clearStoredTokens() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(SESSION_USER_KEY);
}
