# 🐳 AutoCare-AI - DevOps & Docker Guide

Ce guide documente l'architecture DevOps mise en place pour le projet **AutoCare-AI**.

---

## 🏗️ 1. Architecture des Conteneurs

Le système est conteneurisé sous forme de micro-services reliés par un réseau Docker interne (`autocare_network`) :

```
                        ┌────────────────────────┐
                        │   Navigateur Client    │
                        └───────────┬────────────┘
                                    │ Port 80
                                    ▼
                        ┌────────────────────────┐
                        │     autocare-admin     │
                        │    (Nginx + React)     │
                        └───────────┬────────────┘
                                    │ Proxy /api/ -> :8080
                                    ▼
                        ┌────────────────────────┐
                        │    autocare-backend    │
                        │ (Spring Boot / Java 21)│
                        └───────────┬────────────┘
                                    │ Port 5432
                                    ▼
                        ┌────────────────────────┐
                        │   autocare-postgres    │
                        │     (PostgreSQL 16)    │
                        └────────────────────────┘
```

---

## 🚀 2. Démarrage Rapide

### Prérequis
- Docker Desktop installé et démarré
- Docker Compose v2+

### Étapes

1. **Créer le fichier d'environnement :**
   ```bash
   cp .env.docker.example .env
   ```

2. **Lancer tous les services :**
   ```bash
   docker compose up -d --build
   ```

3. **Vérifier l'état des conteneurs :**
   ```bash
   docker compose ps
   ```

4. **Accès aux services :**
   - **Portail Web Admin :** [http://localhost](http://localhost)
   - **API REST Backend :** [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
   - **Base PostgreSQL :** `localhost:5432` (Base: `autocare`)

5. **Arrêter les services :**
   ```bash
   docker compose down
   # ou avec suppression des volumes de données :
   docker compose down -v
   ```

---

## 🔄 3. Pipeline CI/CD (GitHub Actions)

Le workflow se trouve dans `.github/workflows/ci.yml` et comprend 4 jobs automatisés :
1. **Secret Guard :** Détection et blocage immédiat de tout fichier de clés `.env` non autorisé.
2. **Backend CI :** Compilation avec JDK 21 (Temurin), exécution des tests JUnit 5 et build du JAR.
3. **Admin CI :** Installation Node 20, vérification Lint et build production Vite.
4. **Docker Verification :** Construction et test d'intégrité des images Docker backend et frontend.
