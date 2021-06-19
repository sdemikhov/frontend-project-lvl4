import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import { useAuth, Auth } from '../auth';
import Channels from './Channels.jsx';
import Messages from './Messages.jsx';
import SendMessageForm from './SendMessageForm.jsx';
import routes from '../routes';
import { setInitialState } from '../slices/channels-slice.js';

const Chat = (): JSX.Element => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const auth: Auth = useAuth();
  const sendMessageInputRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState('idle');
  const [error, setError] = useState({ key: '' });

  useEffect(() => {
    let didMount = true; // eslint-disable-line

    const getChatData = async (token: string | null): Promise<void> => {
      try {
        setLoading('pending');
        const response = await axios.get(routes.chatDataPath(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(setInitialState(response.data));
        if (didMount) {
          setLoading('fulfilled');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            auth.signout();
          } else {
            setError({ key: 'errors.network.common' });
          }
        } else {
          setError({ key: 'errors.unknown' });
        }

        setLoading('rejected');
      }
    };

    if (sendMessageInputRef.current?.focus) {
      sendMessageInputRef.current.focus();
    }

    if (loading === 'idle') {
      getChatData(auth.user.token);
    }

    return () => {
      didMount = false;
    };
  }, [dispatch]); // eslint-disable-line

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
