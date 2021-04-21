// @ts-check

import React from 'react';
import {
  Formik,
} from 'formik';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import validationSchemas from '../validators.js';

const LoginForm = () => {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={validationSchemas.LoginFormSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        console.log(values);
        setSubmitting(false);
      }}
    >
      {/**
       * @param {any} errors
       */
      ({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        errors,
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
              />
              <Form.Control.Feedback type="invalid">
                {errors.password && t(errors.password.key)}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Button type="submit">{t('loginForm.submit')}</Button>
          </Form.Row>
        </Form>
      )
      }
    </Formik>
  );
};

export default LoginForm;
