import React from 'react';

import { useTranslation } from 'react-i18next';

const PageNotFound = (): JSX.Element => {
  const { t } = useTranslation();
  return <h1>{t('errors.pageNotFound')}</h1>;
};

export default PageNotFound;
