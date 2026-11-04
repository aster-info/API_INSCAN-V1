import React, { useState } from 'react';
import { 
  Mail, 
  Printer, 
  Download, 
  ExternalLink, 
  QrCode, 
  Check, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  User, 
  Building,
  Utensils
} from 'lucide-react';
import { Member, GasConfig } from '../types';

interface BadgeEmailModalProps {
  member: Member | null;
  members: Member[];
  onSelectMember: (m: Member) => void;
  config: GasConfig;
}

export const BadgeEmailModal: React.FC<BadgeEmailModalProps> = ({
  member,
  members,
  onSelectMember,
  config,
}) => {
  const [viewMode, setViewMode] = useState<'email' | 'badge'>('email');

  const currentMember = member || members[0];
  if (!currentMember) return null;

  const fullName = `${currentMember.prenom} ${currentMember.nom}`.trim();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Aperçu E-mail &amp; Badge d'Accès</h2>
            <p className="text-xs text-slate-500">
              Généré et envoyé automatiquement par <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">onFormSubmit(e)</code> à l'adresse de la colonne D
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Member selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Participant :</label>
            <select
              value={currentMember.id}
              onChange={(e) => {
                const found = members.find((m) => m.id === e.target.value);
                if (found) onSelectMember(found);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.prenom} {m.nom} ({m.titre})
                </option>
              ))}
            </select>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('email')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'email' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue E-mail HTML
            </button>
            <button
              type="button"
              onClick={() => setViewMode('badge')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'badge' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Badge Imprimable
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'email' ? (
        /* Email Client Simulation */
        <div className="bg-slate-100 rounded-2xl p-4 sm:p-8 flex justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-xl w-full overflow-hidden">
            {/* Fake Email Client Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800">De :</span> {config.organizerName} &lt;{config.organizerEmail}&gt;
                </div>
                <div className="text-slate-400 font-mono text-[11px]">{currentMember.horodateur}</div>
              </div>
              <div>
                <span className="font-semibold text-slate-800">À :</span> {fullName} &lt;{currentMember.email}&gt;
              </div>
              <div>
                <span className="font-semibold text-slate-800">Objet :</span>{' '}
                <span className="font-bold text-slate-900">
                  🎟️ Confirmation d'inscription &amp; Votre Badge d'accès ({currentMember.id})
                </span>
              </div>
            </div>

            {/* Email HTML Template Body */}
            <div>
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-7 text-center">
                <h1 className="text-xl font-bold tracking-tight mb-1">{config.eventName}</h1>
                <p className="text-xs text-blue-200">Confirmation officielle d'inscription</p>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-sm text-slate-800">
                  Bonjour <strong>{fullName}</strong>,
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nous vous confirmons avec plaisir votre inscription. Voici votre badge d'accès personnel pour l'événement :
                </p>

                {/* Badge Card */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-5 text-center my-4">
                  <div className="inline-block bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wider font-mono">
                    {currentMember.id}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
                  <p className="text-xs text-slate-500 mb-3">
                    {currentMember.titre} — {currentMember.institution}
                  </p>

                  <div className="inline-block p-2.5 bg-white rounded-lg shadow-sm border border-slate-200 my-2">
                    <img
                      src={currentMember.qrCodeUrl}
                      alt={`QR Code ${currentMember.id}`}
                      className="w-40 h-40 object-contain mx-auto"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">
                    Présentez ce QR code à l'accueil pour votre pointage en temps réel
                  </p>
                </div>

                {/* Cotisation Alert if Non */}
                {currentMember.cotisation === 'Non' && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded text-xs text-red-900">
                    <div className="font-bold flex items-center gap-1.5 text-red-800 mb-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Cotisation non réglée :</span>
                    </div>
                    <p className="text-red-700">
                      Votre inscription indique que vous n'êtes pas encore en ordre de cotisation. Merci de régulariser à l'accueil le jour de l'événement.
                    </p>
                  </div>
                )}

                {/* Event Information Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="grid grid-cols-3 p-2.5 border-b border-slate-100 bg-slate-50/60">
                    <span className="font-semibold text-slate-500">📅 Date :</span>
                    <span className="col-span-2 font-bold text-slate-800">{config.eventDate}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-500">📍 Lieu :</span>
                    <span className="col-span-2 text-slate-800">{config.eventLocation}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 border-b border-slate-100 bg-slate-50/60">
                    <span className="font-semibold text-slate-500">🍽️ Régime :</span>
                    <span className="col-span-2 text-slate-800 font-medium">{currentMember.regime}</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5">
                    <span className="font-semibold text-slate-500">💳 Cotisation :</span>
                    <span className={`col-span-2 font-bold ${
                      currentMember.cotisation === 'Oui' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {currentMember.cotisation === 'Oui' ? '✅ En ordre' : '❌ À régler sur place'}
                    </span>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 space-y-1">
                  <span className="font-bold">ℹ️ Consignes pour le Jour J :</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-blue-800">
                    <li>Gardez cet e-mail accessible sur votre smartphone ou imprimez ce message.</li>
                    <li>À votre arrivée et à votre départ, présentez le QR code au scanner de pointage.</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-[11px] text-slate-400">
                {config.organizerName} — Contact : {config.organizerEmail}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Printable Badge View */
        <div className="bg-slate-100 rounded-2xl p-6 sm:p-12 flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-300 w-80 overflow-hidden text-center p-6 relative">
            <div className="w-12 h-2.5 bg-slate-300 rounded-full mx-auto mb-4"></div>
            
            <div className="text-[10px] uppercase font-bold tracking-widest text-blue-700 mb-1">
              BADGE PARTICIPANT
            </div>
            
            <div className="inline-block bg-blue-900 text-white font-mono font-bold text-xs px-3 py-1 rounded-full mb-3">
              {currentMember.id}
            </div>

            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-xs font-semibold text-blue-600">{currentMember.titre}</p>
            <p className="text-xs text-slate-500 mb-4">{currentMember.institution}</p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block mb-3">
              <img
                src={currentMember.qrCodeUrl}
                alt="QR Code"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] border-t border-slate-200 pt-3 text-slate-600">
              <span>🍽️ {currentMember.regime}</span>
              <span className={`font-bold ${currentMember.cotisation === 'Oui' ? 'text-emerald-700' : 'text-red-700'}`}>
                Cotis: {currentMember.cotisation}
              </span>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-400">
              {config.eventName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
