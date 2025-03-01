# Documentation

Cette API gère la création et la consultation de projets, analyses et utilisateurs.  
Les accès sont contrôlés en fonction des rôles : ADMIN, MANAGE et READER.

L’API reprend la philosophie d’architecture de Nest.js, c’est-à-dire en modules, pour permettre une scalabilité importante et faciliter l’intégration de nouvelles fonctionnalités au fur et à mesure de l’évolution du projet.

---

## Instructions pour démarrer l'API et les tests

1. Installation :
   - Cloner le dépôt.
   - Exécuter `npm install` pour installer les dépendances.

2. Configuration :
   - Créer un fichier `.env` pour configurer la connexion à la base de données et autres variables.

3. Base de Données :
   - Exécuter `npx prisma migrate dev` pour appliquer les migrations.
   - Générer le client Prisma avec `npx prisma generate` (si nécessaire).

4. Démarrage :
   - Démarrer le serveur avec `npm run dev` ou `node dist/index.js`.

5. Tests :
   - Exécuter les tests avec `npm run test`.

## Endpoints

### Analyses

- POST /  
  - URL : `/` avec le paramètre query `projectId`   
  - Description : Crée une analyse pour un projet.  
  - Middleware : Authentification et validation (`{ name: string }`).  
  - Règles : Seuls ADMIN ou MANAGER (sur son propre projet) peuvent créer une analyse.  
  - Réponses : `201` en succès, `400` en cas d'erreur.

- GET /:projectId  
  - Description : Récupère toutes les analyses associées à un projet.  
  - Accès :  
    - ADMIN : accès complet  
    - MANAGER et READER : accès si propriétaire ou via accès explicite.

- GET /:analysisId  
  - Description : Récupère une analyse spécifique par son identifiant.  
  - Accès :  
    - ADMIN : accès complet  
    - MANAGER/READER : accès si le projet est le leur ou accessible via la table d'accès.

---

### Projets

- POST /  
  - URL : `/`  
  - Description : Crée un projet avec les données `{ name: string, accessUserIds?: number[] }`.  
  - Middleware : Authentification et validation.  
  - Règles : Seuls ADMIN et MANAGER (non READER) peuvent créer un projet.  
  - Réponses : `201` en succès, `400` en cas d'erreur.

- GET /  
  - Description : Liste tous les projets accessibles à l'utilisateur selon son rôle et les droits d'accès.

- GET /:projectId  
  - Description : Récupère un projet précis par son identifiant.  
  - Accès :  
    - ADMIN : accès complet  
    - MANAGER/READER : accès si propriétaire ou si des droits d'accès sont définis.

---

### Utilisateurs

- POST /  
  - Description : Crée un utilisateur en fournissant `{ username: string, role: string }`.  
  - Réponses : `201` en succès, `400` en cas d'erreur (données manquantes).

---

## Schéma de la base de données

User  
- `id`   
- `username`  
- `role` (enum : ADMIN, MANAGER, READER)

Project  
- `id`   
- `name`  
- `ownerId` (référence à User)  
- `accesses` (table associative pour définir les droits d’accès)

Analysis  
- `id`   
- `name`  
- `projectId` (référence à Project)  
- `ownerId` (référence à User)

---

## Règles des droits d’accès

- ADMIN : Accès complet à tous les projets et analyses.  
- MANAGER :
  - Peut créer et consulter ses projets et analyses.  
  - Pour les analyses, création uniquement sur ses propres projets.
- READER : Accès en lecture aux projets et analyses pour lesquels un accès explicite est attribué.

---

 
