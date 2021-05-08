import React from 'react';
import {
  Route,
  Redirect,
} from 'react-router-dom';

import routes from '../routes.js';
import { useAuth } from '../use-auth.jsx';

const PrivateRoute = ({ children, path, exact }) => {
  const auth = useAuth();

  return (
    <Route
      exact={exact}
      path={path}
      render={({ location }) => (
        auth.user.token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: routes.loginFormPath(),
              state: { from: location },
            }}
          />
        ))}
    />
  );
};

export default PrivateRoute;
