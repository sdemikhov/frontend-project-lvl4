// @ts-check

import React from 'react';
import {
  Formik,
  Field,
  Form,
  ErrorMessage,
} from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={Yup.object({
        username: Yup.string().required(),
        password: Yup.string().required(),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        console.log(values);
        setSubmitting(false);
      }}
    >
      <Form>
        <div className="form-group">
          <label htmlFor="username">{t('loginForm.username')}</label>
          <Field type="text" className="form-control" name="username" />
          <ErrorMessage name="username" />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('loginForm.password')}</label>
          <Field type="password" className="form-control" name="password" />
          <ErrorMessage name="password" />
        </div>
        <button type="submit" className="btn btn-primary">{t('loginForm.submit')}</button>
      </Form>
    </Formik>
  );
};

export default LoginForm;
