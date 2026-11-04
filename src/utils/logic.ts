import { CheckInAction, CheckInResponse, Member, MemberStatus } from '../types';

/**
 * Format date in French standard DD/MM/YYYY HH:mm:ss
 */
export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}

/**
 * Compute the next sequential Member ID from existing list of IDs.
 * Scans all IDs matching the prefix, finds highest integer, increments by 1.
 * Default format: MBR-0001, MBR-0002, etc.
 */
export function generateMemberId(existingIds: string[], prefix = 'MBR-', padding = 4): string {
  let maxSeq = 0;
  const regex = new RegExp(`^${prefix}(\\d+)$`, 'i');

  for (const id of existingIds) {
    if (!id) continue;
    const match = id.trim().match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${nextSeq.toString().padStart(padding, '0')}`;
}

/**
 * Generate public QR code URL from member ID using api.qrserver.com
 */
export function getQrCodeUrl(id: string, size = 150): string {
  const safeId = encodeURIComponent(id.trim());
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${safeId}`;
}

/**
 * Generate the Google Sheets =IMAGE(...) formula for column J
 */
export function getQrCodeFormula(rowNumber: number): string {
  return `=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" & I${rowNumber})`;
}

/**
 * Execute check-in or check-out business logic on a list of members.
 * Pure logic function that matches what doGet(e) in Apps Script performs.
 */
export function processCheckIn(
  members: Member[],
  memberId: string,
  action: CheckInAction,
  currentTimeStr: string = formatDateTime()
): { updatedMembers: Member[]; response: CheckInResponse } {
  const normalizedId = memberId.trim().toUpperCase();
  const index = members.findIndex((m) => m.id.trim().toUpperCase() === normalizedId);

  if (index === -1) {
    return {
      updatedMembers: members,
      response: {
        success: false,
        action,
        memberId: normalizedId,
        status: 'Inscrit',
        timestamp: currentTimeStr,
        message: `Aucun membre trouvé avec l'identifiant ${normalizedId} dans la feuille.`,
      },
    };
  }

  const currentMember = members[index];
  const newStatus: MemberStatus = action === 'entree' ? 'Présent' : 'Sorti';

  const updatedMember: Member = {
    ...currentMember,
    statut: newStatus,
    heureEntree: action === 'entree' ? currentTimeStr : currentMember.heureEntree,
    heureSortie: action === 'sortie' ? currentTimeStr : currentMember.heureSortie,
  };

  const updatedMembers = [...members];
  updatedMembers[index] = updatedMember;

  const fullName = `${currentMember.prenom} ${currentMember.nom}`.trim();
  const cotisWarning =
    currentMember.cotisation === 'Non'
      ? '⚠️ Attention : Cotisation non réglée selon les données d\'inscription.'
      : undefined;

  const actionText = action === 'entree' ? 'Entrée validée' : 'Sortie enregistrée';

  return {
    updatedMembers,
    response: {
      success: true,
      action,
      memberId: updatedMember.id,
      memberName: fullName,
      memberTitle: updatedMember.titre,
      institution: updatedMember.institution,
      cotisation: updatedMember.cotisation,
      status: newStatus,
      timestamp: currentTimeStr,
      message: `${actionText} avec succès pour ${fullName} (${updatedMember.id}).`,
      warning: cotisWarning,
    },
  };
}

/**
 * Compute real-time dashboard metrics and distributions
 */
export function calculateDashboardStats(members: Member[]): {
  total: number;
  presents: number;
  sortis: number;
  enAttente: number;
  nonCotisants: number;
  tauxPresence: number;
  byTitle: Record<string, number>;
  byRegime: Record<string, number>;
} {
  const total = members.length;
  const presents = members.filter((m) => m.statut === 'Présent').length;
  const sortis = members.filter((m) => m.statut === 'Sorti').length;
  const enAttente = members.filter((m) => m.statut === 'Inscrit').length;
  const nonCotisants = members.filter((m) => m.cotisation === 'Non').length;
  const tauxPresence = total > 0 ? Math.round((presents / total) * 100) : 0;

  const byTitle: Record<string, number> = {};
  const byRegime: Record<string, number> = {};

  for (const m of members) {
    byTitle[m.titre] = (byTitle[m.titre] || 0) + 1;
    byRegime[m.regime] = (byRegime[m.regime] || 0) + 1;
  }

  return {
    total,
    presents,
    sortis,
    enAttente,
    nonCotisants,
    tauxPresence,
    byTitle,
    byRegime,
  };
}

/**
 * Generate CSV export text for all 13 columns
 */
export function exportMembersToCsv(members: Member[]): string {
  const headers = [
    'Horodateur',
    'Votre Nom',
    'Votre Prénom',
    'Votre Adresse Email',
    'Votre Titre',
    'Votre Institution',
    'Régime alimentaire',
    'Cotisation en ordre',
    'Numéro de Membre',
    'QR Code URL',
    'Statut',
    'Heure entrée',
    'Heure sortie',
  ];

  const escapeCell = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

  const rows = members.map((m) => [
    escapeCell(m.horodateur),
    escapeCell(m.nom),
    escapeCell(m.prenom),
    escapeCell(m.email),
    escapeCell(m.titre),
    escapeCell(m.institution),
    escapeCell(m.regime),
    escapeCell(m.cotisation),
    escapeCell(m.id),
    escapeCell(m.qrCodeUrl),
    escapeCell(m.statut),
    escapeCell(m.heureEntree),
    escapeCell(m.heureSortie),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
