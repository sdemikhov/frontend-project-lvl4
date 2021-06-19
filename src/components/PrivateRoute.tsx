import React from 'react';
import {
  Route,
  Redirect,
} from 'react-router-dom';

import routes from '../routes';
import { useAuth } from '../auth';

type PrivateRouteProps = {
  readonly children: React.ReactNode,
  readonly path: string,
  readonly exact: true,
}

const PrivateRoute = ({ children, path, exact }: PrivateRouteProps): JSX.Element => {
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
