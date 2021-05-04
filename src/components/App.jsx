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
import NavigationToolbar from './NavigationToolbar.jsx';
import { ProvideAuth } from '../use-auth.jsx';
import PageNotFound from './PageNotFound.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Chat from './Chat.jsx';

const App = () => (
  <ProvideAuth>
    <Router>
      <Container fluid className="d-flex flex-column vh-100">
        <Row className="bg-primary">
          <Col>
            <NavigationToolbar />
          </Col>
        </Row>
        <Row className="flex-grow-1">
          <Switch>
            <PrivateRoute exact path={routes.mainPagePath()}>
              <Chat />
            </PrivateRoute>
            <Route path={routes.loginFormPath()}>
              <Col className="d-flex justify-content-center pt-5">
                <LoginForm />
              </Col>
            </Route>
            <Route>
              <PageNotFound />
            </Route>
          </Switch>
        </Row>
      </Container>
    </Router>
  </ProvideAuth>
);

export default App;
