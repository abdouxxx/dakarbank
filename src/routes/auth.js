// Route d'authentification — vulnérabilités intentionnelles
const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

// ❌ VULN 1 — SQL Injection sur le login
// L'email est concaténé directement dans la requête SQL
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // ❌ Concaténation directe → SQL Injection
  const query = `SELECT * FROM clients WHERE email='${email}' AND password='${password}'`;

  db.get(query, (err, client) => {
    if (err) {
      // ❌ Erreur SQL exposée directement au client
      return res.status(500).json({ error: err.message, query: query });
    }
    if (!client) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // ❌ VULN 2 — JWT sans expiration + secret faible hardcodé
    const token = jwt.sign(
      { id: client.id, email: client.email, role: client.role },
      'dakarbank_secret_2024', // ❌ Secret hardcodé + faible
      // Pas d'expiresIn → token valable indéfiniment
    );

    res.json({
      token,
      client: { id: client.id, email: client.email, role: client.role },
    });
  });
});

// ❌ VULN 3 — Inscription sans validation + MDP en clair
router.post('/register', (req, res) => {
  const { nom, prenom, email, password, telephone } = req.body;

  // ❌ MDP stocké en clair (pas de hachage)
  // ❌ Injection SQL sur l'inscription
  const query = `INSERT INTO clients (nom, prenom, email, password, telephone, role)
                 VALUES ('${nom}', '${prenom}', '${email}', '${password}', '${telephone}', 'client')`;

  db.run(query, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Compte créé', id: this.lastID });
  });
});

// ❌ VULN 4 — Réinitialisation MDP sans vérification d'identité
router.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body;

  // ❌ N'importe qui peut changer le MDP de n'importe quel compte
  // ❌ Pas de token de réinitialisation, pas d'email de confirmation
  const query = `UPDATE clients SET password='${newPassword}' WHERE email='${email}'`;

  db.run(query, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Mot de passe modifié', changes: this.changes });
  });
});

module.exports = router;
