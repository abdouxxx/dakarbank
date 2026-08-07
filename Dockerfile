# ⚠️  Dockerfile NON sécurisé — vulnérabilités intentionnelles pour le TP DevSecOps
# Les étudiants doivent identifier et corriger ces problèmes

# ❌ VULN 1 — Image de base non spécifique (:latest implicite)
FROM node:18

# ❌ VULN 2 — Exécution en tant que root (jamais en production)
# Fix : USER node

WORKDIR /app

# ❌ VULN 3 — Copie de TOUT le répertoire (inclut .env, .git, secrets)
COPY . .

# ❌ VULN 4 — npm install au lieu de npm ci (non reproductible)
RUN npm install

# ❌ VULN 5 — Variables d'environnement sensibles hardcodées dans l'image
ENV JWT_SECRET="dakarbank_secret_2024"
ENV DB_PASSWORD="root1234"
ENV ENCRYPTION_KEY="AES128bitKeyDakar"

# ❌ VULN 6 — Port de debug Node.js exposé
EXPOSE 3000
EXPOSE 9229

# ❌ VULN 7 — Démarrage en mode debug
CMD ["node", "--inspect=0.0.0.0:9229", "src/server.js"]
