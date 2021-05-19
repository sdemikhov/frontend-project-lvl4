import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import AuthButton from './AuthButton.jsx';
import routes from '../routes.js';

const NavigationToolbar = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const onClick = (e) => {
    e.preventDefault();
    history.replace(routes.mainPagePath());
  };

  return (
    <Navbar expand="lg">
      <Navbar.Brand href={routes.mainPagePath()} onClick={onClick} className="mr-auto text-light">{t('navbar.brand')}</Navbar.Brand>
      <AuthButton />
    </Navbar>
  );
};

export default NavigationToolbar;
