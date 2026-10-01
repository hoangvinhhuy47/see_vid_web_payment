import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Error500View } from '@/view/Error500View';
import { useTranslation } from '@/utils/i18n';

export default function Custom500() {
  const { t } = useTranslation();

  return (
    <MainLayout title={t('errors.500.title', '500 - Server Error')}>
      <Error500View />
    </MainLayout>
  );
}
