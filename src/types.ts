export type MemberTitle = 'Infirmier' | 'Auxiliaire' | 'Pharmacien' | 'Autre' | string;
export type DietaryRequirement = 'Aucun' | 'Végé' | 'Végan' | 'Allergène' | 'Sans porc' | 'Sans gluten';
export type CotisationStatus = 'Oui' | 'Non';
export type MemberStatus = 'Inscrit' | 'Présent' | 'Sorti';
export type CheckInAction = 'entree' | 'sortie';

export interface Member {
  rowNumber: number;
  horodateur: string;
  nom: string;
  prenom: string;
  email: string;
  titre: MemberTitle;
  institution: string;
  regime: DietaryRequirement;
  cotisation: CotisationStatus;
  id: string; // e.g. MBR-0001
  qrCodeUrl: string; // API URL or formula
  statut: MemberStatus;
  heureEntree: string;
  heureSortie: string;
}

export interface CheckInResponse {
  success: boolean;
  action: CheckInAction;
  memberId: string;
  memberName?: string;
  memberTitle?: string;
  institution?: string;
  cotisation?: CotisationStatus;
  status: MemberStatus;
  timestamp: string;
  message: string;
  warning?: string;
  fromGoogleAppsScript?: boolean;
}

export interface GasConfig {
  sheetName: string;
  idPrefix: string;
  idPadding: number;
  eventName: string;
  organizerName: string;
  organizerEmail: string;
  eventDate: string;
  eventLocation: string;
}

export interface DashboardStats {
  total: number;
  presents: number;
  sortis: number;
  enAttente: number;
  nonCotisants: number;
  tauxPresence: number;
  byTitle: Record<string, number>;
  byRegime: Record<string, number>;
}

export interface GasConnectionState {
  webAppUrl: string;
  isConnected: boolean;
  isTesting: boolean;
  lastTestMessage?: string;
  lastTestedAt?: string;
}
