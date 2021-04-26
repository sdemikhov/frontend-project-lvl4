import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import routes from '../routes.js';
import LoginForm from './LoginForm.jsx';
import NavigationToolbar from './NavigationToolbar.jsx';
import { ProvideAuth } from '../use-auth.jsx';
import PageNotFound from './PageNotFound.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Chat from './Chat.jsx';

const App = () => (
  <ProvideAuth>
    <Router>
      <NavigationToolbar />
      <Container>
        <Switch>
          <PrivateRoute exact path={routes.mainPagePath()}>
            <Chat />
          </PrivateRoute>
          <Route path={routes.loginFormPath()}>
            <div className="d-flex justify-content-center pt-5">
              <LoginForm />
            </div>
          </Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Container>
    </Router>
  </ProvideAuth>
);

export default App;
