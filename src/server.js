// DakarBank API — Serveur principal
// TP DevSecOps SUP de CO Dakar — Cours 2INF2311
// ⚠️  Ce code contient des vulnérabilités INTENTIONNELLES à des fins pédagogiques
// ⚠️  Ne jamais déployer en production

const express = require('express');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ VULN 1 — Security Misconfiguration : aucun header de sécurité
// Fix : app.use(require('helmet')());

// ❌ VULN 2 — Secrets hardcodés en clair dans le code source
const JWT_SECRET      = "dakarbank_secret_2024";
const DB_PASSWORD     = "root1234";
const SMTP_PASSWORD   = "smtpP@ssw0rd!";
const ENCRYPTION_KEY  = "AES128bitKeyDakar";
const ADMIN_API_KEY   = "dk_live_adminKey987654321xyz";

// ❌ VULN 3 — CORS trop permissif (toutes les origines autorisées)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// ❌ VULN 4 — Logs qui exposent des données sensibles
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', JSON.stringify(req.body)); // ❌ Peut logger des MDP !
  console.log('Headers:', req.headers);           // ❌ Expose les tokens JWT
  next();
});

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/accounts',     require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/clients',      require('./routes/clients'));
app.use('/api/admin',        require('./routes/admin'));

// ❌ VULN 5 — Stack trace exposée en production
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:   err.message,
    stack:   err.stack,   // ❌ Jamais exposer la stack en production !
    version: process.version,
    env:     process.env.NODE_ENV,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DakarBank API démarrée sur le port ${PORT}`);
  console.log(`JWT_SECRET utilisé : ${JWT_SECRET}`); // ❌ Secret loggé !
});

module.exports = app;
