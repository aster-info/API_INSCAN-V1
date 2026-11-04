import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  SlidersHorizontal, 
  Settings2, 
  Sparkles, 
  Code2, 
  ExternalLink,
  Info
} from 'lucide-react';
import { GasConfig } from '../types';
import { generateCodeGs } from '../utils/gasGenerator';

interface ScriptViewerProps {
  config: GasConfig;
  setConfig: React.Dispatch<React.SetStateAction<GasConfig>>;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({ config, setConfig }) => {
  const [copied, setCopied] = useState(false);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const fullCode = generateCodeGs(config);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(fullCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyFormula = async () => {
    const formula = `=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" & I2)`;
    try {
      await navigator.clipboard.writeText(formula);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2500);
    } catch {
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullCode], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Livrable 1 : Prêt à l'emploi
              </span>
              <h2 className="text-xl font-bold text-slate-900">Code complet Code.gs</h2>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Gère automatiquement l'attribution des identifiants séquentiels ({config.idPrefix}0001), 
              la formule QR Code, l'envoi de l'e-mail de confirmation et l'API Web App (<code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-xs font-mono">doGet</code>) pour le pointage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>{showConfig ? 'Masquer paramètres' : 'Personnaliser'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Télécharger Code.gs</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
              <span>{copied ? 'Code copié !' : 'Copier tout Code.gs'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Drawer */}
        {showConfig && (
          <div className="mt-5 pt-5 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Paramètres de personnalisation</h3>
              <span className="text-xs text-slate-500">(Met à jour instantanément le code généré ci-dessous)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nom de l'onglet</label>
                <input
                  type="text"
                  value={config.sheetName}
                  onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Préfixe d'identifiant</label>
                <input
                  type="text"
                  value={config.idPrefix}
                  onChange={(e) => setConfig({ ...config, idPrefix: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Longueur chiffres (padding)</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={config.idPadding}
                  onChange={(e) => setConfig({ ...config, idPadding: parseInt(e.target.value, 10) || 4 })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nom de l'événement</label>
                <input
                  type="text"
                  value={config.eventName}
                  onChange={(e) => setConfig({ ...config, eventName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Organisateur</label>
                <input
                  type="text"
                  value={config.organizerName}
                  onChange={(e) => setConfig({ ...config, organizerName: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">E-mail organisateur</label>
                <input
                  type="email"
                  value={config.organizerEmail}
                  onChange={(e) => setConfig({ ...config, organizerEmail: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date & Heure</label>
                <input
                  type="text"
                  value={config.eventDate}
                  onChange={(e) => setConfig({ ...config, eventDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lieu</label>
                <input
                  type="text"
                  value={config.eventLocation}
                  onChange={(e) => setConfig({ ...config, eventLocation: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formula Card */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Formule Google Sheets (Colonne J)
              </span>
              <button
                type="button"
                onClick={handleCopyFormula}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded cursor-pointer"
              >
                {copiedFormula ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedFormula ? 'Copié' : 'Copier'}
              </button>
            </div>
            <code className="block bg-slate-950 p-2.5 rounded font-mono text-xs text-amber-300 break-all select-all">
              =IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" &amp; I2)
            </code>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            Insérée automatiquement par <span className="font-mono text-slate-300">onFormSubmit()</span> à chaque nouvelle ligne.
          </p>
        </div>

        {/* Web App API Syntax Card */}
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Syntaxe des URLs de Pointage (doGet)
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="bg-slate-950 p-1.5 rounded text-emerald-300 truncate">
                .../exec?id={config.idPrefix}0001&amp;action=entree
              </div>
              <div className="bg-slate-950 p-1.5 rounded text-sky-300 truncate">
                .../exec?id={config.idPrefix}0001&amp;action=sortie
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Mise à jour en temps réel : Col K (Statut), Col L (Entrée) et Col M (Sortie).
          </p>
        </div>
      </div>

      {/* Code Display Container */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="ml-2 font-semibold text-slate-200">Code.gs</span>
            <span className="text-slate-500">• Google Apps Script V8 Runtime</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        <div className="max-h-[620px] overflow-y-auto p-4 font-mono text-xs text-slate-200 leading-relaxed select-text">
          <pre className="whitespace-pre">
            <code>{fullCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
