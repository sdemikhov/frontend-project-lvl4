import React, { useRef, useEffect } from 'react';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import validationSchemas from '../validation-schemas.js';
import { useSocket } from '../socket.jsx';
import { getChannelIdForModal, getChannelNameForModal } from '../slices/modal-slice.js';

const RenameChannelForm = ({
  onCloseModal,
}) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const inputRef = useRef(null);
  const id = useSelector(getChannelIdForModal);
  const initialName = useSelector(getChannelNameForModal);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <Formik
      initialValues={{ channelName: initialName }}
      validationSchema={validationSchemas.ChannelIteractionFormSchema}
      onSubmit={({ channelName }, { setSubmitting, setStatus }) => {
        socket.emit('renameChannel', { id, name: channelName }, (response) => {
          if (response.status === 'ok') {
            setSubmitting(false);
            onCloseModal();
          } else {
            setStatus({ key: 'errors.network.common' });
          }
        });
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
        status,
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
              data-testid="rename-channel"
              ref={inputRef}
              isInvalid={touched.channelName && !!errors.channelName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.channelName && t(errors.channelName.key)}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            {status && <span className="text-danger">{t(status.key)}</span>}
          </Form.Group>
          <Form.Group className="d-flex justify-content-between">
            <Button
              variant="secondary"
              disabled={isSubmitting}
              onClick={onCloseModal}
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

export default RenameChannelForm;
