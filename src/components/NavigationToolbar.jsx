import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { useTranslation } from 'react-i18next';

import AuthButton from './AuthButton.jsx';
import routes from '../routes.js';

const NavigationToolbar = () => {
  const { t } = useTranslation();

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href={routes.mainPagePath()} className="mr-auto">{t('navbar.brand')}</Navbar.Brand>
      <AuthButton />
    </Navbar>
  );
};

export default NavigationToolbar;
