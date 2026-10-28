import React from 'react';
import { IdentityProvider, useIdentity } from './context/IdentityContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Stage1Registration from './components/stages/Stage1Registration';
import Stage2DocUpload from './components/stages/Stage2DocUpload';
import Stage3ForgeryDetection from './components/stages/Stage3ForgeryDetection';
import Stage4IPFSStorage from './components/stages/Stage4IPFSStorage';
import Stage5BlockchainStorage from './components/stages/Stage5BlockchainStorage';
import Stage6Verification from './components/stages/Stage6Verification';
import Stage7AccessControl from './components/stages/Stage7AccessControl';
import Stage8DocumentManagement from './components/stages/Stage8DocumentManagement';

function MainContent() {
  const { currentStage } = useIdentity();

  const renderStage = () => {
    switch (currentStage) {
      case 1:
        return <Stage1Registration />;
      case 2:
        return <Stage2DocUpload />;
      case 3:
        return <Stage3ForgeryDetection />;
      case 4:
        return <Stage4IPFSStorage />;
      case 5:
        return <Stage5BlockchainStorage />;
      case 6:
        return <Stage6Verification />;
      case 7:
        return <Stage7AccessControl />;
      case 8:
        return <Stage8DocumentManagement />;
      default:
        return <Stage1Registration />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-slate-950 bg-grid-pattern">
      <Header />
      <main className="flex-1 overflow-y-auto p-8">
        {renderStage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <IdentityProvider>
      <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        <Sidebar />
        <MainContent />
      </div>
    </IdentityProvider>
  );
}
