import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useSocket } from '../use-socket.jsx';
import { useAuth } from '../use-auth.jsx';
import validationSchemas from '../validators.js';

const SendMessageForm = () => {
  const { t } = useTranslation();
  const socket = useSocket();
  const inputRef = useRef(null);
  const currentChannelId = useSelector(({ channels }) => channels.currentChannelId);
  const { user: { username } } = useAuth();

  return (
    <Formik
      initialValues={{ message: '' }}
      validationSchema={validationSchemas.MessageFormSchema}
      onSubmit={async (values, actions) => {
        const message = {
          channelId: currentChannelId,
          body: values.message,
          sender: username,
        };

        socket.emit('newMessage', message, () => {});

        actions.resetForm();
        inputRef.current.focus();
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        isSubmitting,
      }) => (
        <Form
          noValidate
          onSubmit={handleSubmit}
          className="pb-2 pt-2"
          autoComplete="off"
        >
          <Form.Row>
            <Col>
              <Form.Control
                ref={inputRef}
                type="text"
                name="message"
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                autoFocus
                data-testid="new-message"
              />
            </Col>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
            >
              {t('sendMessageForm.sendButton')}
            </Button>
          </Form.Row>
        </Form>
      )}
    </Formik>
  );
};

export default SendMessageForm;
