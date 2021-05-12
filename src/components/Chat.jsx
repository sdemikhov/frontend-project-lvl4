import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';

import { useAuth } from '../use-auth.jsx';
import { getChatData } from '../slices/chat-data-slice.js';
import Channels from './Channels.jsx';
import Messages from './Messages.jsx';
import SendMessageForm from './SendMessageForm.jsx';

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
