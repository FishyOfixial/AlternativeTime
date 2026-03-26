import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  loginRequest,
  refreshRequest
} from "../services/auth";
import {
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens
} from "../services/tokenStorage";

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = window.atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getRefreshDelay(accessToken) {
  const payload = decodeJwtPayload(accessToken);
  if (!payload?.exp) {
    return null;
  }

  const expiresAt = payload.exp * 1000;
  const now = Date.now();
  const buffer = 60 * 1000;
  const delay = expiresAt - now - buffer;

  return Math.max(delay, 5_000);
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    status: "booting",
    user: null,
    accessToken: null,
    refreshToken: null,
    error: null
  });
  const refreshTimeoutRef = useRef(null);

  function clearRefreshTimer() {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }

  async function refreshSession(nextRefreshToken) {
    const refreshToken = nextRefreshToken ?? authState.refreshToken;

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const refreshData = await refreshRequest(refreshToken);
    const nextAccessToken = refreshData.access;
    const nextTokens = {
      accessToken: nextAccessToken,
      refreshToken
    };
    const user = await getCurrentUser(nextAccessToken);

    setStoredTokens(nextTokens);
    setAuthState({
      status: "authenticated",
      user,
      accessToken: nextAccessToken,
      refreshToken,
      error: null
    });

    return {
      user,
      accessToken: nextAccessToken,
      refreshToken
    };
  }

  function scheduleRefresh(accessToken, refreshToken) {
    clearRefreshTimer();

    const delay = getRefreshDelay(accessToken);
    if (!delay || !refreshToken) {
      return;
    }

    refreshTimeoutRef.current = window.setTimeout(async () => {
      try {
        await refreshSession(refreshToken);
      } catch {
        logout();
      }
    }, delay);
  }

  async function login(credentials) {
    const tokenData = await loginRequest(credentials);
    const tokens = {
      accessToken: tokenData.access,
      refreshToken: tokenData.refresh
    };
    const user = await getCurrentUser(tokens.accessToken);

    setStoredTokens(tokens);
    setAuthState({
      status: "authenticated",
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      error: null
    });
  }

  function logout() {
    clearRefreshTimer();
    clearStoredTokens();
    setAuthState({
      status: "guest",
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null
    });
  }

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      const { accessToken, refreshToken } = getStoredTokens();

      if (!accessToken || !refreshToken) {
        if (active) {
          setAuthState({
            status: "guest",
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null
          });
        }
        return;
      }

      try {
        const user = await getCurrentUser(accessToken);

        if (!active) {
          return;
        }

        setAuthState({
          status: "authenticated",
          user,
          accessToken,
          refreshToken,
          error: null
        });
      } catch {
        try {
          const refreshed = await refreshSession(refreshToken);
          if (!active) {
            return;
          }

          setAuthState((current) => ({
            ...current,
            status: "authenticated",
            user: refreshed.user,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            error: null
          }));
        } catch {
          if (active) {
            logout();
          }
        }
      }
    }

    bootstrapSession();

    return () => {
      active = false;
      clearRefreshTimer();
    };
  }, []);

  useEffect(() => {
    if (authState.status === "authenticated") {
      scheduleRefresh(authState.accessToken, authState.refreshToken);
    } else {
      clearRefreshTimer();
    }
  }, [authState.accessToken, authState.refreshToken, authState.status]);

  const value = {
    ...authState,
    isAuthenticated: authState.status === "authenticated",
    isBooting: authState.status === "booting",
    login,
    logout,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
