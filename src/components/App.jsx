import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import routes from '../routes.js';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';
import NavigationToolbar from './NavigationToolbar.jsx';
import PageNotFound from './PageNotFound.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Chat from './Chat.jsx';

const App = () => (
  <Router>
    <Container fluid className="d-flex flex-column vh-100">
      <Row className="bg-primary">
        <Col>
          <NavigationToolbar />
        </Col>
      </Row>
      <Row className="flex-grow-1 h-50">
        <Switch>
          <PrivateRoute exact path={routes.mainPagePath()}>
            <Chat />
          </PrivateRoute>
          <Route path={routes.loginFormPath()}>
            <Col className="d-flex justify-content-center pt-5">
              <LoginForm />
            </Col>
          </Route>
          <Route path={routes.registerFormPath()}>
            <Col className="d-flex justify-content-center pt-5">
              <RegisterForm />
            </Col>
          </Route>
          <Route>
            <PageNotFound />
          </Route>
        </Switch>
      </Row>
    </Container>
  </Router>
);

export default App;
