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

type CredentialContextValue = {
  credentials: Credentials;
  isSet: boolean;
  save: (accessKey: string, secret: string) => void;
  clear: () => void;
};

const KEY = 'atlar_guide_creds';

const CredentialContext = createContext<CredentialContextValue>({
  credentials: null,
  isSet: false,
  save: () => {},
  clear: () => {},
});

export function useCredentials() {
  return useContext(CredentialContext);
}

export function CredentialProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setCredentials(JSON.parse(raw));
    } catch {
      /* empty or corrupt — ignore */
    }
  }, []);

  const save = useCallback((accessKey: string, secret: string) => {
    const creds = { accessKey, secret };
    setCredentials(creds);
    sessionStorage.setItem(KEY, JSON.stringify(creds));
  }, []);

  const clear = useCallback(() => {
    setCredentials(null);
    sessionStorage.removeItem(KEY);
  }, []);

  return (
    <CredentialContext.Provider
      value={{ credentials, isSet: !!credentials, save, clear }}
    >
      {children}
    </CredentialContext.Provider>
  );
}
