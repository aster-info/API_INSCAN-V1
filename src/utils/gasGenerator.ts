import { GasConfig } from '../types';

export const DEFAULT_GAS_CONFIG: GasConfig = {
  sheetName: 'INSCRIPTIONS',
  idPrefix: 'MBR-',
  idPadding: 4,
  eventName: 'Journée Scientifique & Médicale 2026',
  organizerName: "Comité d'Organisation",
  organizerEmail: 'contact@evenement-sante.org',
  eventDate: 'Samedi 14 Novembre 2026 à 08h30',
  eventLocation: 'Palais des Congrès - Auditoire Pasteur',
};

/**
 * Generate full Google Apps Script (Code.gs) ready to deploy.
 */
export function generateCodeGs(config: GasConfig = DEFAULT_GAS_CONFIG): string {
  return `/**
 * ==============================================================================
 * SYSTÈME D'INSCRIPTION & POINTAGE DE PRÉSENCE PAR QR CODE (GOOGLE APPS SCRIPT)
 * ==============================================================================
 * 
 * Événement : ${config.eventName}
 * Onglet cible : ${config.sheetName}
 * 
 * STRUCTURE DES COLONNES DE LA FEUILLE "${config.sheetName}" :
 *  - Colonne A (1)  : Horodateur
 *  - Colonne B (2)  : Votre Nom
 *  - Colonne C (3)  : Votre Prénom
 *  - Colonne D (4)  : Votre Adresse Email
 *  - Colonne E (5)  : Votre Titre (Infirmier, Auxiliaire, Pharmacien, Autre)
 *  - Colonne F (6)  : Votre Institution
 *  - Colonne G (7)  : Régime alimentaire (Aucun, Végé, Végan, Allergène, etc.)
 *  - Colonne H (8)  : Êtes-vous en ordre de cotisation ? (Oui / Non)
 *  - Colonne I (9)  : Numéro de Membre (ex: ${config.idPrefix}0001)
 *  - Colonne J (10) : QR Code (=IMAGE(...))
 *  - Colonne K (11) : Statut du membre (Inscrit, Présent, Sorti)
 *  - Colonne L (12) : Heure d'entrée
 *  - Colonne M (13) : Heure de sortie
 * ==============================================================================
 */

// --- CONFIGURATION GÉNÉRALE DU SYSTÈME ---
const CONFIG = {
  SHEET_NAME: "${config.sheetName}",
  ID_PREFIX: "${config.idPrefix}",
  ID_PADDING: ${config.idPadding}, // ${config.idPrefix}${'0'.repeat(Math.max(1, config.idPadding - 1))}1
  EVENT_NAME: "${config.eventName}",
  ORGANIZER_NAME: "${config.organizerName}",
  ORGANIZER_EMAIL: "${config.organizerEmail}",
  EVENT_DATE: "${config.eventDate}",
  EVENT_LOCATION: "${config.eventLocation}",
  
  // Index des colonnes (1-indexé pour l'API Google Sheets)
  COLS: {
    HORODATEUR: 1,    // Col A
    NOM: 2,           // Col B
    PRENOM: 3,        // Col C
    EMAIL: 4,         // Col D
    TITRE: 5,         // Col E
    INSTITUTION: 6,   // Col F
    REGIME: 7,        // Col G
    COTISATION: 8,    // Col H
    ID_MEMBRE: 9,     // Col I
    QR_CODE: 10,      // Col J
    STATUT: 11,       // Col K
    HEURE_ENTREE: 12, // Col L
    HEURE_SORTIE: 13  // Col M
  }
};

/**
 * Menu personnalisé dans Google Sheets lors de l'ouverture
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🎟️ Pointage & Inscriptions")
    .addItem("✨ Initialiser / Réparer les En-têtes", "initialiserFeuille")
    .addItem("🔄 Régénérer les IDs & QR codes manquants", "completerInscriptionsManquantes")
    .addSeparator()
    .addItem("🧪 Tester une inscription d'exemple", "testerInscription")
    .addToUi();
}

/**
 * 1. DÉCLENCHEUR D'INSCRIPTION : onFormSubmit
 * ------------------------------------------------------------------------------
 * Exécuté automatiquement à chaque soumission du Google Form associé.
 * Utilise un verrouillage (LockService) pour éviter tout doublon d'ID si deux
 * formulaires arrivent simultanément.
 */
function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  try {
    // Attendre jusqu'à 30 secondes pour acquérir le verrou
    lock.waitLock(30000);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      throw new Error("Onglet '" + CONFIG.SHEET_NAME + "' introuvable. Veuillez vérifier le nom de l'onglet.");
    }
    
    // Déterminer le numéro de la ligne soumise
    let row;
    if (e && e.range) {
      row = e.range.getRow();
    } else {
      // Fallback si déclenché manuellement : dernière ligne
      row = sheet.getLastRow();
    }
    
    // Si la ligne correspond à l'en-tête, ne rien faire
    if (row <= 1) return;
    
    // Vérifier si un ID existe déjà sur cette ligne (évite les réexécutions)
    const existingId = sheet.getRange(row, CONFIG.COLS.ID_MEMBRE).getValue();
    let memberId = existingId;
    
    if (!memberId) {
      // Calculer le prochain ID séquentiel (ex: MBR-0001)
      memberId = determinerProchainID(sheet);
      
      // 1. Écrire le Numéro de Membre (Colonne I)
      sheet.getRange(row, CONFIG.COLS.ID_MEMBRE).setValue(memberId);
      
      // 2. Insérer la formule QR Code dynamique (Colonne J)
      const qrFormula = '=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" & I' + row + ')';
      sheet.getRange(row, CONFIG.COLS.QR_CODE).setFormula(qrFormula);
      
      // 3. Initialiser le Statut sur "Inscrit" (Colonne K)
      sheet.getRange(row, CONFIG.COLS.STATUT).setValue("Inscrit");
      
      // Forcer la synchronisation des données dans la feuille
      SpreadsheetApp.flush();
    }
    
    // Récupérer les données du participant pour l'e-mail
    const rowData = sheet.getRange(row, 1, 1, 13).getValues()[0];
    const nom = rowData[CONFIG.COLS.NOM - 1] || "";
    const prenom = rowData[CONFIG.COLS.PRENOM - 1] || "";
    const email = rowData[CONFIG.COLS.EMAIL - 1] || "";
    const titre = rowData[CONFIG.COLS.TITRE - 1] || "";
    const institution = rowData[CONFIG.COLS.INSTITUTION - 1] || "";
    const regime = rowData[CONFIG.COLS.REGIME - 1] || "Aucun";
    const cotisation = rowData[CONFIG.COLS.COTISATION - 1] || "Non";
    
    // 4. Envoyer l'e-mail de confirmation avec le badge QR Code
    if (email && email.indexOf("@") !== -1) {
      envoyerEmailConfirmation({
        nom: nom,
        prenom: prenom,
        email: email,
        titre: titre,
        institution: institution,
        regime: regime,
        cotisation: cotisation,
        memberId: memberId
      });
    }
    
  } catch (error) {
    Logger.log("Erreur dans onFormSubmit : " + error.toString());
    console.error("Erreur dans onFormSubmit : " + error.toString());
  } finally {
    lock.releaseLock();
  }
}

/**
 * Calcule le prochain numéro séquentiel à attribuer (ex: MBR-0001, MBR-0002)
 */
function determinerProchainID(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return CONFIG.ID_PREFIX + padNumber(1, CONFIG.ID_PADDING);
  }
  
  // Lire toutes les valeurs existantes dans la colonne I
  const idValues = sheet.getRange(2, CONFIG.COLS.ID_MEMBRE, lastRow - 1, 1).getValues();
  let maxSeq = 0;
  const regex = new RegExp("^" + escapeRegex(CONFIG.ID_PREFIX) + "(\\\\d+)$", "i");
  
  for (let i = 0; i < idValues.length; i++) {
    const val = String(idValues[i][0]).trim();
    const match = val.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  
  return CONFIG.ID_PREFIX + padNumber(maxSeq + 1, CONFIG.ID_PADDING);
}

/**
 * Formatage des zéros d'un entier
 */
function padNumber(num, length) {
  let str = String(num);
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

function escapeRegex(string) {
  return string.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
}

/**
 * Envoie un e-mail HTML soigné au participant avec son badge et son QR code
 */
function envoyerEmailConfirmation(participant) {
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(participant.memberId);
  const fullName = (participant.prenom + " " + participant.nom).trim();
  const subject = "🎟️ Confirmation d'inscription & Votre Badge d'accès (" + participant.memberId + ")";
  
  const alertCotisation = participant.cotisation === "Non" ? \`
    <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #991B1B; font-weight: bold; font-size: 14px;">⚠️ Cotisation non réglée :</p>
      <p style="margin: 4px 0 0; color: #B91C1C; font-size: 13px;">Votre inscription indique que vous n'êtes pas encore en ordre de cotisation. Merci de régulariser à l'accueil le jour de l'événement.</p>
    </div>
  \` : '';

  const htmlBody = \`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px; color: #1F2937; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 30px 24px; text-align: center; }
      .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
      .header p { margin: 0; font-size: 14px; opacity: 0.9; }
      .content { padding: 28px 24px; }
      .badge-card { background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }
      .badge-id { display: inline-block; background: #1E3A8A; color: white; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 14px; letter-spacing: 1px; margin-bottom: 12px; }
      .qr-wrapper { margin: 12px 0; display: inline-block; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .qr-img { width: 170px; height: 170px; display: block; }
      .info-grid { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
      .info-grid td { padding: 8px 12px; border-bottom: 1px solid #E5E7EB; }
      .info-label { font-weight: 600; color: #4B5563; width: 40%; }
      .info-value { color: #111827; }
      .instructions { background: #EFF6FF; border-radius: 8px; padding: 14px 18px; margin-top: 20px; font-size: 13px; color: #1E40AF; line-height: 1.5; }
      .footer { background: #F9FAFB; padding: 16px 24px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>\${CONFIG.EVENT_NAME}</h1>
        <p>Confirmation officielle d'inscription</p>
      </div>
      
      <div class="content">
        <p style="font-size: 16px; margin-top: 0;">Bonjour <strong>\${fullName}</strong>,</p>
        <p>Nous vous confirmons avec plaisir votre inscription. Voici votre badge d'accès personnel pour l'événement :</p>
        
        <div class="badge-card">
          <div class="badge-id">\${participant.memberId}</div>
          <h2 style="margin: 0 0 4px 0; font-size: 18px; color: #0F172A;">\${fullName}</h2>
          <p style="margin: 0; color: #64748B; font-size: 13px;">\${participant.titre} — \${participant.institution}</p>
          
          <div class="qr-wrapper">
            <img src="\${qrUrl}" alt="QR Code Badge" class="qr-img" />
          </div>
          <p style="margin: 6px 0 0; font-size: 12px; color: #64748B;">Présentez ce QR code à l'accueil pour votre pointage en temps réel</p>
        </div>
        
        \${alertCotisation}
        
        <table class="info-grid">
          <tr><td class="info-label">📅 Date :</td><td class="info-value"><strong>\${CONFIG.EVENT_DATE}</strong></td></tr>
          <tr><td class="info-label">📍 Lieu :</td><td class="info-value">\${CONFIG.EVENT_LOCATION}</td></tr>
          <tr><td class="info-label">🍽️ Régime :</td><td class="info-value">\${participant.regime}</td></tr>
          <tr><td class="info-label">💳 Cotisation :</td><td class="info-value">\${participant.cotisation === 'Oui' ? '✅ En ordre' : '❌ À régler'}</td></tr>
        </table>
        
        <div class="instructions">
          <strong>ℹ️ Consignes pour le Jour J :</strong>
          <ul style="margin: 6px 0 0; padding-left: 20px;">
            <li>Gardez cet e-mail accessible sur votre smartphone ou imprimez ce message.</li>
            <li>À votre arrivée et à votre départ, présentez le QR code au scanner de pointage.</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        \${CONFIG.ORGANIZER_NAME} — Contact : \${CONFIG.ORGANIZER_EMAIL}
      </div>
    </div>
  </body>
  </html>
  \`;

  MailApp.sendEmail({
    to: participant.email,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * 2. API DE POINTAGE EN TEMPS RÉEL (doGet)
 * ------------------------------------------------------------------------------
 * Déployée en tant qu'Application Web ("Accessible à tous").
 * Paramètres d'URL attendus :
 *   - id     : Identifiant du membre (ex: MBR-0001)
 *   - action : "entree" ou "sortie"
 *   - format : "html" (par défaut pour smartphone) ou "json" (pour application)
 * 
 * Exemples d'appels :
 *   https://script.google.com/macros/s/.../exec?id=MBR-0001&action=entree
 *   https://script.google.com/macros/s/.../exec?id=MBR-0001&action=sortie&format=json
 */
function doGet(e) {
  return traiterPointage(e);
}

function doPost(e) {
  return traiterPointage(e);
}

function traiterPointage(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    
    // Récupérer et normaliser les paramètres
    const params = (e && e.parameter) ? e.parameter : {};
    const rawId = (params.id || "").trim();
    const action = (params.action || "entree").toLowerCase().trim();
    const format = (params.format || "html").toLowerCase().trim();
    
    // Validation des paramètres obligatoires
    if (!rawId) {
      return repondreErreur("Paramètre 'id' manquant dans l'URL. Exemple: ?id=MBR-0001&action=entree", format);
    }
    
    if (action !== "entree" && action !== "sortie") {
      return repondreErreur("Action invalide ('" + action + "'). Valeurs autorisées : 'entree' ou 'sortie'.", format);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (!sheet) {
      return repondreErreur("Onglet '" + CONFIG.SHEET_NAME + "' introuvable.", format);
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return repondreErreur("La feuille d'inscriptions est vide.", format);
    }
    
    // Chercher la ligne correspondant au membre
    const idValues = sheet.getRange(2, CONFIG.COLS.ID_MEMBRE, lastRow - 1, 1).getValues();
    let targetRow = -1;
    const searchId = rawId.toUpperCase();
    
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]).trim().toUpperCase() === searchId) {
        targetRow = i + 2; // +2 car index 0 = ligne 2 (après l'en-tête)
        break;
      }
    }
    
    if (targetRow === -1) {
      return repondreErreur("Membre introuvable avec l'identifiant '" + rawId + "'.", format);
    }
    
    // Récupérer les informations existantes du participant
    const rowValues = sheet.getRange(targetRow, 1, 1, 13).getValues()[0];
    const nom = rowValues[CONFIG.COLS.NOM - 1] || "";
    const prenom = rowValues[CONFIG.COLS.PRENOM - 1] || "";
    const fullName = (prenom + " " + nom).trim();
    const titre = rowValues[CONFIG.COLS.TITRE - 1] || "";
    const institution = rowValues[CONFIG.COLS.INSTITUTION - 1] || "";
    const cotisation = rowValues[CONFIG.COLS.COTISATION - 1] || "Non";
    
    // Formater l'horodatage actuel
    const timeZone = Session.getScriptTimeZone() || "Europe/Paris";
    const nowFormatted = Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy HH:mm:ss");
    
    // Appliquer la mise à jour selon l'action
    let nouveauStatut = "";
    if (action === "entree") {
      nouveauStatut = "Présent";
      // Mettre à jour Statut (col K) et Heure d'entrée (col L)
      sheet.getRange(targetRow, CONFIG.COLS.STATUT).setValue(nouveauStatut);
      sheet.getRange(targetRow, CONFIG.COLS.HEURE_ENTREE).setValue(nowFormatted);
    } else {
      nouveauStatut = "Sorti";
      // Mettre à jour Statut (col K) et Heure de sortie (col M)
      sheet.getRange(targetRow, CONFIG.COLS.STATUT).setValue(nouveauStatut);
      sheet.getRange(targetRow, CONFIG.COLS.HEURE_SORTIE).setValue(nowFormatted);
    }
    
    SpreadsheetApp.flush();
    
    const resultData = {
      success: true,
      action: action,
      memberId: searchId,
      nom: fullName,
      titre: titre,
      institution: institution,
      cotisation: cotisation,
      statut: nouveauStatut,
      timestamp: nowFormatted,
      message: (action === "entree" ? "Entrée validée" : "Sortie enregistrée") + " pour " + fullName
    };
    
    if (format === "json") {
      return ContentService.createTextOutput(JSON.stringify(resultData))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return creerPageConfirmationHtml(resultData);
    
  } catch (err) {
    return repondreErreur("Erreur interne du serveur : " + err.toString(), "html");
  } finally {
    lock.releaseLock();
  }
}

/**
 * Génère la page Web HTML responsive retournée après un scan de QR Code
 */
function creerPageConfirmationHtml(data) {
  const isEntree = data.action === "entree";
  const primaryColor = isEntree ? "#10B981" : "#3B82F6";
  const icon = isEntree ? "✅" : "👋";
  const titreAction = isEntree ? "ENTRÉE VALIDÉE" : "SORTIE ENREGISTRÉE";
  
  const cotisationBadge = data.cotisation === "Non" ? \`
    <div style="background: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5; padding: 10px 14px; border-radius: 8px; margin: 15px 0; font-size: 13px; text-align: left;">
      ⚠️ <strong>Attention :</strong> Ce membre n'est pas en ordre de cotisation.
    </div>
  \` : \`
    <div style="background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; padding: 8px 12px; border-radius: 8px; margin: 12px 0; font-size: 13px;">
      ✅ Cotisation à jour
    </div>
  \`;

  const html = \`
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>\${titreAction} - \${data.memberId}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 90vh; }
      .card { background: #1E293B; border-radius: 16px; padding: 28px 24px; max-width: 420px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); text-align: center; border: 1px solid #334155; }
      .badge-action { display: inline-block; background: \${primaryColor}; color: white; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; margin-bottom: 16px; }
      .member-id { font-size: 15px; color: #94A3B8; font-family: monospace; letter-spacing: 1px; }
      .name { font-size: 22px; font-weight: 700; margin: 6px 0; color: #FFFFFF; }
      .subtitle { color: #94A3B8; font-size: 14px; margin-bottom: 16px; }
      .time-box { background: #0F172A; border-radius: 10px; padding: 12px; margin: 16px 0; font-size: 14px; border: 1px solid #334155; }
      .time-label { color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
      .time-val { color: #38BDF8; font-weight: 600; font-size: 16px; margin-top: 2px; }
      .btn { display: inline-block; margin-top: 18px; padding: 10px 20px; background: #334155; color: #E2E8F0; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="font-size: 48px; margin-bottom: 8px;">\${icon}</div>
      <div class="badge-action">\${titreAction}</div>
      <div class="member-id">\${data.memberId}</div>
      <div class="name">\${data.nom}</div>
      <div class="subtitle">\${data.titre} — \${data.institution}</div>
      
      \${cotisationBadge}
      
      <div class="time-box">
        <div class="time-label">Horodatage enregistré</div>
        <div class="time-val">\${data.timestamp}</div>
      </div>
      
      <p style="color: #64748B; font-size: 12px; margin-top: 14px;">Feuille Google Sheets mise à jour en temps réel.</p>
    </div>
  </body>
  </html>
  \`;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle(titreAction + " - " + data.memberId)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Retourne une réponse d'erreur formatée en JSON ou HTML
 */
function repondreErreur(message, format) {
  if (format === "json") {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: message
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const html = \`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Erreur de pointage</title>
    <style>
      body { font-family: sans-serif; background: #0F172A; color: #F8FAFC; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
      .card { background: #1E293B; border-radius: 12px; padding: 24px; max-width: 400px; text-align: center; border: 1px solid #EF4444; }
      h2 { color: #EF4444; margin-top: 0; }
      p { color: #CBD5E1; font-size: 14px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <div style="font-size: 40px;">❌</div>
      <h2>Échec du pointage</h2>
      <p>\${message}</p>
    </div>
  </body>
  </html>
  \`;
  
  return HtmlService.createHtmlOutput(html)
    .setTitle("Erreur de pointage")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * FONCTION BONUS : Initialiser ou réparer la feuille avec les 13 colonnes
 */
function initialiserFeuille() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  
  const headers = [
    "Horodateur",
    "Votre Nom",
    "Votre Prénom",
    "Votre Adresse Email",
    "Votre Titre (Infirmier, Auxiliaire, Pharmacien, Autre)",
    "Votre Institution",
    "Régime alimentaire (Aucun, Végé, Végan, Allergène, Sans porc, Sans gluten)",
    "Êtes-vous en ordre de cotisation ? (Oui / Non)",
    "Numéro de Membre",
    "QR Code",
    "Statut du membre",
    "Heure d'entrée",
    "Heure de sortie"
  ];
  
  // Écrire les en-têtes
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Mettre en forme la ligne d'en-tête
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1E3A8A")
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  
  sheet.setFrozenRows(1);
  
  // Ajuster la hauteur de ligne
  sheet.setRowHeight(1, 35);
  
  SpreadsheetApp.getUi().alert("✅ Feuille '" + CONFIG.SHEET_NAME + "' initialisée avec succès avec les 13 colonnes requises !");
}

/**
 * FONCTION BONUS : Régénère les IDs et QR codes manquants pour les lignes existantes
 */
function completerInscriptionsManquantes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) return;
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  let count = 0;
  for (let r = 2; r <= lastRow; r++) {
    const idVal = sheet.getRange(r, CONFIG.COLS.ID_MEMBRE).getValue();
    if (!idVal) {
      const nextId = determinerProchainID(sheet);
      sheet.getRange(r, CONFIG.COLS.ID_MEMBRE).setValue(nextId);
      sheet.getRange(r, CONFIG.COLS.QR_CODE).setFormula('=IMAGE("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" & I' + r + ')');
      sheet.getRange(r, CONFIG.COLS.STATUT).setValue("Inscrit");
      count++;
    }
  }
  
  SpreadsheetApp.getUi().alert(count + " inscription(s) mise(s) à jour avec ID et QR Code !");
}

/**
 * FONCTION BONUS : Simuler une inscription test directement depuis l'éditeur
 */
function testerInscription() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    initialiserFeuille();
  }
  
  const nextRow = sheet.getLastRow() + 1;
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "Europe/Paris", "dd/MM/yyyy HH:mm:ss");
  
  // Ligne de test
  sheet.getRange(nextRow, 1, 1, 8).setValues([[
    now,
    "Martin",
    "Sophie",
    Session.getActiveUser().getEmail() || "test@example.com",
    "Infirmier",
    "CHU Pasteur",
    "Végé",
    "Oui"
  ]]);
  
  // Appeler onFormSubmit avec la plage créée
  onFormSubmit({
    range: sheet.getRange(nextRow, 1, 1, 8)
  });
  
  SpreadsheetApp.getUi().alert("🧪 Inscription test générée sur la ligne " + nextRow + " !");
}
`;
}
