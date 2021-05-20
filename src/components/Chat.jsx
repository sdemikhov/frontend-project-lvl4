import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';

import { useAuth } from '../auth.jsx';
import { getChatData, setLoading } from '../slices/chat-data-slice.js';
import Channels from './Channels.jsx';
import Messages from './Messages.jsx';
import SendMessageForm from './SendMessageForm.jsx';

const Chat = () => {
  const loading = useSelector(({ chatData }) => chatData.loading);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const auth = useAuth();
  const sendMessageInputRef = useRef(null);

  useEffect(() => {
    if (sendMessageInputRef.current) {
      sendMessageInputRef.current.focus();
    }

    if (loading === 'rejected' && auth.user.token) {
      auth.signout();
      dispatch(setLoading('idle'));
    }
  });

  if (loading === 'idle') {
    dispatch(getChatData(auth.user.token));
    return (
      <Col>
        <Spinner className="mr-2" animation="border" role="status" />
        <span>{t('chat.loading')}</span>
      </Col>
    );
  }

  return (
    <>
      <Col className="bg-dark border-top border-right border-secondary" md="3" xl="2">
        <Channels ref={sendMessageInputRef} />
      </Col>
      <Col className="h-100" as="main" xl="10" md="9" xs="12">
        <div className="d-flex flex-column h-100">
          <Messages />
          <div className="mt-auto">
            <SendMessageForm ref={sendMessageInputRef} />
          </div>
        </div>
      </Col>
    </>
  );
};

export default Chat;
