// Route admin — vulnérabilités intentionnelles
const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });
  try {
    req.user = jwt.verify(token, 'dakarbank_secret_2024');
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// ❌ VULN 1 — Pas de vérification du rôle admin
// N'importe quel client connecté peut accéder aux routes admin
router.get('/stats', auth, (req, res) => {
  // ❌ req.user.role n'est jamais vérifié
  db.all(`
    SELECT
      COUNT(*) as total_clients,
      SUM(solde) as total_actifs,
      AVG(solde) as solde_moyen
    FROM comptes
  `, (err, stats) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(stats[0]);
  });
});

// ❌ VULN 2 — Suppression de compte sans vérification admin
router.delete('/clients/:id', auth, (req, res) => {
  // ❌ Tout utilisateur connecté peut supprimer n'importe quel compte
  db.run(
    `DELETE FROM clients WHERE id = ${req.params.id}`,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Client supprimé', id: req.params.id });
    }
  );
});

// ❌ VULN 3 — Crédit/Débit direct sans audit trail
router.post('/ajustement', auth, (req, res) => {
  const { compteId, montant, type } = req.body;

  // ❌ Pas de vérification admin, pas de log d'audit
  // ❌ Tampering : montant vient du client
  const operation = type === 'credit'
    ? `UPDATE comptes SET solde = solde + ${montant} WHERE id = ${compteId}`
    : `UPDATE comptes SET solde = solde - ${montant} WHERE id = ${compteId}`;

  db.run(operation, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message:  `${type} effectué`,
      compteId,
      montant,
      changes: this.changes,
    });
  });
});

// ❌ VULN 4 — Rapport financier avec SQLi
router.get('/rapport', auth, (req, res) => {
  const { dateDebut, dateFin, agence } = req.query;

  const query = `
    SELECT t.*, c.nom, c.prenom
    FROM transactions t
    JOIN clients c ON t.compte_source = c.id
    WHERE t.created_at BETWEEN '${dateDebut}' AND '${dateFin}'
    AND t.agence = '${agence}'
    ORDER BY t.created_at DESC
  `;

  db.all(query, (err, rapport) => {
    if (err) return res.status(500).json({ error: err.message, query });
    res.json(rapport);
  });
});

module.exports = router;
