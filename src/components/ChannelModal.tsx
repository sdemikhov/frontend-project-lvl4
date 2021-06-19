import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Modal from 'react-bootstrap/Modal';

import { closeModal } from '../slices/modal-slice.js';
import AddСhannelForm from './AddChannelForm';
import RenameСhannelForm from './RenameChannelForm.jsx';
import RemoveChannelDialog from './RemoveChannelDialog.jsx';

export type OnCloseModal = () => void
type ChannelModalBodyProps = {
  readonly type: string | null,
  readonly onCloseModal: OnCloseModal,
}

const ChannelModalBody = ({ type, onCloseModal }: ChannelModalBodyProps): JSX.Element | null => {
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

type ChannelModalState = { readonly modalInfo: {
    readonly isOpened: boolean,
    readonly type: string | null,
  }
};

const ChannelModal = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isOpened, type } = useSelector(
    ({ modalInfo }: ChannelModalState) => modalInfo,
  );

  const onCloseModal: OnCloseModal = () => {
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
