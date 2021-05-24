import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from 'react-bootstrap/Button';

import { useSocket } from '../socket.jsx';

const ChannelRemoveDialog = ({ channelId, onCancel, onCloseModal }) => {
  const { t } = useTranslation();
  const socket = useSocket();

  const handleRemoveChannel = (id) => () => {
    socket.emit('removeChannel', { id }, (response) => {
      if (response.status === 'ok') {
        onCloseModal();
      } else {
        throw new Error(t('errors.network.common'));
      }
    });
  };

  return (
    <div className="d-flex justify-content-between">
      <Button variant="secondary" onClick={onCancel}>{t('modal.cancelButton')}</Button>
      <Button variant="primary" onClick={handleRemoveChannel(channelId)}>{t('modal.removeButton')}</Button>
    </div>
  );
};

export default ChannelRemoveDialog;
