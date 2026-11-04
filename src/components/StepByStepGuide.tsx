import React, { useState } from 'react';
import { 
  CheckCircle, 
  ChevronRight, 
  ExternalLink, 
  ShieldAlert, 
  HelpCircle, 
  Copy, 
  Check, 
  Zap, 
  Globe, 
  KeyRound,
  FileSpreadsheet,
  Workflow
} from 'lucide-react';

export const StepByStepGuide: React.FC = () => {
  const [copiedHeaders, setCopiedHeaders] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const headersList = [
    'Horodateur',
    'Votre Nom',
    'Votre Prénom',
    'Votre Adresse Email',
    'Votre Titre (Infirmier, Auxiliaire, Pharmacien, Autre)',
    'Votre Institution',
    'Régime alimentaire (Aucun, Végé, Végan, Allergène, Sans porc, Sans gluten)',
    'Êtes-vous en ordre de cotisation ? (Oui / Non)',
    'Numéro de Membre',
    'QR Code',
    'Statut du membre',
    'Heure d\'entrée',
    'Heure de sortie',
  ];

  const handleCopyHeaders = async () => {
    // Tab-separated values paste directly into Google Sheets columns A to M!
    const tsv = headersList.join('\t');
    try {
      await navigator.clipboard.writeText(tsv);
      setCopiedHeaders(true);
      setTimeout(() => setCopiedHeaders(false), 2500);
    } catch {
      setCopiedHeaders(true);
      setTimeout(() => setCopiedHeaders(false), 2500);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Structure de la feuille Google Sheets',
      badge: 'Prérequis',
      badgeColor: 'bg-slate-100 text-slate-800',
      icon: FileSpreadsheet,
    },
    {
      num: 2,
      title: 'Intégration du code dans Apps Script',
      badge: 'Éditeur',
      badgeColor: 'bg-blue-100 text-blue-800',
      icon: Workflow,
    },
    {
      num: 3,
      title: 'Configuration du Déclencheur onFormSubmit',
      badge: 'Automatisation',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Zap,
    },
    {
      num: 4,
      title: 'Déploiement en Application Web (doGet)',
      badge: 'Pointage Jour J',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Globe,
    },
    {
      num: 5,
      title: 'Validation des Autorisations de Sécurité Google',
      badge: 'Important',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: KeyRound,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
            Livrable 2 : Procédure pas à pas
          </span>
          <h2 className="text-xl font-bold text-slate-900">Guide de Déploiement & Configuration</h2>
        </div>
        <p className="text-sm text-slate-600">
          Suivez ces 5 étapes simples pour lier votre Google Formulaire, activer l'envoi automatique d'e-mails de badges QR Code et déployer l'URL de pointage pour les scanners.
        </p>
      </div>

      {/* Step Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((st) => {
          const Icon = st.icon;
          const isCurrent = activeStep === st.num;
          return (
            <button
              key={st.num}
              type="button"
              onClick={() => setActiveStep(st.num)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {st.num}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.badgeColor}`}>
                  {st.badge}
                </span>
              </div>
              <div>
                <Icon className={`w-4 h-4 mb-1.5 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                <h4 className="text-xs font-bold text-slate-800 leading-snug">{st.title}</h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Detail Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Step 1 */}
        {activeStep === 1 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Étape 1 sur 5</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Préparer la feuille Google Sheets & l'onglet INSCRIPTIONS
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyHeaders}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                {copiedHeaders ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHeaders ? 'En-têtes copiés !' : 'Copier les 13 en-têtes (TSV)'}</span>
              </button>
            </div>

            <ol className="space-y-3.5 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                <div>
                  Créez ou ouvrez votre classeur Google Sheets relié à votre Google Form.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                <div>
                  Renommez l'onglet où arrivent les réponses en : <strong className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-mono">INSCRIPTIONS</strong> (en majuscules).
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">3</span>
                <div>
                  Vérifiez ou placez les en-têtes sur la première ligne (Ligne 1, Colonnes A à M) :
                </div>
              </li>
            </ol>

            {/* Columns Table */}
            <div className="rounded-lg border border-slate-200 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-16">Col.</th>
                    <th className="py-2 px-3">Nom de l'en-tête</th>
                    <th className="py-2 px-3">Rôle & Automatisation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">A (1)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Horodateur</td>
                    <td className="py-1.5 px-3">Généré par Google Forms lors de la validation</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">B (2)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Votre Nom</td>
                    <td className="py-1.5 px-3">Réponse participant</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">C (3)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Votre Prénom</td>
                    <td className="py-1.5 px-3">Réponse participant</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">D (4)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Votre Adresse Email</td>
                    <td className="py-1.5 px-3">Destinataire de l'e-mail avec badge QR</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">E (5)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Votre Titre</td>
                    <td className="py-1.5 px-3">Infirmier, Auxiliaire, Pharmacien, Autre</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">F (6)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Votre Institution</td>
                    <td className="py-1.5 px-3">Hôpital, clinique ou entreprise</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">G (7)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Régime alimentaire</td>
                    <td className="py-1.5 px-3">Aucun, Végé, Végan, Allergène, Sans porc, Sans gluten</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">H (8)</td>
                    <td className="py-1.5 px-3 font-medium text-slate-900">Êtes-vous en ordre de cotisation ?</td>
                    <td className="py-1.5 px-3 font-semibold text-amber-700">Oui / Non (Alerte si Non)</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="py-1.5 px-3 font-mono font-bold text-emerald-700">I (9)</td>
                    <td className="py-1.5 px-3 font-bold text-emerald-900">Numéro de Membre</td>
                    <td className="py-1.5 px-3 text-emerald-800 font-medium">Généré automatiquement par le script (ex: MBR-0001)</td>
                  </tr>
                  <tr className="bg-emerald-50/50">
                    <td className="py-1.5 px-3 font-mono font-bold text-emerald-700">J (10)</td>
                    <td className="py-1.5 px-3 font-bold text-emerald-900">QR Code</td>
                    <td className="py-1.5 px-3 text-emerald-800 font-medium">Formule =IMAGE(...) insérée automatiquement</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">K (11)</td>
                    <td className="py-1.5 px-3 font-bold text-blue-900">Statut du membre</td>
                    <td className="py-1.5 px-3 text-blue-800 font-medium">Initialisé à "Inscrit", bascule à "Présent" ou "Sorti"</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">L (12)</td>
                    <td className="py-1.5 px-3 font-bold text-blue-900">Heure d'entrée</td>
                    <td className="py-1.5 px-3 text-blue-800 font-medium">Horodaté lors de l'appel doGet(action=entree)</td>
                  </tr>
                  <tr className="bg-blue-50/50">
                    <td className="py-1.5 px-3 font-mono font-bold text-blue-700">M (13)</td>
                    <td className="py-1.5 px-3 font-bold text-blue-900">Heure de sortie</td>
                    <td className="py-1.5 px-3 text-blue-800 font-medium">Horodaté lors de l'appel doGet(action=sortie)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 cursor-pointer"
              >
                <span>Étape suivante : Intégrer le code</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {activeStep === 2 && (
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Étape 2 sur 5</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Coller le code dans l'éditeur Google Apps Script
              </h3>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-900 mb-2">Instructions pas à pas :</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Dans votre feuille Google Sheets, cliquez dans la barre de menu supérieure sur : <strong className="text-slate-900">Extensions &gt; Apps Script</strong>.</li>
                  <li>Une nouvelle fenêtre d'éditeur de code s'ouvre avec un fichier nommé <code className="bg-white px-1.5 py-0.5 border rounded text-xs font-mono">Code.gs</code>.</li>
                  <li>Supprimez tout contenu par défaut (ex: <code className="text-xs font-mono">function myFunction() ...</code>).</li>
                  <li>Collez l'intégralité du code disponible dans l'onglet <strong>"Code.gs"</strong> de cette application.</li>
                  <li>Cliquez sur l'icône de disquette <strong className="text-slate-900">💾 Enregistrer le projet</strong> (ou Ctrl+S / Cmd+S).</li>
                  <li>Nommez le projet en haut à gauche (par exemple : <span className="font-mono bg-white px-1.5 py-0.5 rounded border text-xs">Event-CheckIn-System</span>).</li>
                </ol>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Astuce menu automatique :</strong> Une fois le code enregistré, rechargez votre feuille Google Sheets. Vous verrez apparaître un nouveau menu <strong className="text-emerald-950">"🎟️ Pointage &amp; Inscriptions"</strong> qui permet d'initialiser ou tester en 1 clic !
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 cursor-pointer"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 cursor-pointer"
              >
                <span>Étape suivante : Configurer le Déclencheur</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {activeStep === 3 && (
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Étape 3 sur 5</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Créer le Déclencheur automatique (Trigger onFormSubmit)
              </h3>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 rounded-lg bg-purple-50/50 border border-purple-200">
                <p className="font-semibold text-purple-950 mb-2">Pourquoi cette étape est indispensable ?</p>
                <p className="text-xs text-purple-900 leading-relaxed">
                  L'envoi d'e-mails (<code className="font-mono">MailApp.sendEmail</code>) et la modification de cellules nécessitent des privilèges d'exécution. Pour que le script se déclenche automatiquement à chaque nouvelle soumission de formulaire sans intervention humaine, Google impose la configuration d'un <strong>déclencheur installable</strong>.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-semibold text-slate-900">Procédure dans Apps Script :</p>
                <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
                  <li>Dans le menu latéral gauche d'Apps Script, cliquez sur l'icône de réveil ⏰ <strong>Déclencheurs (Triggers)</strong>.</li>
                  <li>En bas à droite, cliquez sur le bouton bleu <strong>+ Ajouter un déclencheur</strong>.</li>
                  <li>Remplissez la boîte de dialogue exactement ainsi :
                    <ul className="mt-2 space-y-1.5 pl-4 list-disc text-xs font-medium">
                      <li><strong>Fonction à exécuter :</strong> <code className="bg-white px-2 py-0.5 border rounded font-mono text-purple-700 font-bold">onFormSubmit</code></li>
                      <li><strong>Déploiement à exécuter :</strong> <code className="bg-white px-2 py-0.5 border rounded font-mono">Head</code></li>
                      <li><strong>Source de l'événement :</strong> <code className="bg-white px-2 py-0.5 border rounded font-mono">Feuille de calcul</code> (Spreadsheet)</li>
                      <li><strong>Type d'événement :</strong> <code className="bg-white px-2 py-0.5 border rounded font-mono text-emerald-700 font-bold">Lors de l'envoi du formulaire</code> (On form submit)</li>
                      <li><strong>Paramètres de notification d'échec :</strong> Notification quotidienne ou immédiate</li>
                    </ul>
                  </li>
                  <li>Cliquez sur <strong>Enregistrer</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 cursor-pointer"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 cursor-pointer"
              >
                <span>Étape suivante : Déployer en Application Web</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {activeStep === 4 && (
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Étape 4 sur 5</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Déployer en Application Web (API de pointage doGet)
              </h3>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <p>
                Cette étape permet de transformer votre script en un point d'entrée HTTP public pouvant être appelé par la caméra de n'importe quel smartphone ou tablette le jour de l'événement.
              </p>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-semibold text-slate-900">Procédure de déploiement :</p>
                <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
                  <li>En haut à droite de l'éditeur Apps Script, cliquez sur le bouton bleu <strong>Déployer &gt; Nouveau déploiement</strong>.</li>
                  <li>Dans la fenêtre, cliquez sur l'icône d'engrenage ⚙️ à côté de "Sélectionner un type", et choisissez <strong>Application Web</strong>.</li>
                  <li>Configurez les 3 champs suivants (<strong>CRITIQUE</strong>) :
                    <div className="mt-2 space-y-2 pl-2">
                      <div className="p-2.5 bg-white border border-slate-200 rounded">
                        <span className="block font-semibold text-xs text-slate-800">Description :</span>
                        <span className="text-xs text-slate-500">API de pointage QR Code v1</span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded">
                        <span className="block font-semibold text-xs text-slate-800">Exécuter en tant que :</span>
                        <span className="text-xs font-bold text-blue-700">Moi (votre adresse email)</span>
                        <span className="block text-[11px] text-slate-500">Permet au script de modifier la feuille en votre nom</span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded">
                        <span className="block font-semibold text-xs text-emerald-950">Qui a accès :</span>
                        <span className="text-xs font-bold text-emerald-700">N'importe qui (Anyone)</span>
                        <span className="block text-[11px] text-emerald-900">
                          Obligatoire pour que les hôtesses/scanners puissent flasher les QR codes sans devoir se connecter avec votre compte Google.
                        </span>
                      </div>
                    </div>
                  </li>
                  <li>Cliquez sur <strong>Déployer</strong>.</li>
                  <li>
                    Copiez l'<strong>URL de l'application Web</strong> générée (se terminant par <code className="bg-white px-1.5 py-0.5 rounded border text-xs font-mono">/exec</code>).
                  </li>
                </ol>
              </div>

              <div className="bg-slate-900 text-white rounded-lg p-3 text-xs font-mono">
                <span className="text-slate-400 block mb-1">Exemple d'URL finale de test :</span>
                <span className="text-emerald-400 break-all select-all">
                  https://script.google.com/macros/s/AKfycb.../exec?id=MBR-0001&amp;action=entree
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 cursor-pointer"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 cursor-pointer"
              >
                <span>Étape suivante : Autorisations Google</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {activeStep === 5 && (
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Étape 5 sur 5</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Valider les autorisations de sécurité Google (OAuth)
              </h3>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <strong>Avertissement standard Google :</strong>
                  <p>
                    Lors du premier enregistrement du déclencheur ou du déploiement, Google affiche un message standard d'avertissement : <em>"Google n'a pas validé cette application"</em>. C'est tout à fait normal pour un script privé que vous venez de créer dans votre propre compte Google.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <p className="font-semibold text-slate-900">Comment franchir l'écran d'autorisation :</p>
                <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm">
                  <li>Choisissez votre compte Google actif.</li>
                  <li>Sur l'écran bleu ou blanc intitulé <em>"Google n'a pas validé cette application"</em>, cliquez en bas à gauche sur le lien discret : <strong>Paramètres avancés</strong> (ou <em>Advanced</em>).</li>
                  <li>Cliquez ensuite sur le lien : <strong>Accéder à [Nom de votre projet] (non sécurisé)</strong>.</li>
                  <li>Une liste des permissions requises apparaît :
                    <ul className="list-disc pl-4 mt-1 text-xs text-slate-600 space-y-0.5">
                      <li>Afficher et gérer vos feuilles de calcul Google Sheets</li>
                      <li>Envoyer des e-mails en votre nom (pour les badges d'inscription)</li>
                    </ul>
                  </li>
                  <li>Cliquez sur <strong>Autoriser</strong>.</li>
                </ol>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Félicitations !</strong> Votre système est 100% opérationnel. Vous pouvez maintenant basculer sur l'onglet <strong>"Feuille INSCRIPTIONS &amp; Pointage"</strong> ou <strong>"Scanner QR Jour J"</strong> pour tester le flux complet.
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 cursor-pointer"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-white font-medium text-xs hover:bg-slate-900 cursor-pointer"
              >
                <span>Recommencer la lecture</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
