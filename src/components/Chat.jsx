import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import { useAuth } from '../auth.jsx';
import Channels from './Channels.jsx';
import Messages from './Messages.jsx';
import SendMessageForm from './SendMessageForm.jsx';
import routes from '../routes.js';
import { setInitialState } from '../slices/channels-slice.js';

const Chat = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const auth = useAuth();
  const sendMessageInputRef = useRef(null);
  const [loading, setLoading] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    const getChatData = async (token) => {
      try {
        setLoading('pending');
        const response = await axios.get(routes.chatDataPath(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLoading('fulfilled');
        dispatch(setInitialState(response.data));
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response.status === 401) {
            auth.signout();
          } else {
            setError({ key: 'errors.network.common' });
          }
        } else {
          setError({ key: 'errors.unknown' });
        }

        setLoading({ key: 'rejected' });
      }
    };

    if (sendMessageInputRef.current) {
      sendMessageInputRef.current.focus();
    }

    if (loading === 'idle') {
      getChatData(auth.user.token);
    }
  }, [auth, dispatch, loading]);

  if (loading === 'fulfilled') {
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
  }

  if (loading === 'rejected') {
    return (
      <Col>
        <span className="text-danger">{t(error.key)}</span>
      </Col>
    );
  }

  return (
    <Col>
      <Spinner className="mr-2" animation="border" role="status" />
      <span>{t('chat.loading')}</span>
    </Col>
  );
};

export default Chat;
