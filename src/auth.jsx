import 'regenerator-runtime/runtime.js';
import React, {
  createContext,
  useState,
  useContext,
} from 'react';

const tokenKey = 'token';
const usernameKey = 'username';

const authContext = createContext();

export const useAuth = () => useContext(authContext);

const useProvideAuth = () => {
  const savedToken = localStorage.getItem(tokenKey);
  const savedUsername = localStorage.getItem(usernameKey);

  const [user, setUser] = useState({ username: savedUsername, token: savedToken });

  const signin = ({ username, token }) => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(usernameKey, username);

    setUser({ username, token });
  };

  const signout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(usernameKey);

    setUser(false);
  };

  const isAuthorized = () => !!user.username && !!user.token;

  return {
    user,
    signin,
    signout,
    isAuthorized,
  };
};

export const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth();

  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
};
