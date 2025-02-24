// src/react.tsx
import * as React from "react";
import { useCallback, useContext, useEffect as useEffect2, useMemo, useState as useState3 } from "react";

// src/client.ts
import { AuthError } from "@auth/core/errors";
import { useEffect, useState } from "react";
var ClientFetchError = class extends AuthError {
};
var ClientSessionError = class extends AuthError {
};
async function fetchData(path, config, logger2, req = {}) {
  const url = `${config.baseUrl}${config.basePath}/${path}`;
  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        ...req?.headers?.cookie ? { cookie: req.headers.cookie } : {}
      },
      credentials: config.credentials
    };
    if (req?.body) {
      options.body = JSON.stringify(req.body);
      options.method = "POST";
    }
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    return data;
  } catch (error) {
    logger2.error(new ClientFetchError(error.message, error));
    return null;
  }
}
function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : false
  );
  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);
    window.addEventListener("online", setOnline, { signal });
    window.addEventListener("offline", setOffline, { signal });
    return () => {
      abortController.abort();
    };
  }, []);
  return isOnline;
}
function now() {
  return Math.floor(Date.now() / 1e3);
}
function parseUrl(url) {
  const defaultUrl = "http://localhost:3000/api/auth";
  const parsedUrl = new URL(url ? url.startsWith("http") ? url : `https://${url}` : defaultUrl);
  const path = parsedUrl.pathname === "/" ? "/api/auth" : parsedUrl.pathname.replace(/\/$/, "");
  const base = `${parsedUrl.origin}${path}`;
  return {
    origin: parsedUrl.origin,
    host: parsedUrl.host,
    path,
    base,
    toString: () => base
  };
}

