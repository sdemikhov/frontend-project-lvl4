// @ts-check

import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import routes from '../routes.js';
import LoginForm from './LoginForm.jsx';

const App = () => (
  <Router>
    <Switch>
      <Route exact path={routes.mainPagePath()}>
        <h2>Under construction!</h2>
      </Route>
      <Route path={routes.loginFormPath()}>
        <LoginForm />
      </Route>
      <Route>
        <h2>Page not found</h2>
      </Route>
    </Switch>
  </Router>
);

export default App;
