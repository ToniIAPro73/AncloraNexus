import { useState } from 'react';
import HistoryView from '../components/HistoryView';
import { MainLayout } from '../components/Layout/MainLayout';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <HistoryView />
    </MainLayout>
  );
}
