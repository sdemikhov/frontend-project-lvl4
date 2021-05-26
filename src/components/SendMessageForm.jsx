import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { useSocket } from '../socket.jsx';
import { useAuth } from '../auth.jsx';
import validationSchemas from '../validation-schemas.js';
import { selectCurrentChannelId } from '../slices/channels-slice.js';

const SendMessageForm = (props, ref) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const currentChannelId = useSelector(selectCurrentChannelId);
  const { user: { username } } = useAuth();

  return (
    <Formik
      initialValues={{ message: '' }}
      validationSchema={validationSchemas.MessageFormSchema}
      onSubmit={(values, actions) => {
        const message = {
          channelId: currentChannelId,
          body: values.message,
          sender: username,
        };

        socket.emit('newMessage', message, () => {
          actions.setSubmitting(false);
        });

        actions.resetForm();
        ref.current.focus();
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
                ref={ref}
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

export default React.forwardRef(SendMessageForm);
