import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import {
  setCurrentChannelId,
  selectById,
  selectIds,
} from '../slices/channels-slice.js';
import { openModal } from '../slices/modal-slice.js';
import ChannelModal from './ChannelModal.jsx';

const Channel = React.forwardRef(
  ({ id }, ref) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const onSetCurrentChannel = () => {
      dispatch(setCurrentChannelId(id));
      ref.current.focus();
    };

    const onShowModalForChannelRename = (e) => {
      e.preventDefault();
      dispatch(openModal({ isOpened: true, type: 'renameChannel', extra: { channelId: id } }));
    };

    const onShowModalForChannelRemove = (e) => {
      e.preventDefault();
      dispatch(openModal({ isOpened: true, type: 'removeChannel', extra: { channelId: id } }));
    };

    const currentChannelId = useSelector((state) => state.channels.currentChannelId);
    const channel = useSelector((state) => selectById(state, id));

    const channelClass = cn({
      'text-light': id === currentChannelId,
      'font-weight-bold': id === currentChannelId,
      'text-secondary': id !== currentChannelId,
    });
    const dropdowntestId = `dropdown-channelId-${channel.id}`;
    const dropdownId = `channel-${channel.name}-context`;

    return (
      <Nav.Item>
        {channel.removable ? (
          <Dropdown as={ButtonGroup}>
            <Button variant="dark" className={channelClass} onClick={onSetCurrentChannel}>{channel.name}</Button>

            <Dropdown.Toggle split variant="dark" id={dropdownId} data-testid={dropdowntestId} />

            <Dropdown.Menu>
              <Dropdown.Item onClick={onShowModalForChannelRename}>{t('channelsNav.dropdownRename')}</Dropdown.Item>
              <Dropdown.Item onClick={onShowModalForChannelRemove}>{t('channelsNav.dropdownRemove')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Button variant="dark" className={channelClass} onClick={onSetCurrentChannel}>{channel.name}</Button>
        )}
      </Nav.Item>
    );
  },
);

const Channels = (props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channelsIds = useSelector(selectIds);

  const onShowModalForChannelAdd = (e) => {
    e.preventDefault();
    dispatch(openModal({ isOpened: true, type: 'newChannel', extra: null }));
  };

  return (
    <>
      <Nav className="flex-column">
        <div className="d-flex justify-content-between align-items-baseline">
          <span className="text-secondary">Каналы:</span>
          <Button onClick={onShowModalForChannelAdd} variant="dark" size="sm">{t('channelsNav.addButton')}</Button>
        </div>
        {React.Children.map(channelsIds, (id) => <Channel key={id} id={id} ref={ref} />)}
      </Nav>
      <ChannelModal />
    </>
  );
};

export default React.forwardRef(Channels);
