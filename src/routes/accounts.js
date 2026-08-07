// Route comptes bancaires — vulnérabilités intentionnelles
const express = require('express');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

// Middleware auth minimal
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });
  try {
    // ❌ Pas de vérification de l'algorithme → algorithm:none possible
    req.user = jwt.verify(token, 'dakarbank_secret_2024');
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
};

// ❌ VULN 1 — IDOR : accès au solde de n'importe quel compte
// Un client peut consulter le solde de n'importe quel autre client
router.get('/:id/solde', auth, (req, res) => {
  // ❌ Aucune vérification que req.params.id appartient à req.user.id
  db.get(
    'SELECT id, numero_compte, solde, type_compte FROM comptes WHERE id = ?',
    [req.params.id],
    (err, compte) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!compte) return res.status(404).json({ error: 'Compte introuvable' });
      res.json(compte); // ❌ Retourne le solde de n'importe quel compte !
    }
  );
});

// ❌ VULN 2 — IDOR : modification du plafond de retrait par un client
router.put('/:id/plafond', auth, (req, res) => {
  const { plafond } = req.body;

  // ❌ Pas de vérification de propriété ni de rôle admin
  db.run(
    `UPDATE comptes SET plafond_retrait = ${plafond} WHERE id = ${req.params.id}`,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Plafond modifié', id: req.params.id, plafond });
    }
  );
});

// ❌ VULN 3 — Tampering : création d'un virement avec montant côté client
router.post('/virement', auth, (req, res) => {
  const { compteSource, compteDest, montant, motif } = req.body;
  // ❌ Le montant vient directement du client sans validation
  // Un attaquant peut envoyer montant:-1000 pour créditer son compte

  if (!compteSource || !compteDest || !montant) {
    return res.status(400).json({ error: 'Paramètres manquants' });
  }

  // ❌ Injection SQL sur le virement
  const query = `INSERT INTO transactions
    (compte_source, compte_dest, montant, motif, statut, created_at)
    VALUES ('${compteSource}', '${compteDest}', ${montant}, '${motif}', 'validé', datetime('now'))`;

  db.run(query, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      message: 'Virement effectué',
      id: this.lastID,
      montant, // ❌ Montant client reflété sans validation
    });
  });
});

// ❌ VULN 4 — Tous les comptes accessibles sans filtre propriétaire
router.get('/', auth, (req, res) => {
  // ❌ Retourne TOUS les comptes bancaires à n'importe quel client connecté
  db.all('SELECT * FROM comptes', (err, comptes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(comptes);
  });
});

module.exports = router;
