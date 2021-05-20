import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import Modal from 'react-bootstrap/Modal';

import { useSocket } from '../socket.jsx';
import { closeModal } from '../slices/modal-slice.js';
import СhannelForm from './ChannelForm.jsx';
import ChannelRemoveDialog from './ChannelRemoveDialog.jsx';

const getChannelIdForModal = createSelector(
  ({ modal }) => modal.extra,
  (extra) => {
    if (extra) {
      return extra.channelId;
    }

    return null;
  },
);

const getChannelNameForModal = createSelector(
  getChannelIdForModal,
  ({ channels }) => channels.entities,
  (id, entities) => {
    if (id) {
      return entities[id].name;
    }

    return '';
  },
);

const ChannelModalBody = ({ type, onCloseModal }) => {
  const { t } = useTranslation();
  const socket = useSocket();

  const channelId = useSelector(getChannelIdForModal);
  const channelName = useSelector(getChannelNameForModal);

  const handleRenameChannel = (id) => (newName, cb) => {
    socket.emit('renameChannel', { id, name: newName }, (response) => {
      if (response.status === 'ok') {
        cb();
        onCloseModal();
      } else {
        throw new Error(t('errors.network.unknown'));
      }
    });
  };

  const addChannel = (name, cb) => {
    socket.emit('newChannel', { name }, (response) => {
      if (response.status === 'ok') {
        cb();
        onCloseModal();
      } else {
        throw new Error(t('errors.network.unknown'));
      }
    });
  };

  switch (type) {
    case 'removeChannel':
      return (
        <ChannelRemoveDialog
          channelId={channelId}
          onCancel={onCloseModal}
          onCloseModal={onCloseModal}
        />
      );
    case 'newChannel':
      return (
        <СhannelForm
          testid="new-channel"
          onSuccess={addChannel}
          onCancel={onCloseModal}
        />
      );
    case 'renameChannel':
      return (
        <СhannelForm
          testid="rename-channel"
          initalName={channelName}
          onSuccess={handleRenameChannel(channelId)}
          onCancel={onCloseModal}
        />
      );
    default:
      return null;
  }
};

const ChannelModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isOpened, type } = useSelector(({ modal }) => modal);

  const onCloseModal = () => {
    dispatch(closeModal());
  };

  const title = type ? t(`modal.titles.${type}`) : null;

  return (
    <Modal show={isOpened} onHide={onCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ChannelModalBody type={type} onCloseModal={onCloseModal} />
      </Modal.Body>
    </Modal>
  );
};

export default ChannelModal;
