import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateMemberId, 
  getQrCodeUrl, 
  getQrCodeFormula, 
  processCheckIn, 
  formatDateTime,
  calculateDashboardStats,
  exportMembersToCsv
} from './logic';
import { Member } from '../types';

test('generateMemberId starts at 0001 when list is empty', () => {
  const result = generateMemberId([]);
  assert.equal(result, 'MBR-0001');
});

test('generateMemberId increments the highest sequence number even if unordered', () => {
  const ids = ['MBR-0002', 'MBR-0001', 'MBR-0010', 'MBR-0005'];
  const nextId = generateMemberId(ids);
  assert.equal(nextId, 'MBR-0011');
});

test('generateMemberId supports custom prefix and padding', () => {
  const ids = ['EVT-01', 'EVT-08'];
  const nextId = generateMemberId(ids, 'EVT-', 2);
  assert.equal(nextId, 'EVT-09');
});

test('getQrCodeUrl builds valid API URL with size and data', () => {
  const url = getQrCodeUrl('MBR-0042', 200);
  assert.equal(url, 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MBR-0042');
});

test('getQrCodeFormula produces valid Google Sheets formula referencing column I', () => {
  const formula = getQrCodeFormula(15);
  assert.equal(
    formula,
    '=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" & I15)'
  );
});

test('processCheckIn validates attendee entry and sets timestamp', () => {
  const mockMembers: Member[] = [
    {
      rowNumber: 2,
      horodateur: '03/11/2026 09:00:00',
      nom: 'Dupont',
      prenom: 'Claire',
      email: 'claire.dupont@ch-hopital.fr',
      titre: 'Infirmier',
      institution: 'CHU de Liège',
      regime: 'Aucun',
      cotisation: 'Oui',
      id: 'MBR-0001',
      qrCodeUrl: getQrCodeUrl('MBR-0001'),
      statut: 'Inscrit',
      heureEntree: '',
      heureSortie: '',
    },
  ];

  const { updatedMembers, response } = processCheckIn(
    mockMembers,
    'mbr-0001',
    'entree',
    '03/11/2026 08:45:00'
  );

  assert.equal(response.success, true);
  assert.equal(response.status, 'Présent');
  assert.equal(response.warning, undefined);
  assert.equal(updatedMembers[0].statut, 'Présent');
  assert.equal(updatedMembers[0].heureEntree, '03/11/2026 08:45:00');
  assert.equal(updatedMembers[0].heureSortie, '');
});

test('processCheckIn records sortie and adds warning if cotisation is Non', () => {
  const mockMembers: Member[] = [
    {
      rowNumber: 3,
      horodateur: '03/11/2026 09:15:00',
      nom: 'Martin',
      prenom: 'Alexandre',
      email: 'alex.martin@pharma.be',
      titre: 'Pharmacien',
      institution: 'Pharmacie Centrale',
      regime: 'Végé',
      cotisation: 'Non',
      id: 'MBR-0002',
      qrCodeUrl: getQrCodeUrl('MBR-0002'),
      statut: 'Présent',
      heureEntree: '03/11/2026 09:00:00',
      heureSortie: '',
    },
  ];

  const { updatedMembers, response } = processCheckIn(
    mockMembers,
    'MBR-0002',
    'sortie',
    '03/11/2026 17:30:00'
  );

  assert.equal(response.success, true);
  assert.equal(response.status, 'Sorti');
  assert.ok(response.warning?.includes('Cotisation non réglée'));
  assert.equal(updatedMembers[0].statut, 'Sorti');
  assert.equal(updatedMembers[0].heureEntree, '03/11/2026 09:00:00');
  assert.equal(updatedMembers[0].heureSortie, '03/11/2026 17:30:00');
});

test('processCheckIn fails cleanly if ID does not exist', () => {
  const mockMembers: Member[] = [];
  const { updatedMembers, response } = processCheckIn(mockMembers, 'MBR-9999', 'entree');

  assert.equal(response.success, false);
  assert.equal(updatedMembers.length, 0);
  assert.ok(response.message.includes('MBR-9999'));
});

test('calculateDashboardStats correctly counts and aggregates metrics', () => {
  const members: Member[] = [
    {
      rowNumber: 2,
      horodateur: '03/11/2026 09:00:00',
      nom: 'A',
      prenom: 'B',
      email: 'a@b.com',
      titre: 'Infirmier',
      institution: 'CHU',
      regime: 'Végé',
      cotisation: 'Oui',
      id: 'MBR-0001',
      qrCodeUrl: '',
      statut: 'Présent',
      heureEntree: '09:00',
      heureSortie: '',
    },
    {
      rowNumber: 3,
      horodateur: '03/11/2026 09:10:00',
      nom: 'C',
      prenom: 'D',
      email: 'c@d.com',
      titre: 'Pharmacien',
      institution: 'Clinique',
      regime: 'Sans gluten',
      cotisation: 'Non',
      id: 'MBR-0002',
      qrCodeUrl: '',
      statut: 'Inscrit',
      heureEntree: '',
      heureSortie: '',
    },
  ];

  const stats = calculateDashboardStats(members);
  assert.equal(stats.total, 2);
  assert.equal(stats.presents, 1);
  assert.equal(stats.enAttente, 1);
  assert.equal(stats.sortis, 0);
  assert.equal(stats.nonCotisants, 1);
  assert.equal(stats.tauxPresence, 50);
  assert.equal(stats.byTitle['Infirmier'], 1);
  assert.equal(stats.byTitle['Pharmacien'], 1);
});

test('exportMembersToCsv formats 13 columns with header', () => {
  const members: Member[] = [
    {
      rowNumber: 2,
      horodateur: '03/11/2026 09:00:00',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@test.com',
      titre: 'Infirmier',
      institution: 'Hôpital',
      regime: 'Aucun',
      cotisation: 'Oui',
      id: 'MBR-0001',
      qrCodeUrl: 'https://api.qrserver.com/...',
      statut: 'Présent',
      heureEntree: '09:00:00',
      heureSortie: '',
    },
  ];

  const csv = exportMembersToCsv(members);
  assert.ok(csv.includes('Horodateur,Votre Nom,Votre Prénom'));
  assert.ok(csv.includes('"Dupont"'));
  assert.ok(csv.includes('"MBR-0001"'));
});

