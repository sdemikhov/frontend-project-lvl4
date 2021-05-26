import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { setCurrentChannelId, selectCurrentChannelId } from '../slices/channels-slice.js';
import { openModal } from '../slices/modal-slice.js';
import ChannelModal from './ChannelModal.jsx';

const Channel = React.forwardRef(
  ({ body: { id, name, removable } }, ref) => {
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

    const currentChannelId = useSelector(selectCurrentChannelId);

    const channelClass = cn({
      'text-light': id === currentChannelId,
      'font-weight-bold': id === currentChannelId,
      'text-secondary': id !== currentChannelId,
    });
    const dropdowntestId = `dropdown-channelId-${id}`;
    const dropdownId = `channel-${name}-context`;

    return (
      <Nav.Item>
        {removable ? (
          <Dropdown as={ButtonGroup}>
            <Button variant="dark" className={channelClass} onClick={onSetCurrentChannel}>{name}</Button>

            <Dropdown.Toggle split variant="dark" id={dropdownId} data-testid={dropdowntestId} />

            <Dropdown.Menu>
              <Dropdown.Item onClick={onShowModalForChannelRename}>{t('channelsNav.dropdownRename')}</Dropdown.Item>
              <Dropdown.Item onClick={onShowModalForChannelRemove}>{t('channelsNav.dropdownRemove')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Button variant="dark" className={channelClass} onClick={onSetCurrentChannel}>{name}</Button>
        )}
      </Nav.Item>
    );
  },
);

const Channels = (props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const channels = useSelector((state) => state.channelsInfo.channels);

  const onShowModalForChannelAdd = (e) => {
    e.preventDefault();
    dispatch(openModal({ type: 'newChannel', extra: null }));
  };

  return (
    <>
      <Nav className="flex-column">
        <div className="d-flex justify-content-between align-items-baseline">
          <span className="text-secondary">Каналы:</span>
          <Button
            className="font-weight-bold border-light"
            onClick={onShowModalForChannelAdd}
            variant="dark"
            size="sm"
          >
            {t('channelsNav.addButton')}
          </Button>
        </div>
        {channels.map(
          (channel) => <Channel key={channel.id} body={channel} ref={ref} />,
        )}
      </Nav>
      <ChannelModal />
    </>
  );
};

export default React.forwardRef(Channels);
