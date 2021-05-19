import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { Formik } from 'formik';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { useSocket } from '../socket.jsx';
import validationSchemas from '../validation-schemas.js';
import { closeModal } from '../slices/modal-slice.js';

const getChannelIdForModal = createSelector(
  ({ modal }) => modal.extra,
  (extra) => {
    if (extra) {
      return extra.channelId;
    }

    return null;
  },
);

const getChannelNameForModal = createSelector(
  getChannelIdForModal,
  ({ channels }) => channels.entities,
  (id, entities) => {
    if (id) {
      return entities[id].name;
    }

    return '';
  },
);

const СhannelInteractionForm = ({ initalName = '', testid, action }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const onCancel = () => {
    dispatch(closeModal());
  };

  useEffect(() => {
    inputRef.current.focus();
  });

  return (
    <Formik
      initialValues={{ channelName: initalName }}
      validationSchema={validationSchemas.ChannelIteractionFormSchema}
      onSubmit={({ channelName }, { setSubmitting }) => {
        action(channelName, () => setSubmitting(false));
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

const ChannelRemoveDialog = ({ channelId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSocket();

  const onCloseModal = () => {
    dispatch(closeModal());
  };

  const handleRemoveChannel = (id) => () => {
    socket.emit('removeChannel', { id }, (response) => {
      if (response.status === 'ok') {
        onCloseModal();
      } else {
        throw new Error(t('errors.network.unknown'));
      }
    });
  };

  return (
    <div className="d-flex justify-content-between">
      <Button variant="secondary" onClick={onCloseModal}>{t('modal.cancelButton')}</Button>
      <Button variant="primary" onClick={handleRemoveChannel(channelId)}>{t('modal.removeButton')}</Button>
    </div>
  );
};

const ChannelModalBody = ({ type }) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const dispatch = useDispatch();

  const channelId = useSelector(getChannelIdForModal);
  const channelName = useSelector(getChannelNameForModal);

  const onCloseModal = () => {
    dispatch(closeModal());
  };

  const handleRenameChannel = (id) => (newName, cb) => {
    socket.emit('renameChannel', { id, name: newName }, (response) => {
      if (response.status === 'ok') {
        cb();
        onCloseModal();
      } else {
        throw new Error(t('errors.network.unknown'));
      }
    });
  };

  const addChannel = (name, cb) => {
    socket.emit('newChannel', { name }, (response) => {
      if (response.status === 'ok') {
        cb();
        onCloseModal();
      } else {
        throw new Error(t('errors.network.unknown'));
      }
    });
  };

  switch (type) {
    case 'removeChannel':
      return <ChannelRemoveDialog channelId={channelId} />;
    case 'newChannel':
      return <СhannelInteractionForm testid="new-channel" action={addChannel} />;
    case 'renameChannel':
      return (
        <СhannelInteractionForm
          testid="rename-channel"
          initalName={channelName}
          action={handleRenameChannel(channelId)}
        />
      );
    default:
      return null;
  }
};

const ChannelModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isOpened, type } = useSelector(({ modal }) => modal);

  const onHide = () => {
    dispatch(closeModal());
  };

  const title = type ? t(`modal.titles.${type}`) : null;

  return (
    <Modal show={isOpened} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ChannelModalBody type={type} />
      </Modal.Body>
    </Modal>
  );
};

export default ChannelModal;
