// Configuration SQLite — DakarBank
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = path.join(__dirname, '../../dakarbank.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erreur connexion BDD:', err.message);
  } else {
    console.log('Connecté à SQLite — DakarBank');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {

    // Table clients
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nom       TEXT NOT NULL,
      prenom    TEXT NOT NULL,
      email     TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      telephone TEXT,
      nin       TEXT,
      role      TEXT DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table comptes
    db.run(`CREATE TABLE IF NOT EXISTS comptes (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id      INTEGER NOT NULL,
      numero_compte  TEXT UNIQUE NOT NULL,
      type_compte    TEXT DEFAULT 'courant',
      solde          REAL DEFAULT 0,
      plafond_retrait REAL DEFAULT 500000,
      agence         TEXT DEFAULT 'Dakar-Centre',
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table transactions
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      compte_source TEXT NOT NULL,
      compte_dest   TEXT NOT NULL,
      montant       REAL NOT NULL,
      motif         TEXT,
      statut        TEXT DEFAULT 'en_attente',
      agence        TEXT DEFAULT 'Dakar-Centre',
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Table commentaires
    db.run(`CREATE TABLE IF NOT EXISTS commentaires_transaction (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      contenu        TEXT NOT NULL,
      client_id      INTEGER NOT NULL,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Données de test — MDP en clair volontairement
    db.run(`INSERT OR IGNORE INTO clients (nom, prenom, email, password, telephone, nin, role)
            VALUES ('Diallo', 'Mamadou', 'admin@dakarbank.sn', 'admin1234', '+221771234567', 'SN-DK-001', 'admin')`);
    db.run(`INSERT OR IGNORE INTO clients (nom, prenom, email, password, telephone, nin, role)
            VALUES ('Ndiaye', 'Fatou', 'fatou@client.sn', 'fatou2024', '+221772345678', 'SN-DK-002', 'client')`);
    db.run(`INSERT OR IGNORE INTO clients (nom, prenom, email, password, telephone, nin, role)
            VALUES ('Fall', 'Ibrahima', 'ibrahima@client.sn', 'ibra5678', '+221773456789', 'SN-DK-003', 'client')`);

    db.run(`INSERT OR IGNORE INTO comptes (client_id, numero_compte, solde, type_compte)
            VALUES (1, 'DK-001-2024-ADMIN', 5000000, 'professionnel')`);
    db.run(`INSERT OR IGNORE INTO comptes (client_id, numero_compte, solde, type_compte)
            VALUES (2, 'DK-002-2024-FATOU', 250000, 'courant')`);
    db.run(`INSERT OR IGNORE INTO comptes (client_id, numero_compte, solde, type_compte)
            VALUES (3, 'DK-003-2024-IBRA', 180000, 'epargne')`);

    db.run(`INSERT OR IGNORE INTO transactions (compte_source, compte_dest, montant, motif, statut)
            VALUES ('DK-002-2024-FATOU', 'DK-003-2024-IBRA', 50000, 'Remboursement prêt', 'validé')`);
    db.run(`INSERT OR IGNORE INTO transactions (compte_source, compte_dest, montant, motif, statut)
            VALUES ('DK-003-2024-IBRA', 'DK-002-2024-FATOU', 25000, 'Loyer mars 2024', 'validé')`);
  });
}

module.exports = db;
