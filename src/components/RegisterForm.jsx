import React from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import validationSchemas from '../validation-schemas.js';
import routes from '../routes.ts';
import { useAuth } from '../auth.tsx';

const RegisterForm = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const auth = useAuth();

  return auth.isAuthorized() ? (
    <h1>{t('registerForm.alreadyLoggedIn')}</h1>
  ) : (
    <Formik
      initialValues={{ username: '', password: '', passwordConfirmation: '' }}
      validationSchema={validationSchemas.RegistrationFormSchema}
      onSubmit={async (values, actions) => {
        actions.setStatus(null);
        const { username, password } = values;

        try {
          const response = await axios.post(routes.registerPath(), { username, password });

          auth.signin(response.data);
          history.replace(routes.mainPagePath());
        } catch (err) {
          if (axios.isAxiosError(err)) {
            if (err.response.status === 409) {
              actions.setStatus({ key: 'errors.network.userAlreadyExist' });
            } else {
              actions.setStatus({ key: 'errors.network.common' });
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
          <Form.Group controlId="validationUsername">
            <Form.Label>{t('registerForm.username')}</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder={t('registerForm.usernamePlaceholder')}
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.username && !!errors.username}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username && t(errors.username.key, errors.username.values)}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="validationPassword">
            <Form.Label>{t('registerForm.password')}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder={t('registerForm.passwordPlaceholder')}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.password && !!errors.password}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password && t(errors.password.key, errors.password.values)}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="validationPasswordConfirmation">
            <Form.Label>{t('registerForm.passwordConfirmation')}</Form.Label>
            <Form.Control
              type="password"
              name="passwordConfirmation"
              placeholder={t('registerForm.passwordConfirmationPlaceholder')}
              value={values.passwordConfirmation}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.passwordConfirmation && !!errors.passwordConfirmation}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.passwordConfirmation
                && t(errors.passwordConfirmation.key, errors.passwordConfirmation.values)}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            {status && <Alert variant="danger">{t(status.key)}</Alert>}
          </Form.Group>
          <Button type="submit" disabled={isSubmitting}>{t('registerForm.submit')}</Button>
        </Form>
      )
      }
    </Formik>
  );
};

export default RegisterForm;
