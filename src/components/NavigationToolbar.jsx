import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import { useAuth } from '../auth.jsx';
import routes from '../routes.ts';

const NavigationToolbar = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const auth = useAuth();

  const signout = () => {
    auth.signout();
    history.push(routes.mainPagePath());
  };

  const onClick = (e) => {
    e.preventDefault();
    history.replace(routes.mainPagePath());
  };

  return (
    <Navbar expand="lg">
      <Navbar.Brand href={routes.mainPagePath()} onClick={onClick} className="mr-auto text-light">{t('navbar.brand')}</Navbar.Brand>
      {auth.isAuthorized() ? (
        <Button onClick={signout}>{t('navbar.signout')}</Button>
      ) : (
        <span className="text-light">{t('navbar.notLoggedIn')}</span>
      )}
    </Navbar>
  );
};

export default NavigationToolbar;
