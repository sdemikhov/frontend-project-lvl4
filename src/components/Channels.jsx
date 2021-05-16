import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { Formik } from 'formik';
import cn from 'classnames';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { useSocket } from '../socket.jsx';
import validationSchemas from '../validation-schemas.js';
import { setCurrentChannelId } from '../slices/channels-slice.js';
import { openModal, closeModal } from '../slices/modal-slice.js';

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

const Channels = (props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.channels);
  const { currentChannelId } = channels;

  const handleSetCurrentChannel = (id) => () => {
    dispatch(setCurrentChannelId(id));
    ref.current.focus();
  };

  const handleShowModalForChannelRename = (id) => (e) => {
    e.preventDefault();
    dispatch(openModal({ isOpened: true, type: 'renameChannel', extra: { channelId: id } }));
  };

  const handleShowModalForChannelRemove = (id) => (e) => {
    e.preventDefault();
    dispatch(openModal({ isOpened: true, type: 'removeChannel', extra: { channelId: id } }));
  };

  const onShowModalForChannelAdd = (e) => {
    e.preventDefault();
    dispatch(openModal({ isOpened: true, type: 'newChannel', extra: null }));
  };

  return (
    <>
      <Nav className="flex-column">
        <div className="d-flex justify-content-between align-items-baseline">
          <span className="text-secondary">Каналы:</span>
          <Button onClick={onShowModalForChannelAdd} variant="dark" size="sm">{t('channelsNav.addButton')}</Button>
        </div>
        {React.Children.map(channels.ids, (id) => {
          const channelClass = cn({
            'text-light': id === currentChannelId,
            'font-weight-bold': id === currentChannelId,
            'text-secondary': id !== currentChannelId,
          });
          const channel = channels.entities[id];
          const dropdowntestId = `dropdown-channelId-${channel.id}`;
          const dropdownId = `channel-${channel.name}-context`;

          return (
            <Nav.Item key={id}>
              {channel.removable ? (
                <Dropdown as={ButtonGroup}>
                  <Button variant="dark" className={channelClass} onClick={handleSetCurrentChannel(id)}>{channel.name}</Button>

                  <Dropdown.Toggle split variant="dark" id={dropdownId} data-testid={dropdowntestId} />

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleShowModalForChannelRename(id)}>{t('channelsNav.dropdownRename')}</Dropdown.Item>
                    <Dropdown.Item onClick={handleShowModalForChannelRemove(id)}>{t('channelsNav.dropdownRemove')}</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button variant="dark" className={channelClass} onClick={handleSetCurrentChannel(id)}>{channel.name}</Button>
              )}
            </Nav.Item>
          );
        })}
      </Nav>
      <ChannelModal />
    </>
  );
};

export default React.forwardRef(Channels);
