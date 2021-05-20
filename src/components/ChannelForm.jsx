import React, { useRef, useEffect } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import validationSchemas from '../validation-schemas.js';

const СhannelForm = ({
  initalName = '',
  testid,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  });

  return (
    <Formik
      initialValues={{ channelName: initalName }}
      validationSchema={validationSchemas.ChannelIteractionFormSchema}
      onSubmit={({ channelName }, { setSubmitting }) => {
        onSuccess(channelName, () => setSubmitting(false));
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        isSubmitting,
        errors,
        touched,
      }) => (
        <Form
          noValidate
          onSubmit={handleSubmit}
          className="pb-2 pt-2"
          autoComplete="off"
        >
          <Form.Group>
            <Form.Control
              type="text"
              name="channelName"
              value={values.channelName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              data-testid={testid}
              ref={inputRef}
              isInvalid={touched.channelName && !!errors.channelName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.channelName && t(errors.channelName.key)}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="d-flex justify-content-between">
            <Button
              variant="secondary"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              {t('channelInteractionForm.cancelButton')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {t('channelInteractionForm.sendButton')}
            </Button>
          </Form.Group>
        </Form>
      )}
    </Formik>
  );
};

export default СhannelForm;
