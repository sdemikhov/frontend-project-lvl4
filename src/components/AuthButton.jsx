import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../use-auth.jsx';
import routes from '../routes.js';

const AuthButton = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const auth = useAuth();

  const signout = () => {
    auth.signout();
    history.push(routes.mainPagePath());
  };

  return auth.user.token ? (
    <Button onClick={signout}>{t('navbar.signout')}</Button>
  ) : (
    <span className="text-light">{t('navbar.notLoggedIn')}</span>
  );
};

export default AuthButton;
