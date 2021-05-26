import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'react-bootstrap/Modal';

import { closeModal } from '../slices/modal-slice.js';
import AddСhannelForm from './AddChannelForm.jsx';
import RenameСhannelForm from './RenameChannelForm.jsx';
import RemoveChannelDialog from './RemoveChannelDialog.jsx';

const ChannelModalBody = ({ type, onCloseModal }) => {
  switch (type) {
    case 'removeChannel':
      return (
        <RemoveChannelDialog
          onCloseModal={onCloseModal}
        />
      );
    case 'newChannel':
      return (
        <AddСhannelForm
          onCloseModal={onCloseModal}
        />
      );
    case 'renameChannel':
      return (
        <RenameСhannelForm
          onCloseModal={onCloseModal}
        />
      );
    default:
      return null;
  }
};

const ChannelModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isOpened, type } = useSelector(({ modalInfo }) => modalInfo);

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
