import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  QrCode, 
  Download, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  Utensils, 
  Activity,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Member, GasConfig, GasConnectionState } from '../types';
import { calculateDashboardStats, exportMembersToCsv } from '../utils/logic';

interface DashboardViewProps {
  members: Member[];
  config: GasConfig;
  gasConnection: GasConnectionState;
  onOpenScanner: () => void;
  onOpenSpreadsheet: () => void;
  onOpenFormModal: () => void;
  onConfigureGas: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  config,
  gasConnection,
  onOpenScanner,
  onOpenSpreadsheet,
  onOpenFormModal,
  onConfigureGas,
}) => {
  const stats = calculateDashboardStats(members);

  const handleDownloadCsv = () => {
    const csvContent = exportMembersToCsv(members);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inscriptions_pointage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const recentActivity = [...members]
    .filter((m) => m.heureEntree || m.heureSortie)
    .sort((a, b) => {
      const timeA = a.heureSortie || a.heureEntree;
      const timeB = b.heureSortie || b.heureEntree;
      return timeB.localeCompare(timeA);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Event Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Tableau de Bord Live
              </span>
              {gasConnection.isConnected ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Apps Script Connecté</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onConfigureGas}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Local / Connecter Web App</span>
                </button>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{config.eventName}</h1>
            <p className="text-xs text-slate-300">
              📅 {config.eventDate} • 📍 {config.eventLocation}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all cursor-pointer ring-2 ring-emerald-400/30"
            >
              <QrCode className="w-4 h-4" />
              <span>Lancer le Scanner QR</span>
            </button>

            <button
              type="button"
              onClick={onOpenFormModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Inscription Form</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Real-Time Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inscrits */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Inscrits
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.total}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>En attente d'arrivée :</span>
            <strong className="text-slate-800 font-bold">{stats.enAttente}</strong>
          </div>
        </div>

        {/* Card 2: Présents (Taux en temps réel) */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/40">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Présents en salle
              </span>
              <div className="text-3xl font-black text-emerald-800 mt-1">{stats.presents}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100/80">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-emerald-700 font-medium">Taux de présence</span>
              <span className="font-bold text-emerald-800">{stats.tauxPresence}%</span>
            </div>
            <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.tauxPresence}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Sortis */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sorties Enregistrées
              </span>
              <div className="text-3xl font-black text-slate-800 mt-1">{stats.sortis}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Flux sortant :</span>
            <span className="font-semibold text-slate-700">
              {stats.total > 0 ? Math.round((stats.sortis / stats.total) * 100) : 0}% des inscrits
            </span>
          </div>
        </div>

        {/* Card 4: Cotisation non réglée */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Cotisation non réglée
              </span>
              <div className="text-3xl font-black text-amber-800 mt-1">{stats.nonCotisants}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-800 font-medium">
            <span>À régulariser à l'accueil :</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[10px]">
              Priorité Accueil
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Breakdowns Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Breakdown by Title */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Répartition par Titre</h3>
            </div>
            <span className="text-xs text-slate-400">Total: {stats.total}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.byTitle).map(([title, count]) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={title} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{title}</span>
                    <span className="text-slate-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Regime */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Régimes Alimentaires (Traiteur)</h3>
            </div>
            <span className="text-xs text-slate-400">Pour la pause</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.byRegime).map(([regime, count]) => (
              <div
                key={regime}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <span className="font-semibold text-slate-700">{regime}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white font-mono font-bold text-slate-900 border border-slate-200">
                  {count} portion{count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Live Pointages Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Derniers Pointages</h3>
              </div>
              <button
                type="button"
                onClick={onOpenSpreadsheet}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Voir tout &rarr;
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Aucun pointage pour l'instant. Utilisez le scanner pour pointer les membres.
                </p>
              ) : (
                recentActivity.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          m.statut === 'Présent' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      ></span>
                      <span className="font-bold text-slate-900 truncate">
                        {m.prenom} {m.nom}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] shrink-0">
                        ({m.id})
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        m.statut === 'Présent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {m.statut}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenScanner}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors cursor-pointer"
          >
            Ouvrir la caméra de pointage
          </button>
        </div>
      </div>
    </div>
  );
};
