import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { QrScannerModal } from './components/QrScannerModal';
import { EventSimulator } from './components/EventSimulator';
import { BadgeEmailModal } from './components/BadgeEmailModal';
import { ScriptViewer } from './components/ScriptViewer';
import { StepByStepGuide } from './components/StepByStepGuide';
import { Member, GasConfig, GasConnectionState } from './types';
import { INITIAL_MEMBERS } from './data/mockMembers';
import { DEFAULT_GAS_CONFIG } from './utils/gasGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [config, setConfig] = useState<GasConfig>(DEFAULT_GAS_CONFIG);
  const [selectedBadgeMember, setSelectedBadgeMember] = useState<Member | null>(INITIAL_MEMBERS[0] || null);

  const USER_GAS_URL = 'https://script.google.com/macros/s/AKfycbzqj1FoJn4hFvf2T3uLDMHIkXD3_Kqth5Q92FU3oU-CV0SYPfidVN8EhH2_yQIbb-Y/exec';

  const [gasConnection, setGasConnection] = useState<GasConnectionState>(() => {
    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem('gas_web_app_url') || USER_GAS_URL : USER_GAS_URL;
    return {
      webAppUrl: savedUrl,
      isConnected: true,
      isTesting: false,
    };
  });

  const handleOpenBadge = (m: Member) => {
    setSelectedBadgeMember(m);
    setActiveTab('badge');
  };

  const handleOpenScanner = () => {
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        members={members}
        gasConnection={gasConnection}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Tableau de bord interactif */}
        {activeTab === 'dashboard' && (
          <section aria-labelledby="section-dashboard">
            <DashboardView
              members={members}
              config={config}
              gasConnection={gasConnection}
              onOpenScanner={() => setActiveTab('scanner')}
              onOpenSpreadsheet={() => setActiveTab('simulator')}
              onOpenFormModal={() => setActiveTab('simulator')}
              onConfigureGas={() => setActiveTab('scanner')}
            />
          </section>
        )}

        {/* 2. Scanner QR Code Connecté */}
        {activeTab === 'scanner' && (
          <section aria-labelledby="section-scanner">
            <QrScannerModal
              members={members}
              setMembers={setMembers}
              config={config}
              gasConnection={gasConnection}
              setGasConnection={setGasConnection}
              onClose={() => setActiveTab('dashboard')}
              onOpenBadge={handleOpenBadge}
            />
          </section>
        )}

        {/* 3. Feuille INSCRIPTIONS (13 colonnes) & Simulateur */}
        {activeTab === 'simulator' && (
          <section aria-labelledby="section-simulator">
            <EventSimulator
              members={members}
              setMembers={setMembers}
              config={config}
              onOpenBadge={handleOpenBadge}
              onOpenScanner={handleOpenScanner}
            />
          </section>
        )}

        {/* 4. Aperçu E-mail & Badge */}
        {activeTab === 'badge' && (
          <section aria-labelledby="section-badge">
            <BadgeEmailModal
              member={selectedBadgeMember}
              members={members}
              onSelectMember={setSelectedBadgeMember}
              config={config}
            />
          </section>
        )}

        {/* 5. Code.gs & Guide Google Apps Script */}
        {activeTab === 'script' && (
          <div className="space-y-10">
            <section aria-labelledby="section-code">
              <ScriptViewer config={config} setConfig={setConfig} />
            </section>

            <section aria-labelledby="section-guide" className="pt-6 border-t border-slate-200">
              <StepByStepGuide />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Tableau de Bord Événement &amp; Pointage QR Code — Solution Web &amp; Google Apps Script
          </span>
          <span className="text-slate-400">
            Synchronisation temps réel avec Google Sheets (doGet &amp; onFormSubmit)
          </span>
        </div>
      </footer>
    </div>
  );
}
