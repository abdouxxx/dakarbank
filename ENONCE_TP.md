# ÉNONCÉ TP — Pipeline DevSecOps sur DakarBank
**Module :** Sécurité Logicielle & DevSecOps (2INF2311)
**SUP de CO Dakar — Master 2 Génie Logiciel**[devsecops.yml](.github/workflows/devsecops.yml)
**Durée :** 2 heures | **Barème :** 20 points

---

## Contexte

Vous êtes recrutés comme ingénieur DevSecOps par **DakarBank**, une fintech sénégalaise.
Le développeur précédent a livré une API bancaire en Node.js sans aucun contrôle de sécurité.
Votre mission : mettre en place une pipeline CI/CD qui détecte automatiquement les vulnérabilités.

**Repo de base :** à forker depuis l'URL fournie par l'enseignant.

---

## Travail Demandé

### Partie 1 — Analyse manuelle du code (sans outil) (4 pts)

Avant de lancer les outils, lisez le code source du projet.

**Q1.1 (2 pts)** — Listez 4 vulnérabilités que vous identifiez visuellement dans les fichiers source.
Pour chaque vulnérabilité : fichier, ligne approximative, type de faille (OWASP ou CWE), impact.

**Q1.2 (2 pts)** — Dans `src/routes/auth.js`, le login est vulnérable à une SQL Injection.
Rédigez le payload exact qu'un attaquant utiliserait pour se connecter en tant qu'admin
sans connaître son mot de passe.

---

### Partie 2 — Règles Semgrep Custom (6 pts)

Créez le fichier `.semgrep/rules.yaml` contenant **au moins 3 règles** qui détectent
les vulnérabilités spécifiques au code DakarBank.

**Contraintes :**
- Les règles doivent détecter effectivement des vulnérabilités dans ce projet
- Chaque règle doit avoir : `id`, `pattern`, `message`, `languages`, `severity`, `metadata.cwe`
- Vous ne pouvez pas copier les règles du TP précédent — les patterns doivent cibler le code DakarBank

**Barème :**
- Règle 1 fonctionnelle : 2 pts
- Règle 2 fonctionnelle : 2 pts
- Règle 3 fonctionnelle : 2 pts

---

### Partie 3 — Pipeline GitHub Actions (7 pts)

Créez le fichier `.github/workflows/devsecops.yml` avec les jobs suivants :

| Job | Outil | Points |
|-----|-------|--------|
| SAST | Semgrep (avec vos règles custom) | 2 pts |
| SCA | Snyk **ou** Trivy filesystem | 2 pts |
| Build | Docker image | 1 pt |
| Scan image | Trivy image | 1 pt |
| Summary | Résumé dans GitHub Actions | 1 pt |

**Tous les résultats doivent être uploadés en SARIF dans GitHub Security.**

---

### Partie 4 — Corrections (3 pts)

Corrigez **2 vulnérabilités** détectées par votre pipeline.

- Correction 1 : SQLi dans `src/routes/auth.js` (login)
- Correction 2 : Secret hardcodé dans `src/server.js`

Après correction : pusher → vérifier que les alertes passent en **Fixed** dans Security tab.

---

## Livrables

1. **Lien du repo GitHub** avec pipeline active (obligatoire)
2. **`.semgrep/rules.yaml`** avec ≥ 3 règles custom
3. **Screenshot Security tab** montrant les alertes détectées
4. **`RAPPORT_TP.md`** structuré comme suit :

```markdown
# RAPPORT_TP — DakarBank DevSecOps

**Étudiant(e) :** [Nom Prénom]
**Date :** [JJ/MM/AAAA]
**Repo :** [URL GitHub]

## 1. Analyse manuelle
[Réponses Q1.1 et Q1.2]

## 2. Règles Semgrep
[Explication de chaque règle : quoi, pourquoi, quelle vulnérabilité ciblée]

## 3. Résultats de la pipeline
| Outil | Vulnérabilité | Fichier | Ligne | Sévérité |
|-------|--------------|---------|-------|----------|

## 4. Corrections appliquées
[Code avant → code après pour chaque correction]

## 5. Leçons retenues
[3 points clés appris pendant ce TP]
```

---

## Barème Récapitulatif

| Partie | Critère | Points |
|--------|---------|--------|
| Analyse manuelle | 4 vulnérabilités identifiées + payload SQLi | 4 pts |
| Règles Semgrep | 3 règles custom fonctionnelles | 6 pts |
| Pipeline | 5 jobs actifs avec SARIF | 7 pts |
| Corrections | 2 alertes Fixed dans Security tab | 3 pts |
| **TOTAL** | | **20 pts** |

---

*SUP de CO Dakar — Cours 2INF2311*
