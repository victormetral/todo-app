# Todo App

Application de gestion de tâches fullstack, créée pour apprendre les bonnes pratiques de développement : architecture en couches, tests unitaires, Docker et CI/CD.

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js + Express |
| Base de données | PostgreSQL 16 |
| Frontend | HTML / CSS / JS vanilla (servi par nginx) |
| Tests | Jest |
| Conteneurisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Registre d'images | GitHub Container Registry (ghcr.io) |

## Fonctionnalités

- Afficher toutes les tâches
- Créer une tâche avec un niveau de priorité (haute / moyenne / basse) et une date d'échéance optionnelle
- Modifier une tâche (mise à jour partielle — seuls les champs fournis sont modifiés)
- Supprimer une tâche
- Filtrer les tâches par statut (toutes / actives / complétées)
- Tri automatique par priorité (haute → moyenne → basse)
- Affichage de la date d'échéance, en rouge si dépassée

## Architecture backend

```
server.js → routes/tasks.js → controllers/tasks.js → services/taskService.js → config/db.js → PostgreSQL
```

## Installation locale (sans Docker)

### Prérequis

- Node.js 20+
- PostgreSQL 16

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/victormetral/todo-app.git
cd todo-app

# 2. Installer les dépendances backend
cd backend
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
nano .env
```

Renseigner les valeurs suivantes :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=<votre_utilisateur_postgres>
DB_PASSWORD=<votre_mot_de_passe_postgres>
PORT=3000
```

> Pour connaître votre utilisateur PostgreSQL : `psql -c "\du"`

```bash
# 4. Créer la base de données
createdb -U <votre_utilisateur_postgres> todo_db

# 5. Créer la table tasks
psql -U <votre_utilisateur_postgres> -d todo_db -f src/db/init.sql

# 6. Lancer le serveur
node server.js
```

Le frontend peut être ouvert directement dans un navigateur en ouvrant `frontend/index.html`.

## Installation avec Docker

### Prérequis

- Docker Desktop installé et démarré

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/victormetral/todo-app.git
cd todo-app

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env si nécessaire (les valeurs par défaut fonctionnent pour le développement)

# 3. Lancer les 3 conteneurs (base de données, backend, frontend)
docker compose up --build
```

### Vérification

Une fois les conteneurs démarrés :

- Frontend : http://localhost:8080
- API : http://localhost:3000/api/tasks

Si tout fonctionne, l'API retourne une liste JSON (vide `[]` ou avec des tâches).

## Structure du projet

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Pool de connexion PostgreSQL
│   │   ├── controllers/
│   │   │   └── tasks.js           # Gestion des requêtes HTTP
│   │   ├── routes/
│   │   │   └── tasks.js           # Définition des routes Express
│   │   ├── services/
│   │   │   ├── taskService.js     # Logique métier
│   │   │   └── __tests__/
│   │   │       └── taskService.test.js
│   │   └── db/
│   │       └── init.sql           # Script de création de la table
│   ├── server.js                  # Point d'entrée Express
│   ├── Dockerfile.backend
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js                     # Appels API et rendu DOM
│   └── Dockerfile.frontend
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Tests automatiques
│       └── cd.yml                 # Build et push Docker
└── docker-compose.yml
```

## Compétences travaillées

- **Architecture en couches** : séparation routes / controllers / services / db
- **API REST** : CRUD complet avec Express
- **Base de données** : PostgreSQL avec requêtes paramétrées (protection injection SQL)
- **Tests unitaires** : Jest avec mocks des dépendances
- **Conteneurisation** : Docker multi-conteneurs avec Docker Compose
- **CI/CD** : GitHub Actions — tests automatiques + build et publication d'images Docker

## Variables d'environnement

Copier `.env.example` à la racine et renommer en `.env` :

| Variable | Description | Exemple |
|---|---|---|
| `POSTGRES_DB` | Nom de la base de données (conteneur PostgreSQL) | `todo_db` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `votre_utilisateur_postgres` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `votre_mot_de_passe_postgres` |
| `DB_HOST` | Hôte de la base de données | `db` (nom du service Docker) |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base de données (backend) | `todo_db` |
| `DB_USER` | Utilisateur (backend) | `votre_utilisateur_postgres` |
| `DB_PASSWORD` | Mot de passe (backend) | `votre_mot_de_passe_postgres` |
| `PORT` | Port du serveur backend | `3000` |
| `API_URL` | URL du backend appelée par le frontend | `http://localhost:3000` |

## Routes API

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Récupérer toutes les tâches |
| `POST` | `/api/tasks` | Créer une nouvelle tâche |
| `PUT` | `/api/tasks/:id` | Modifier une tâche (partiel ou complet) |
| `DELETE` | `/api/tasks/:id` | Supprimer une tâche |

### Exemple de corps pour POST / PUT

```json
{
  "title": "Ma tâche",
  "completed": false,
  "priority": "high",
  "due_date": "2026-12-31"
}
```

- `priority` : `"low"`, `"medium"`, `"high"` (défaut : `"medium"`)
- `due_date` : date au format `YYYY-MM-DD`, optionnelle (défaut : `null`)

## Tests

```bash
cd backend
npm test
```

20 tests unitaires couvrant toutes les fonctions du service (`taskService.js`), incluant la validation de la priorité et de la date d'échéance.

## CI/CD

### CI — Tests automatiques

À chaque push sur `main` ou pull request, GitHub Actions lance les tests Jest.

### CD — Build et publication Docker

Après un CI vert, les images Docker sont buildées et publiées sur GitHub Container Registry :

```
ghcr.io/victormetral/todo-app-backend:latest
ghcr.io/victormetral/todo-app-frontend:latest
```
