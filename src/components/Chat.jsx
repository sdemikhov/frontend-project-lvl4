import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { chatDataSlice, getChatData } from '../chat-data-slice';

const Chat = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const chatData = useSelector((state) => state.chatData);
  const channels = useSelector((state) => state.channels);

  if (chatData.loading === 'idle') {
    dispatch(getChatData());
  }
  if (chatData.loading === 'fulfilled') {
    console.log(channels);
    return <h2>channels</h2>;
  }
  if (chatData.loading === 'rejected') {
    console.log(chatData.error);
    return <h2>Error</h2>;
  }

  return <h2>Loading</h2>;
};

export default Chat;
