import React from 'react';
import {
  Route,
  Redirect,
} from 'react-router-dom';

import routes from '../routes.ts';
import { useAuth } from '../auth.jsx';

const PrivateRoute = ({ children, path, exact }) => {
  const auth = useAuth();

  return (
    <Route
      exact={exact}
      path={path}
      render={({ location }) => (
        auth.isAuthorized() ? (
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
