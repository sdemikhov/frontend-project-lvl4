// @ts-check

import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

import routes from '../routes.js';
import LoginForm from './LoginForm.jsx';

const App = () => (
  <>
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href={routes.mainPagePath()}>Hexlet-Chat</Navbar.Brand>
    </Navbar>
    <Container>
      <Router>
        <Switch>
          <Route exact path={routes.mainPagePath()}>
            <h2>Under construction!</h2>
          </Route>
          <Route path={routes.loginFormPath()}>
            <div className="d-flex justify-content-center pt-5">
              <LoginForm />
            </div>
          </Route>
          <Route>
            <h2>Page not found</h2>
          </Route>
        </Switch>
      </Router>
    </Container>
  </>
);

export default App;
