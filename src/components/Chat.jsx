import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import cn from 'classnames';
import { Formik } from 'formik';
import { createSelector } from 'reselect';

import { setCurrentChannelId } from '../slices/channels-slice.js';
import validationSchemas from '../validators.js';
import { useSocket } from '../use-socket.jsx';
import { useAuth } from '../use-auth.jsx';
import { getChatData } from '../slices/chat-data-slice.js';

const Channels = () => {
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.channels);

  const { currentChannelId } = channels;

  const handleClick = (id) => (e) => {
    e.preventDefault();
    dispatch(setCurrentChannelId(id));
  };

  return (
    <Nav className="flex-column">
      {React.Children.map(channels.ids, (id) => {
        const channelClass = cn({
          'text-light': id === currentChannelId,
          'font-weight-bold': id === currentChannelId,
          'text-secondary': id !== currentChannelId,
        });
        const channel = channels.entities[id];

        return (
          <Nav.Item key={id}>
            <Nav.Link className={channelClass} onClick={handleClick(id)}>
              {channel.name}
            </Nav.Link>
          </Nav.Item>
        );
      })}
    </Nav>
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
