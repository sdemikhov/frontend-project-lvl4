import 'regenerator-runtime/runtime.js';
import React, {
  createContext,
  useState,
} from 'react';

const tokenKey = 'token';
const usernameKey = 'username';

type ProvProps = {
  readonly children: React.ReactNode,
}

type UserData = { readonly username: string, readonly token: string }
type SignIn = (a: UserData) => void;
type SignOut = () => void;
type IsAuthorized = () => boolean;

type Auth = {
  readonly user: {
    readonly username: string | null,
    readonly token: string | null,
  },
  readonly signin: SignIn,
  readonly signout: SignOut,
  readonly isAuthorized: IsAuthorized,
}

const createCtx = <A extends Record<string, unknown> | null>():
    readonly [() => A, React.Provider<A | undefined>] => {
  const ctx = createContext<A | undefined>(undefined);

  const useCtx = (): A => {
    const c = React.useContext(ctx);
    if (c === undefined) {
      throw new Error('useCtx must be inside a Provider with a value');
    }
    return c;
  };

  return [useCtx, ctx.Provider] as const;
};

export const [useAuth, AuthProvider] = createCtx<Auth>();

const useProvideAuth = (): Auth => {
  const savedToken = localStorage.getItem(tokenKey);
  const savedUsername = localStorage.getItem(usernameKey);

  const [user, setUser] = useState({ username: savedUsername, token: savedToken });

  const signin: SignIn = ({ username, token }) => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(usernameKey, username);

    setUser({ username, token });
  };

  const signout: SignOut = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(usernameKey);

    setUser({ username: null, token: null });
  };

  const isAuthorized: IsAuthorized = () => !!user.username && !!user.token;

  return {
    user,
    signin,
    signout,
    isAuthorized,
  };
};

export const ProvideAuth = ({ children }: ProvProps): JSX.Element => {
  const auth = useProvideAuth();

  return (
    <AuthProvider value={auth}>
      {children}
    </AuthProvider>
  );
};
