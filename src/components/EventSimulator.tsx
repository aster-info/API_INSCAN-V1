import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  QrCode, 
  AlertTriangle, 
  Send, 
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Member, CheckInAction, DietaryRequirement, MemberTitle, CotisationStatus, GasConfig } from '../types';
import { formatDateTime, generateMemberId, getQrCodeUrl, getQrCodeFormula, processCheckIn } from '../utils/logic';
import { INITIAL_MEMBERS } from '../data/mockMembers';
import { playChime } from '../utils/audio';

interface EventSimulatorProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  config: GasConfig;
  onOpenBadge: (member: Member) => void;
  onOpenScanner: () => void;
}

export const EventSimulator: React.FC<EventSimulatorProps> = ({
  members,
  setMembers,
  config,
  onOpenBadge,
  onOpenScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Inscrit' | 'Présent' | 'Sorti'>('All');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Google Form simulation state
  const [newNom, setNewNom] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTitre, setNewTitre] = useState<MemberTitle>('Infirmier');
  const [newInstitution, setNewInstitution] = useState('');
  const [newRegime, setNewRegime] = useState<DietaryRequirement>('Aucun');
  const [newCotisation, setNewCotisation] = useState<CotisationStatus>('Oui');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAction = (memberId: string, action: CheckInAction) => {
    const { updatedMembers, response } = processCheckIn(members, memberId, action);
    setMembers(updatedMembers);
    
    if (response.success) {
      playChime(action === 'entree' ? 'success' : 'sortie');
      showToast(response.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser le tableau avec les données d\'exemple par défaut ?')) {
      setMembers(INITIAL_MEMBERS);
      showToast('Tableau réinitialisé aux données de démonstration.');
    }
  };

  const handleSimulateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom.trim() || !newPrenom.trim() || !newEmail.trim()) {
      alert('Veuillez renseigner au minimum le nom, le prénom et l\'adresse e-mail.');
      return;
    }

    const existingIds = members.map((m) => m.id);
    const nextId = generateMemberId(existingIds, config.idPrefix, config.idPadding);
    const nextRow = members.length + 2; // Row 1 is header

    const newMember: Member = {
      rowNumber: nextRow,
      horodateur: formatDateTime(),
      nom: newNom.trim(),
      prenom: newPrenom.trim(),
      email: newEmail.trim(),
      titre: newTitre,
      institution: newInstitution.trim() || 'Non renseigné',
      regime: newRegime,
      cotisation: newCotisation,
      id: nextId,
      qrCodeUrl: getQrCodeUrl(nextId),
      statut: 'Inscrit',
      heureEntree: '',
      heureSortie: '',
    };

    setMembers([...members, newMember]);
    setIsFormModalOpen(false);
    
    // Reset form
    setNewNom('');
    setNewPrenom('');
    setNewEmail('');
    setNewInstitution('');

    playChime('success');
    showToast(`🎉 Formulaire soumis ! ID attribué : ${nextId} & e-mail de badge envoyé à ${newMember.email}`);
  };

  // Filtered list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || m.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-base font-bold text-slate-900">
                Feuille "{config.sheetName}" (Simulateur Google Sheets)
              </h2>
            </div>
            {/* body of controls */}
            <p className="text-xs text-slate-500 mt-0.5">
              13 colonnes dynamiques A à M synchronisées en direct. Faites défiler horizontalement pour voir toutes les colonnes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Ouvrir Scanner Jour J</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFormModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Simuler Réponse Google Form</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title="Réinitialiser le tableau"
              className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, ID (ex: MBR-0001), institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Statut:
            </span>
            {(['All', 'Inscrit', 'Présent', 'Sorti'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'All' ? 'Tous' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid Simulation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[580px] scrollbar-thin">
          <table className="w-full text-xs border-collapse">
            {/* Header Row: Google Sheets style */}
            <thead className="bg-[#1E3A8A] text-white sticky top-0 z-20 shadow-sm select-none">
              <tr>
                <th className="py-2 px-2 text-center border border-blue-900 w-10 bg-blue-950/60 font-mono text-[10px]">
                  #
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  A : Horodateur
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  B : Votre Nom
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  C : Votre Prénom
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  D : Adresse Email
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  E : Titre
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  F : Institution
                </th>
                <th className="py-2 px-3 text-left border border-blue-900 font-semibold whitespace-nowrap">
                  G : Régime
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap">
                  H : Cotisation ?
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap bg-indigo-900">
                  I : ID Membre
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap bg-indigo-900">
                  J : QR Code
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap bg-sky-900">
                  K : Statut
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap bg-emerald-900">
                  L : Heure d'entrée
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap bg-amber-900">
                  M : Heure de sortie
                </th>
                <th className="py-2 px-3 text-center border border-blue-900 font-semibold whitespace-nowrap bg-slate-900">
                  Actions de pointage
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400">
                    Aucun participant trouvé correspondant aux critères.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m, index) => {
                  const isPresent = m.statut === 'Présent';
                  const isSorti = m.statut === 'Sorti';

                  return (
                    <tr 
                      key={m.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isPresent ? 'bg-emerald-50/20' : isSorti ? 'bg-slate-50' : ''
                      }`}
                    >
                      {/* Row number */}
                      <td className="py-2 px-2 text-center text-[10px] font-mono text-slate-400 border-r border-slate-200 bg-slate-50 select-none">
                        {index + 2}
                      </td>

                      {/* Col A: Horodateur */}
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap border-r border-slate-100">
                        {m.horodateur}
                      </td>

                      {/* Col B: Nom */}
                      <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap border-r border-slate-100">
                        {m.nom}
                      </td>

                      {/* Col C: Prénom */}
                      <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap border-r border-slate-100">
                        {m.prenom}
                      </td>

                      {/* Col D: Email */}
                      <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap border-r border-slate-100">
                        {m.email}
                      </td>

                      {/* Col E: Titre */}
                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap border-r border-slate-100">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                          {m.titre}
                        </span>
                      </td>

                      {/* Col F: Institution */}
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap border-r border-slate-100">
                        {m.institution}
                      </td>

                      {/* Col G: Régime */}
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap border-r border-slate-100">
                        <span className="text-[11px] font-medium text-slate-700">{m.regime}</span>
                      </td>

                      {/* Col H: Cotisation */}
                      <td className="py-2 px-3 text-center whitespace-nowrap border-r border-slate-100">
                        {m.cotisation === 'Oui' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            Oui
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold text-[10px] inline-flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Non
                          </span>
                        )}
                      </td>

                      {/* Col I: Numéro de Membre */}
                      <td className="py-2 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/50 whitespace-nowrap border-r border-slate-100">
                        {m.id}
                      </td>

                      {/* Col J: QR Code */}
                      <td className="py-1 px-2 text-center whitespace-nowrap border-r border-slate-100">
                        <button
                          type="button"
                          onClick={() => onOpenBadge(m)}
                          title="Cliquer pour afficher le badge & QR Code"
                          className="inline-flex items-center gap-1 px-1.5 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition-colors border border-slate-200 cursor-pointer text-[10px]"
                        >
                          <img
                            src={m.qrCodeUrl}
                            alt={`QR ${m.id}`}
                            className="w-5 h-5 rounded-xs"
                          />
                          <span className="font-mono">Voir</span>
                        </button>
                      </td>

                      {/* Col K: Statut */}
                      <td className="py-2 px-3 text-center whitespace-nowrap border-r border-slate-100">
                        {isPresent ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Présent
                          </span>
                        ) : isSorti ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" /> Sorti
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                            Inscrit
                          </span>
                        )}
                      </td>

                      {/* Col L: Heure d'entrée */}
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-emerald-700 whitespace-nowrap border-r border-slate-100 font-semibold">
                        {m.heureEntree || '—'}
                      </td>

                      {/* Col M: Heure de sortie */}
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-amber-700 whitespace-nowrap border-r border-slate-100 font-semibold">
                        {m.heureSortie || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAction(m.id, 'entree')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs"
                          >
                            Pointer Entrée
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction(m.id, 'sortie')}
                            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-800 text-white font-medium text-[11px] transition-colors cursor-pointer shadow-xs"
                          >
                            Pointer Sortie
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Simulate Google Form Submission */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Simuler un envoi Google Form</h3>
                <p className="text-xs text-blue-100">
                  Déclenche instantanément <code className="font-mono bg-blue-800/60 px-1 rounded">onFormSubmit(e)</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Votre Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Leroy"
                    value={newNom}
                    onChange={(e) => setNewNom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Votre Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Céline"
                    value={newPrenom}
                    onChange={(e) => setNewPrenom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adresse Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ex: celinedupont@hopital.be"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Titre Professionnel</label>
                  <select
                    value={newTitre}
                    onChange={(e) => setNewTitre(e.target.value as MemberTitle)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Infirmier">Infirmier</option>
                    <option value="Auxiliaire">Auxiliaire</option>
                    <option value="Pharmacien">Pharmacien</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution</label>
                  <input
                    type="text"
                    placeholder="ex: Clinique Saint-Luc"
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Régime Alimentaire</label>
                  <select
                    value={newRegime}
                    onChange={(e) => setNewRegime(e.target.value as DietaryRequirement)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Aucun">Aucun</option>
                    <option value="Végé">Végé</option>
                    <option value="Végan">Végan</option>
                    <option value="Allergène">Allergène</option>
                    <option value="Sans porc">Sans porc</option>
                    <option value="Sans gluten">Sans gluten</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">En ordre de cotisation ?</label>
                  <select
                    value={newCotisation}
                    onChange={(e) => setNewCotisation(e.target.value as CotisationStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="Oui">Oui (En ordre)</option>
                    <option value="Non">Non (À régulariser)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <span className="font-semibold block">Traitement automatique :</span>
                <p>
                  1. Attribue le prochain ID séquentiel ({config.idPrefix}...) dans la colonne I.<br />
                  2. Génère la formule QR Code <code className="font-mono text-[10px]">=IMAGE(...)</code> en colonne J.<br />
                  3. Définit le Statut sur "Inscrit" en colonne K.<br />
                  4. Envoie l'e-mail de confirmation au participant.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Valider la soumission</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
