import 'regenerator-runtime/runtime.js';
import React, {
  createContext,
  useState,
  useContext,
} from 'react';

const tokenKey = 'token';

const authContext = createContext();

export const useAuth = () => useContext(authContext);

const useProvideAuth = () => {
  const savedToken = localStorage.getItem(tokenKey);

  const [token, setToken] = useState(savedToken);

  const signin = (newToken) => {
    localStorage.setItem(tokenKey, newToken);
    setToken(newToken);
  };

  const signout = () => {
    localStorage.removeItem(tokenKey);
    setToken(false);
  };

  return {
    token,
    signin,
    signout,
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
