# Tableau de Bord Événement & Pointage QR Code (Google Apps Script)

Application web interactive de gestion des inscriptions et pointage de présence en temps réel via QR codes pour événements, congrès et journées scientifiques.

![Aperçu du Tableau de Bord](https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EVENT-DEMO)

---

## 🚀 Fonctionnalités Clés

- **Tableau de Bord Live** : 4 compteurs en temps réel (Total Inscrits, Présents en salle, Sorties, Cotisations non réglées).
- **Scanner QR Code Connecté** : Décodage caméra temps réel (`jsQR`), bascule Entrée / Sortie, feedback sonore (`Web Audio API`), et synchronisation directe avec l'API Web App Google Apps Script.
- **Feuille INSCRIPTIONS (13 colonnes)** : Vue tabulaire complète synchronisée, recherche, filtres et export en CSV.
- **Aperçu E-mail & Badges** : Badge imprimable et gabarit d'e-mail envoyé aux participants avec QR code dynamique.
- **Code.gs Inclus** : Script complet avec déclencheur `onFormSubmit` (LockService anti-doublon, IDs séquentiels `MBR-0001`, formule `=IMAGE(...)`).

---

## 📦 Déploiement Gratuit sur GitHub Pages

Ce projet intègre un flux **GitHub Actions** automatisé (`.github/workflows/deploy.yml`).

### Procédure :
1. Créez un nouveau dépôt sur [GitHub](https://github.com/new).
2. Poussez ce code sur votre branche `main` :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Event QR Dashboard"
   git branch -M main
   git remote add origin https://github.com/VOTRE_PSEUDO/VOTRE_DEPOT.git
   git push -u origin main
   ```
3. Rendez-vous sur votre dépôt GitHub dans **Settings > Pages**.
4. Dans **Build and deployment > Source**, sélectionnez : **GitHub Actions**.
5. L'action démarre automatiquement. En 1 minute, votre tableau de bord sera disponible en ligne sur :  
   `https://VOTRE_PSEUDO.github.io/VOTRE_DEPOT/`

---

## ⚡ Autres Options de Déploiement Rapide (1 clic)

- **Vercel** : Importez votre dépôt GitHub sur [vercel.com](https://vercel.com), la configuration Vite est détectée automatiquement (`npm run build`, dossier de sortie `dist`).
- **Netlify** : Glissez le dossier `dist` ou connectez votre GitHub.

---

## 💻 Lancer le projet en local

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_PSEUDO/VOTRE_DEPOT.git
cd VOTRE_DEPOT

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application s'ouvre sur `http://localhost:3000`.

---

## 🔗 Connexion avec Google Apps Script

1. Déployez votre script Google Apps Script en tant qu'**Application Web** avec les options :
   - *Exécuter en tant que :* **Moi**
   - *Qui a accès :* **N'importe qui (Anyone)**
2. Dans le tableau de bord web, ouvrez l'onglet **Scanner QR Code (Connecté)**.
3. Cliquez sur **"Configurer l'URL"** et collez votre URL se terminant par `/exec`.
4. Cliquez sur **"Tester"**. Votre scanner est maintenant directement connecté à votre feuille Google Sheets !
