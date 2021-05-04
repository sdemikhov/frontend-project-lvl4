import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import cn from 'classnames';
import { Formik } from 'formik';

import { getChatData } from '../slices/chat-data-slice.js';
import { setCurrentChannelId } from '../slices/channels-slice.js';
import validationSchemas from '../validators.js';

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

const SendMessageForm = () => {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  return (
    <Formik
      initialValues={{ message: '' }}
      validationSchema={validationSchemas.MessageFormSchema}
      onSubmit={async (values, actions) => {
        console.log(values);
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
  const dispatch = useDispatch();

  const chatData = useSelector((state) => state.chatData);

  if (chatData.loading === 'idle') {
    dispatch(getChatData());
  }
  if (chatData.loading === 'fulfilled') {
    return (
      <>
        <Col className="bg-dark border-top border-right border-secondary" md="3" xl="2">
          <Channels />
        </Col>
        <Col className="d-flex flex-column" as="main" xl="10" md="9" xs="12">
          <Row className="flex-grow-1 bg-light">
            <Col>
              <p>messages</p>
            </Col>
          </Row>
          <Row className="bg-light">
            <Col>
              <SendMessageForm />
            </Col>
          </Row>
        </Col>
      </>
    );
  }
  if (chatData.loading === 'rejected') {
    return <Alert variant="danger">{t('errors.network.unknown')}</Alert>;
  }

  return (
    <Col>
      <Spinner animation="border" role="status" />
      <span>{t('chat.loading')}</span>
    </Col>
  );
};

export default Chat;
