import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';

import { useAuth } from '../use-auth.jsx';
import { getChatData } from '../slices/chat-data-slice.js';
import Channels from './Channels.jsx';
import Messages from './Messages.jsx';
import SendMessageForm from './SendMessageForm.jsx';

const Status = ({ value }) => {
  const { t } = useTranslation();

  switch (value) {
    case 'pending':
      return (
        <>
          <Spinner className="mr-2" animation="border" role="status" />
          <span>{t('chat.loading')}</span>
        </>
      );
    case 'rejected':
      return <p className="text-danger">{t('errors.network.unknown')}</p>;
    default:
      return null;
  }
};

const Chat = () => {
  const loading = useSelector(({ chatData }) => chatData.loading);
  const dispatch = useDispatch();
  const { user: { token } } = useAuth();
  const sendMessageInputRef = useRef(null);

  useEffect(() => {
    sendMessageInputRef.current.focus();

    if (loading === 'idle') {
      dispatch(getChatData(token));
    }
  });

  return (
    <>
      <Col className="bg-dark border-top border-right border-secondary" md="3" xl="2">
        <Channels ref={sendMessageInputRef} />
      </Col>
      <Col className="h-100" as="main" xl="10" md="9" xs="12">
        <div className="d-flex flex-column h-100">
          <Messages />
          <div className="mt-auto">
            <Status value={loading} />
            <SendMessageForm ref={sendMessageInputRef} />
          </div>
        </div>
      </Col>
    </>
  );
};

export default Chat;