// src/react.tsx
var logger = {
  debug: console.debug,
  error: console.error,
  warn: console.warn
};
var AuthConfigManager = class _AuthConfigManager {
  static instance = null;
  config;
  constructor() {
    this.config = this.createDefaultConfig();
  }
  createDefaultConfig() {
    return {
      baseUrl: typeof window !== "undefined" ? parseUrl(window.location.origin).origin : "",
      basePath: typeof window !== "undefined" ? parseUrl(window.location.origin).path : "/api/auth",
      credentials: "same-origin",
      lastSync: 0,
      session: null,
      fetchSession: async () => void 0
    };
  }
  static getInstance() {
    if (!_AuthConfigManager.instance) {
      _AuthConfigManager.instance = new _AuthConfigManager();
    }
    return _AuthConfigManager.instance;
  }
  setConfig(userConfig) {
    this.config = { ...this.config, ...userConfig };
  }
  getConfig() {
    return this.config;
  }
  initializeConfig(hasInitialSession) {
    this.config.lastSync = hasInitialSession ? now() : 0;
  }
};
var authConfigManager = AuthConfigManager.getInstance();
var SessionContext = React.createContext(void 0);
function useInitializeSession(hasInitialSession, initialSession) {
  const authConfig = authConfigManager.getConfig();
  const [session, setSession] = React.useState(initialSession);
  const [loading, setLoading] = React.useState(!hasInitialSession);
  useEffect2(() => {
    authConfig.fetchSession = async ({ event } = {}) => {
      try {
        const isStorageEvent = event === "storage";
        if (isStorageEvent || !authConfig.session) {
          authConfig.lastSync = now();
          authConfig.session = await getSession();
          setSession(authConfig.session);
          return;
        }
        if (!event || !authConfig.session || now() < authConfig.lastSync) {
          return;
        }
        authConfig.lastSync = now();
        authConfig.session = await getSession();
        setSession(authConfig.session);
      } catch (error) {
        logger.error(new ClientSessionError(error.message, error));
      } finally {
        setLoading(false);
      }
    };
    authConfig.fetchSession();
    return () => {
      authConfig.lastSync = 0;
      authConfig.session = null;
      authConfig.fetchSession = async () => void 0;
    };
  }, []);
  return { session, setSession, loading, setLoading };
}
function useVisibilityChangeEventListener(authConfig, refetchOnWindowFocus) {
  useEffect2(() => {
    const abortController = new AbortController();
    const handleVisibilityChange = () => {
      if (refetchOnWindowFocus && document.visibilityState === "visible") {
        authConfig.fetchSession({ event: "visibilitychange" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange, {
      signal: abortController.signal
    });
    return () => abortController.abort();
  }, [refetchOnWindowFocus]);
}
function useRefetchInterval(authConfig, refetchInterval, shouldRefetch) {
  useEffect2(() => {
    if (refetchInterval && shouldRefetch) {
      const intervalId = setInterval(() => {
        if (authConfig.session) {
          authConfig.fetchSession({ event: "poll" });
        }
      }, refetchInterval * 1e3);
      return () => clearInterval(intervalId);
    }
  }, [refetchInterval, shouldRefetch]);
}
async function getSession(params) {
  const { baseUrl, basePath, credentials } = authConfigManager.getConfig();
  const session = await fetchData(
    "session",
    {
      baseUrl,
      basePath,
      credentials
    },
    logger,
    params
  );
  return session;
}
async function getCsrfToken() {
  const { baseUrl, basePath, credentials } = authConfigManager.getConfig();
  const response = await fetchData(
    "csrf",
    {
      baseUrl,
      basePath,
      credentials
    },
    logger
  );
  return response?.csrfToken ?? "";
}
function SessionProvider(props) {
  if (!SessionContext) {
    throw new Error("React Context is unavailable in Server Components");
  }
  const { children, refetchInterval, refetchWhenOffline = true } = props;
  const authConfig = authConfigManager.getConfig();
  const hasInitialSession = !!props.session;
  authConfigManager.initializeConfig(hasInitialSession);
  const { session, setSession, loading, setLoading } = useInitializeSession(
    hasInitialSession,
    props.session ?? null
  );
  useVisibilityChangeEventListener(authConfig, props.refetchOnWindowFocus ?? true);
  const isOnline = useOnline();
  const shouldRefetch = refetchWhenOffline || isOnline;
  useRefetchInterval(authConfig, refetchInterval, shouldRefetch);
  const contextValue = useMemo(
    () => ({
      data: session,
      status: loading ? "loading" : session ? "authenticated" : "unauthenticated",
      update: async (data) => {
        if (loading || !session) {
          return;
        }
        setLoading(true);
        const updatedSession = await fetchData(
          "session",
          authConfig,
          logger,
          data ? { body: { csrfToken: await getCsrfToken(), data } } : void 0
        );
        setLoading(false);
        if (updatedSession) {
          setSession(updatedSession);
        }
        return updatedSession;
      }
    }),
    [session, loading, setSession]
  );
  return /* @__PURE__ */ React.createElement(SessionContext.Provider, { value: contextValue }, children);
}
function useSession(options) {
  if (!SessionContext) {
    throw new Error("React Context is unavailable in Server Components");
  }
  const config = authConfigManager.getConfig();
  const session = useContext(SessionContext);
  const { required, onUnauthenticated } = options ?? {};
  const requiredAndNotLoading = required && session?.status === "unauthenticated";
  useEffect2(() => {
    if (requiredAndNotLoading) {
      const url = `${config.baseUrl}${config.basePath}/signin?${new URLSearchParams({
        error: "SessionRequired",
        callbackUrl: window.location.href
      })}`;
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        window.location.href = url;
      }
    }
  }, [requiredAndNotLoading, onUnauthenticated]);
  if (requiredAndNotLoading) {
    return {
      data: session?.data,
      update: session?.update,
      status: "loading"
    };
  }
  return session;
}
async function getProviders() {
  return fetchData("providers", authConfigManager.getConfig(), logger);
}
async function signIn(provider, options = {}, authorizationParams = {}) {
  const { callbackUrl = window.location.href, redirect = true, ...opts } = options;
  const config = authConfigManager.getConfig();
  const href = `${config.baseUrl}${config.basePath}`;
  const providers = await getProviders();
  if (!providers) {
    window.location.href = `${href}/error`;
    return;
  }
  if (!provider || !(provider in providers)) {
    window.location.href = `${href}/signin?${new URLSearchParams({ callbackUrl })}`;
    return;
  }
  const isCredentials = providers[provider].type === "credentials";
  const isEmail = providers[provider].type === "email";
  const signInUrl = `${href}/${isCredentials ? "callback" : "signin"}/${provider}`;
  const csrfToken = await getCsrfToken();
  const res = await fetch(`${signInUrl}?${new URLSearchParams(authorizationParams)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1"
    },
    body: new URLSearchParams({ ...opts, csrfToken, callbackUrl }),
    credentials: config.credentials
  });
  const data = await res.json();
  if (redirect) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    if (url.includes("#")) {
      window.location.reload();
    }
    return;
  }
  const error = new URL(data.url).searchParams.get("error");
  if (res.ok) {
    await config.fetchSession?.({ event: "storage" });
  }
  return {
    error,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url
  };
}
async function signOut(options) {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {};
  const config = authConfigManager.getConfig();
  const csrfToken = await getCsrfToken();
  const res = await fetch(`${config.baseUrl}${config.basePath}/signout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1"
    },
    body: new URLSearchParams({ csrfToken, callbackUrl }),
    credentials: config.credentials
  });
  const data = await res.json();
  if (redirect) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    if (url.includes("#")) {
      window.location.reload();
    }
    return void 0;
  }
  await config.fetchSession?.({ event: "storage" });
  return data;
}
var createPopup = ({ url, title, height, width }) => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  const externalPopup = window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top}`
  );
  return externalPopup;
};
var useOauthPopupLogin = (provider, options = {}) => {
  const { width = 500, height = 500, title = "Signin", onSuccess, callbackUrl = "/" } = options;
  const [externalWindow, setExternalWindow] = useState3();
  const [state, setState] = useState3({ status: "loading" });
  const popUpSignin = useCallback(async () => {
    const res = await signIn(provider, {
      redirect: false,
      callbackUrl
    });
    if (res?.error) {
      setState({ status: "errored", error: res.error });
      return;
    }
    setExternalWindow(
      createPopup({
        url: res?.url,
        title,
        width,
        height
      })
    );
  }, []);
  useEffect2(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data.status) {
        setState(event.data);
        if (event.data.status === "success") {
          onSuccess?.();
        }
        externalWindow?.close();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      externalWindow?.close();
    };
  }, [externalWindow]);
  return { popUpSignin, ...state };
};
export {
  SessionContext,
  SessionProvider,
  authConfigManager,
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
  signOut,
  useOauthPopupLogin,
  useSession
};
