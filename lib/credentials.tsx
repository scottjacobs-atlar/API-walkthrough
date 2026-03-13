'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type Credentials = { accessKey: string; secret: string } | null;
type Token = { accessToken: string; expiresAt: number } | null;

type CredentialContextValue = {
  credentials: Credentials;
  isSet: boolean;
  save: (accessKey: string, secret: string) => void;
  clear: () => void;
  token: Token;
  saveToken: (accessToken: string, expiresIn: number) => void;
  clearToken: () => void;
  refreshToken: () => Promise<void>;
  guideIds: Record<string, string>;
  saveGuideId: (key: string, value: string) => void;
  clearGuideIds: () => void;
};

const CREDS_KEY = 'atlar_guide_creds';
const TOKEN_KEY = 'atlar_guide_token';
const IDS_KEY = 'atlar_guide_ids';

const CredentialContext = createContext<CredentialContextValue>({
  credentials: null,
  isSet: false,
  save: () => {},
  clear: () => {},
  token: null,
  saveToken: () => {},
  clearToken: () => {},
  refreshToken: async () => {},
  guideIds: {},
  saveGuideId: () => {},
  clearGuideIds: () => {},
});

export function useCredentials() {
  return useContext(CredentialContext);
}

export function CredentialProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials>(null);
  const [token, setToken] = useState<Token>(null);
  const [guideIds, setGuideIds] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CREDS_KEY);
      if (raw) setCredentials(JSON.parse(raw));
    } catch { /* ignore */ }

    try {
      const raw = sessionStorage.getItem(TOKEN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt > Date.now()) {
          setToken(parsed);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch { /* ignore */ }

    try {
      const raw = sessionStorage.getItem(IDS_KEY);
      if (raw) setGuideIds(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((accessKey: string, secret: string) => {
    const creds = { accessKey, secret };
    setCredentials(creds);
    sessionStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  }, []);

  const clear = useCallback(() => {
    setCredentials(null);
    setToken(null);
    sessionStorage.removeItem(CREDS_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  const saveToken = useCallback((accessToken: string, expiresIn: number) => {
    const t = { accessToken, expiresAt: Date.now() + expiresIn * 1000 };
    setToken(t);
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t));
  }, []);

  const clearToken = useCallback(() => {
    setToken(null);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  const saveGuideId = useCallback((key: string, value: string) => {
    setGuideIds((prev) => {
      const next = { ...prev, [key]: value };
      sessionStorage.setItem(IDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearGuideIds = useCallback(() => {
    setGuideIds({});
    sessionStorage.removeItem(IDS_KEY);
  }, []);

  const refreshToken = useCallback(async () => {
    if (!credentials) return;

    const resp = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-atlar-access-key': credentials.accessKey,
        'x-atlar-secret': credentials.secret,
      },
      body: JSON.stringify({
        method: 'POST',
        path: '/iam/v2beta/oauth2/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        formBody: 'grant_type=client_credentials',
      }),
    });

    const data = await resp.json();
    if (data.status >= 200 && data.status < 300 && data.body?.access_token) {
      saveToken(data.body.access_token, data.body.expires_in ?? 300);
    }
  }, [credentials, saveToken]);

  return (
    <CredentialContext.Provider
      value={{ credentials, isSet: !!credentials, save, clear, token, saveToken, clearToken, refreshToken, guideIds, saveGuideId, clearGuideIds }}
    >
      {children}
    </CredentialContext.Provider>
  );
}
