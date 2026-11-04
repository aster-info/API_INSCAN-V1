import React from 'react';
import { 
  FileCode2, 
  Table2, 
  QrCode, 
  Mail, 
  CheckCircle2, 
  Users, 
  Clock, 
  AlertTriangle,
  LayoutDashboard,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Member, GasConnectionState } from '../types';

export type AppTab = 'dashboard' | 'scanner' | 'simulator' | 'badge' | 'script';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  members: Member[];
  gasConnection: GasConnectionState;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  members,
  gasConnection,
}) => {
  const totalInscrits = members.length;
  const totalPresents = members.filter((m) => m.statut === 'Présent').length;
  const totalSortis = members.filter((m) => m.statut === 'Sorti').length;
  const totalNonCotisants = members.filter((m) => m.cotisation === 'Non').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Tableau de Bord &amp; Pointage QR Code
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Google Apps Script Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Suivi des présences en temps réel, alertes cotisations &amp; scanner connecté Google Sheets
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
            {/* Connection Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              gasConnection.isConnected
                ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              {gasConnection.isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Google Sheets : Lié</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Local</span>
                </>
              )}
            </div>

            {/* Inscrits Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Inscrits:</span>
              <strong className="text-white font-bold">{totalInscrits}</strong>
            </div>

            {/* Présents Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Présents:</span>
              <strong className="font-bold text-emerald-200">{totalPresents}</strong>
            </div>

            {/* Sortis Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Sortis:</span>
              <strong className="font-bold text-sky-200">{totalSortis}</strong>
            </div>

            {/* Cotisation non réglée Badge */}
            {totalNonCotisants > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Cotisation non réglée:</span>
                <strong className="font-bold text-amber-200">{totalNonCotisants}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 mt-4 border-t border-slate-800 pt-3 overflow-x-auto" aria-label="Sections principales">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de Bord</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scanner QR Code (Connecté)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Feuille INSCRIPTIONS</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 text-slate-300 font-bold">
              {totalInscrits}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('badge')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'badge'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Aperçu E-mail &amp; Badge</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'script'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Code.gs &amp; Guide Google Apps Script</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
