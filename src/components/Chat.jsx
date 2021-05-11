import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import cn from 'classnames';
import { Formik } from 'formik';
import { createSelector } from 'reselect';

import { setCurrentChannelId } from '../slices/channels-slice.js';
import validationSchemas from '../validators.js';
import { useSocket } from '../use-socket.jsx';
import { useAuth } from '../use-auth.jsx';
import { getChatData } from '../slices/chat-data-slice.js';

const СhannelInteractionForm = ({
  currentName = '',
  action,
  onCancel,
  testid,
}) => {
  const { t } = useTranslation();

  return (
    <Formik
      initialValues={{ channelName: currentName }}
      validationSchema={validationSchemas.СhannelInteractionFormSchema}
      onSubmit={async ({ channelName }) => {
        action(channelName);
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
          <Form.Group>
            <Form.Control
              type="text"
              name="channelName"
              value={values.channelName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              data-testid={testid}
              autoFocus
            />
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

const Channels = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSocket();
  const channels = useSelector((state) => state.channels);
  const { currentChannelId } = channels;

  const [modalState, setModalState] = useState({ show: false });

  const onCloseModal = () => setModalState({ ...modalState, show: false });

  const handleSetCurrentChannel = (id) => () => {
    dispatch(setCurrentChannelId(id));
  };

  const handleShowModalForChannelRename = (id, name) => (e) => {
    e.preventDefault();

    const cb = (newName) => {
      socket.emit('renameChannel', { id, name: newName }, (response) => {
        if (response.status === 'ok') {
          onCloseModal();
        } else {
          setModalState(
            {
              ...modalState,
              body: (<p className="text-danger">{t('errors.network.unknown')}</p>),
            },
          );
        }
      });
    };

    const newModalBodyDOM = (
      <СhannelInteractionForm
        currentName={name}
        action={cb}
        onCancel={onCloseModal}
        testid="rename-channel"
      />
    );

    const newModalState = {
      show: true,
      title: t('modal.titles.renameChannel'),
      body: newModalBodyDOM,
    };

    setModalState(newModalState);
  };

  const handleShowModalForChannelRemove = (id) => (e) => {
    e.preventDefault();

    const onRemoveChannel = () => {
      socket.emit('removeChannel', { id }, (response) => {
        if (response.status === 'ok') {
          onCloseModal();
        } else {
          setModalState(
            {
              ...modalState,
              body: (<p className="text-danger">{t('errors.network.unknown')}</p>),
            },
          );
        }
      });
    };

    const newModalBodyDOM = (
      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={onCloseModal}>{t('modal.cancelButton')}</Button>
        <Button variant="primary" onClick={onRemoveChannel}>{t('modal.removeButton')}</Button>
      </div>
    );

    const newModalState = {
      show: true,
      title: t('modal.titles.removeChannel'),
      body: newModalBodyDOM,
    };

    setModalState(newModalState);
  };

  const handleShowModalForChannelAdd = () => {
    const cb = (channelName) => {
      socket.emit('newChannel', { name: channelName }, (response) => {
        if (response.status === 'ok') {
          onCloseModal();
        } else {
          setModalState(
            {
              ...modalState,
              body: (<p className="text-danger">{t('errors.network.unknown')}</p>),
            },
          );
        }
      });
    };

    const newModalBodyDOM = (
      <СhannelInteractionForm
        action={cb}
        onCancel={onCloseModal}
        testid="new-channel"
      />
    );

    const newModalState = {
      show: true,
      title: t('modal.titles.newChannel'),
      body: newModalBodyDOM,
    };

    setModalState(newModalState);
  };

  return (
    <>
      <Nav className="flex-column">
        <div className="d-flex justify-content-between align-items-baseline">
          <span className="text-secondary">Каналы:</span>
          <Button onClick={handleShowModalForChannelAdd} variant="dark" size="sm">{t('channelsNav.addButton')}</Button>
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
                    <Dropdown.Item onClick={handleShowModalForChannelRename(id, channel.name)}>{t('channelsNav.dropdownRename')}</Dropdown.Item>
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
      <Modal show={modalState.show} onHide={onCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalState.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalState.body}
        </Modal.Body>
      </Modal>
    </>
  );
};

const getCurrentChannelId = ({ channels }) => channels.currentChannelId;

const getMessagesInCurrentChannel = createSelector(
  (state) => state.messages,
  getCurrentChannelId,
  ({ ids, entities }, currentChannelId) => {
    const messagesInCurrentChannel = ids.reduce((acc, id) => {
      const message = entities[id];

      if (message.channelId === currentChannelId) {
        return [...acc, message];
      }

      return acc;
    }, []);

    return messagesInCurrentChannel;
  },
);

const Messages = () => {
  const messages = useSelector(getMessagesInCurrentChannel);

  return (
    <>
      {messages.map(({ id, body, sender }) => (
        <div key={id} className="text-break">
          <b>{sender}</b>
          {`: ${body}`}
        </div>
      ))}
    </>
  );
};

const SendMessageForm = () => {
  const { t } = useTranslation();
  const socket = useSocket();
  const inputRef = useRef(null);
  const currentChannelId = useSelector(getCurrentChannelId);
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

        socket.emit('newMessage', message, (response) => {
          console.log(response.status); // ok
        });

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

const Chat = () => {
  const { t } = useTranslation();
  const loading = useSelector(({ chatData }) => chatData.loading);
  const dispatch = useDispatch();
  const { user: { token } } = useAuth();

  if (loading === 'idle') {
    dispatch(getChatData(token));
  }

  const renderStatus = (loadingStatus) => {
    switch (loadingStatus) {
      case 'pending':
        return (
          <>
            <Spinner animation="border" role="status" />
            <span>{t('chat.loading')}</span>
          </>
        );
      case 'rejected':
        return <p className="text-danger">{t('errors.network.unknown')}</p>;
      default:
        return null;
    }
  };

  return (
    <>
      <Col className="bg-dark border-top border-right border-secondary" md="3" xl="2">
        <Channels />
      </Col>
      <Col className="h-100" as="main" xl="10" md="9" xs="12">
        <div className="d-flex flex-column h-100">
          <div className="overflow-hidden">
            <Messages />
          </div>
          <div className="mt-auto">
            {renderStatus()}
            <SendMessageForm />
          </div>
        </div>
      </Col>
    </>
  );
};

export default Chat;
