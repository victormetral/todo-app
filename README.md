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
- Créer une tâche
- Modifier une tâche (mise à jour partielle — seuls les champs fournis sont modifiés)
- Supprimer une tâche

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
# Éditer .env avec tes valeurs locales

# 4. Créer la table dans PostgreSQL
psql -U <user> -d <database> -f src/db/init.sql

# 5. Lancer le serveur
node server.js
```

Le frontend peut être ouvert directement dans un navigateur en ouvrant `frontend/index.html`.

## Installation avec Docker

### Prérequis

- Docker Desktop

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

- Frontend : http://localhost:8080
- API : http://localhost:3000

## Variables d'environnement

Copier `.env.example` à la racine et renommer en `.env` :

| Variable | Description | Exemple |
|---|---|---|
| `POSTGRES_DB` | Nom de la base de données (conteneur PostgreSQL) | `todo_db` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `changeme` |
| `DB_HOST` | Hôte de la base de données | `db` (nom du service Docker) |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base de données (backend) | `todo_db` |
| `DB_USER` | Utilisateur (backend) | `postgres` |
| `DB_PASSWORD` | Mot de passe (backend) | `changeme` |
| `PORT` | Port du serveur backend | `3000` |

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
  "completed": false
}
```

## Tests

```bash
cd backend
npm test
```

13 tests unitaires couvrant toutes les fonctions du service (`taskService.js`).

## CI/CD

### CI — Tests automatiques

À chaque push sur `main` ou pull request, GitHub Actions lance les tests Jest.

### CD — Build et publication Docker

Après un CI vert, les images Docker sont buildées et publiées sur GitHub Container Registry :

```
ghcr.io/victormetral/todo-app-backend:latest
ghcr.io/victormetral/todo-app-frontend:latest
```
