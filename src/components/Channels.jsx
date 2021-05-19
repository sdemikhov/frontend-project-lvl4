import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { setCurrentChannelId } from '../slices/channels-slice.js';
import { openModal } from '../slices/modal-slice.js';
import ChannelModal from './ChannelModal.jsx';

const Channels = (props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.channels);
  const { currentChannelId } = channels;

  const handleSetCurrentChannel = (id) => () => {
    dispatch(setCurrentChannelId(id));
    ref.current.focus();
  };

  const handleShowModalForChannelRename = (id) => (e) => {
    e.preventDefault();
    dispatch(openModal({ isOpened: true, type: 'renameChannel', extra: { channelId: id } }));
  };

  const handleShowModalForChannelRemove = (id) => (e) => {
    e.preventDefault();
    dispatch(openModal({ isOpened: true, type: 'removeChannel', extra: { channelId: id } }));
  };

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
        {React.Children.map(channels.ids, (id) => {
          const channelClass = cn({
            'text-light': id === currentChannelId,
            'font-weight-bold': id === currentChannelId,
            'text-secondary': id !== currentChannelId,
          });
          const channel = channels.entities[id];
          const dropdowntestId = `dropdown-channelId-${channel.id}`;
          const dropdownId = `channel-${channel.name}-context`;

          return (
            <Nav.Item key={id}>
              {channel.removable ? (
                <Dropdown as={ButtonGroup}>
                  <Button variant="dark" className={channelClass} onClick={handleSetCurrentChannel(id)}>{channel.name}</Button>

                  <Dropdown.Toggle split variant="dark" id={dropdownId} data-testid={dropdowntestId} />

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleShowModalForChannelRename(id)}>{t('channelsNav.dropdownRename')}</Dropdown.Item>
                    <Dropdown.Item onClick={handleShowModalForChannelRemove(id)}>{t('channelsNav.dropdownRemove')}</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button variant="dark" className={channelClass} onClick={handleSetCurrentChannel(id)}>{channel.name}</Button>
              )}
            </Nav.Item>
          );
        })}
      </Nav>
      <ChannelModal />
    </>
  );
};

export default React.forwardRef(Channels);
