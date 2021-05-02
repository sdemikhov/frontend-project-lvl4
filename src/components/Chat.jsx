import React from 'react';
import { useTranslation } from 'react-i18next';

const Chat = () => {
  const { t } = useTranslation();

  console.log('Chat render!!!');
  return <h2>{t('chat.info')}</h2>;
};

export default Chat;
