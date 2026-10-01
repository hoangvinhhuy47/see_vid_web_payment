import React from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { HomeView } from '@/view/home/HomeView';

export default function HomePage() {
  return (
    <MainLayout>
      <HomeView />
    </MainLayout>
  );
}
