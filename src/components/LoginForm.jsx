import React from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';

import validationSchemas from '../validators.js';
import routes from '../routes.js';
import { useAuth } from '../use-auth.jsx';

const LoginForm = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const auth = useAuth();

  const { from } = location.state || { from: { pathname: routes.mainPagePath() } };
  return auth.user.token ? (
    <h1>{t('loginForm.alreadyLoggedIn')}</h1>
  ) : (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={validationSchemas.LoginFormSchema}
      onSubmit={async (values, actions) => {
        actions.setStatus(null);
        const { username, password } = values;

        try {
          const response = await axios.post(routes.loginPath(), { username, password });

          auth.signin(response.data);
          history.replace(from);
        } catch (err) {
          if (axios.isAxiosError(err)) {
            if (err.response.status === 401) {
              actions.setStatus({ key: 'errors.network.unauthorized' });
            } else {
              actions.setStatus({ key: 'errors.network.unknown' });
            }
          } else {
            actions.setStatus({ key: 'errors.unknown' });
          }
        }
      }}
    >
      {
      ({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        errors,
        isSubmitting,
        status,
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group controlId="validationUsername">
              <Form.Label>{t('loginForm.username')}</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.username && !!errors.username}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username && t(errors.username.key)}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group controlId="validationPassword">
              <Form.Label>{t('loginForm.password')}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.password && !!errors.password}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password && t(errors.password.key)}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            {status && <Alert variant="danger">{t(status.key)}</Alert>}
          </Form.Row>
          <Form.Row>
            <Button type="submit" disabled={isSubmitting}>{t('loginForm.submit')}</Button>
          </Form.Row>
        </Form>
      )
      }
    </Formik>
  );
};

export default LoginForm;
