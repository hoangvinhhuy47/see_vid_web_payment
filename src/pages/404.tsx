import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Error404View } from '@/view/Error404View';
import { useTranslation } from '@/utils/i18n';

export default function Custom404() {
  const { t } = useTranslation();

  return (
    <MainLayout title={t('errors.404.title', '404 - Not Found')}>
      <Error404View />
    </MainLayout>
  );
}
