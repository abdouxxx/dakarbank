<<<<<<< HEAD
# dakarbank
=======
# DakarBank API — TP DevSecOps
**Cours 2INF2311 — Sécurité Logicielle & DevSecOps**
**SUP de CO Dakar — Master 2 Génie Logiciel**

> ⚠️ **ATTENTION :** Ce code contient des vulnérabilités **intentionnelles** à des fins pédagogiques.
> Ne jamais déployer en production.

---

## 🎯 Objectif du TP

Construire une pipeline DevSecOps complète (GitHub Actions) qui détecte automatiquement les vulnérabilités présentes dans ce projet. **Vous devez écrire vos propres règles Semgrep** — aucune règle ne vous est fournie.

---

## 🏗️ Architecture

```
DakarBank API (Node.js + Express + SQLite)
├── src/
│   ├── server.js           ← Point d'entrée principal
│   ├── routes/
│   │   ├── auth.js         ← Authentification (login, register)
│   │   ├── accounts.js     ← Gestion des comptes bancaires
│   │   ├── transactions.js ← Virements et historique
│   │   ├── clients.js      ← Profils clients
│   │   └── admin.js        ← Routes administration
│   └── config/
│       └── database.js     ← SQLite
├── Dockerfile              ← Image non sécurisée
└── README.md
```

---

## 🔴 Vulnérabilités à Découvrir

> **Ne lisez pas cette section avant d'avoir terminé l'analyse.**
> Le but est que vos outils les trouvent automatiquement.

<details>
<summary>Cliquer pour révéler après le TP</summary>

| Fichier | Vulnérabilité | OWASP | Ligne |
|---------|--------------|-------|-------|
| `server.js` | 5 secrets hardcodés | A02 | 13-17 |
| `server.js` | CORS permissif, stack trace | A05 | 20-27 |
| `server.js` | Logs qui exposent MDP et tokens | A09 | 29-34 |
| `routes/auth.js` | SQL Injection login | A03 | 12 |
| `routes/auth.js` | SQL Injection register | A03 | 30 |
| `routes/auth.js` | JWT sans expiration | A07 | 20 |
| `routes/auth.js` | Reset MDP sans vérification | A07 | 40 |
| `routes/accounts.js` | IDOR solde | A01 | 17 |
| `routes/accounts.js` | IDOR plafond | A01 | 29 |
| `routes/accounts.js` | Tampering montant virement | A03 | 40 |
| `routes/transactions.js` | SQL Injection recherche | A03 | 12 |
| `routes/transactions.js` | XSS Stocké commentaire | A03 | 26 |
| `routes/transactions.js` | IDOR historique | A01 | 40 |
| `routes/clients.js` | Exposition données sensibles | A02 | 18 |
| `routes/clients.js` | Mass Assignment | A04 | 42 |
| `routes/admin.js` | Pas de contrôle rôle admin | A01 | 16 |
| `Dockerfile` | ROOT user, :latest, debug port | A05 | - |

</details>

---

## 🚀 Installation locale

```bash
git clone https://github.com/VOTRE_USERNAME/dakar-bank.git
cd dakar-bank
npm install
npm start
# → http://localhost:3000
```

## 🐳 Via Docker

```bash
docker build -t dakar-bank .
docker run -p 3000:3000 dakar-bank
```

---

## 🔑 Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@dakarbank.sn | admin1234 | admin |
| fatou@client.sn | fatou2024 | client |
| ibrahima@client.sn | ibra5678 | client |

---

## ⚙️ Ce que vous devez faire

1. **Forker** ce repo sur votre compte GitHub
2. **Analyser le code** manuellement pour comprendre les vulnérabilités
3. **Écrire les règles Semgrep** dans `.semgrep/rules.yaml`
4. **Construire la pipeline** dans `.github/workflows/devsecops.yml`
5. **Configurer les secrets** GitHub (SEMGREP_APP_TOKEN, SNYK_TOKEN)
6. **Analyser les résultats** dans Security → Code scanning
7. **Corriger 2 vulnérabilités** et vérifier qu'elles passent en Fixed
8. **Rédiger** `RAPPORT_TP.md`

---

## 📋 Livrables

- Lien du repo GitHub avec pipeline active
- Fichier `.semgrep/rules.yaml` avec au moins 3 règles custom
- Screenshots du Security tab
- `RAPPORT_TP.md` avec analyse + corrections

---

*SUP de CO Dakar — Cours 2INF2311*
>>>>>>> bdf241e (feat: add DevSecOps pipeline and custom Semgrep rules)
