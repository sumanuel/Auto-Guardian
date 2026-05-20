import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  forgotPasswordRequest,
  loginRequest,
  meRequest,
  registerRequest,
  resetPasswordRequest,
} from "../services/authService";
import { reconcileLocalAndRemoteData } from "../services/cloudSyncService";

const STORAGE_KEYS = {
  token: "@auth_token",
  user: "@auth_user",
  sessionMeta: "@auth_session_meta",
};

const SESSION_VERSION = 1;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.token,
      STORAGE_KEYS.user,
      STORAGE_KEYS.sessionMeta,
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback(async (nextToken, nextUser) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.token, nextToken],
      [STORAGE_KEYS.user, JSON.stringify(nextUser)],
      [
        STORAGE_KEYS.sessionMeta,
        JSON.stringify({
          version: SESSION_VERSION,
          persistedAt: new Date().toISOString(),
        }),
      ],
    ]);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const result = await loginRequest(email, password);
      await persistSession(result.token, result.user);
      setIsSyncing(true);
      try {
        await reconcileLocalAndRemoteData(result.token);
      } finally {
        setIsSyncing(false);
      }
      return result.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (name, email, password) => {
      const result = await registerRequest(name, email, password);
      await persistSession(result.token, result.user);
      setIsSyncing(true);
      try {
        await reconcileLocalAndRemoteData(result.token);
      } finally {
        setIsSyncing(false);
      }
      return result.user;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const requestPasswordReset = useCallback(
    (email) => forgotPasswordRequest(email),
    [],
  );

  const resetPassword = useCallback(
    (resetToken, password) => resetPasswordRequest(resetToken, password),
    [],
  );

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.token);
        const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);
        const savedSessionMeta = await AsyncStorage.getItem(
          STORAGE_KEYS.sessionMeta,
        );

        if (!savedToken) {
          setIsLoaded(true);
          return;
        }

        const sessionMeta = savedSessionMeta
          ? JSON.parse(savedSessionMeta)
          : null;

        if (!sessionMeta || sessionMeta.version !== SESSION_VERSION) {
          await clearSession();
          setIsLoaded(true);
          return;
        }

        const profile = await meRequest(savedToken);
        const nextUser = profile?.user || JSON.parse(savedUser || "null");
        setToken(savedToken);
        setUser(nextUser);

        setIsSyncing(true);
        try {
          await reconcileLocalAndRemoteData(savedToken);
        } finally {
          setIsSyncing(false);
        }
      } catch (_error) {
        await clearSession();
      } finally {
        setIsLoaded(true);
      }
    };

    restoreSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoaded,
      isAuthenticated: Boolean(user && token),
      isSyncing,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
    }),
    [
      user,
      token,
      isLoaded,
      isSyncing,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
