// Route clients — vulnérabilités intentionnelles
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

// ❌ VULN 1 — Exposition de TOUS les clients à tout utilisateur connecté
// Un simple client peut voir tous les comptes de la banque
router.get('/', auth, (req, res) => {
  // ❌ Pas de vérification du rôle admin
  // ❌ Retourne MDP, NIN, données sensibles
  db.all(
    'SELECT id, nom, prenom, email, password, telephone, nin, role FROM clients',
    (err, clients) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(clients); // ❌ Expose les mots de passe et NIN de tous les clients !
    }
  );
});

// ❌ VULN 2 — IDOR : accès au profil complet de n'importe quel client
router.get('/:id', auth, (req, res) => {
  // ❌ Aucune vérification que req.params.id === req.user.id
  db.get(
    'SELECT * FROM clients WHERE id = ?',
    [req.params.id],
    (err, client) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(client); // ❌ Retourne MDP, NIN, numéro de téléphone...
    }
  );
});

// ❌ VULN 3 — Mass Assignment : mise à jour sans whitelist
router.put('/:id', auth, (req, res) => {
  const updates = req.body;
  // ❌ L'attaquant peut passer role:'admin' ou solde:1000000

  const fields = Object.keys(updates)
    .map(k => `${k} = '${updates[k]}'`) // ❌ SQLi possible
    .join(', ');

  db.run(
    `UPDATE clients SET ${fields} WHERE id = ${req.params.id}`,
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profil mis à jour', changes: this.changes });
    }
  );
});

// ❌ VULN 4 — Recherche client avec SQLi
router.get('/search/:terme', auth, (req, res) => {
  const { terme } = req.params;

  // ❌ Concaténation directe
  db.all(
    `SELECT id, nom, prenom, email FROM clients WHERE nom LIKE '%${terme}%' OR prenom LIKE '%${terme}%'`,
    (err, clients) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(clients);
    }
  );
});

module.exports = router;
