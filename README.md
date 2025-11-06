# IBRA-COMPTA

Votre assistant comptable personnel pour les indépendants en Belgique, propulsé par l'IA.

IBRA-COMPTA est une application web conçue pour simplifier la gestion financière des freelances et indépendants en Belgique. Elle offre des outils pour suivre les revenus et les dépenses, gérer la facturation, calculer la TVA et obtenir des conseils comptables personnalisés grâce à un assistant IA intégré.

## ✨ Fonctionnalités Clés

- **Tableau de bord Intuitif** : Visualisez vos revenus, dépenses et soldes en un coup d'œil.
- **Suivi des Transactions** : Enregistrez facilement vos revenus et dépenses.
- **Analyse par IA** : Scannez vos reçus et factures avec votre caméra pour que l'IA remplisse automatiquement les données.
- **Gestion de la Facturation** : Créez, modifiez et suivez le statut de vos factures clients.
- **Calculs Fiscaux** : Calculez automatiquement votre TVA, vos cotisations sociales et estimez vos versements anticipés d'impôts selon les normes belges.
- **Rapports Détaillés** : Générez des résumés financiers, des listes de transactions et des grands livres comptables.
- **Assistant IA Binta** : Posez des questions en langage naturel sur vos finances et obtenez des réponses et conseils personnalisés.
- **Gestion Multi-utilisateurs** : Créez un compte et conservez vos données de manière sécurisée et persistante dans votre navigateur.

## 🚀 Stack Technique

- **Frontend** : React, TypeScript, Tailwind CSS
- **API IA** : Google Gemini API
- **Graphiques** : Recharts
- **Environnement** : Pas de build, utilise un `importmap` pour les dépendances et Babel pour la transpilation à la volée.

## 🏁 Démarrage Rapide

Suivez ces étapes pour lancer le projet sur votre machine locale.

### Prérequis

- [Node.js](https://nodejs.org/) (version 18.x ou supérieure)
- npm ou tout autre gestionnaire de paquets

### Installation

1.  **Clonez le dépôt**
    ```bash
    git clone https://github.com/VOTRE_NOM_UTILISATEUR/ibra-compta.git
    cd ibra-compta
    ```

2.  **Installez les dépendances**
    Ce projet utilise des dépendances de développement pour le servir localement.
    ```bash
    npm install
    ```

3.  **Variable d'Environnement**
    L'application nécessite une clé API pour l'API Google Gemini. Cette clé doit être fournie par l'environnement d'exécution sous la variable `process.env.API_KEY`. Pour le développement local, la méthode la plus simple est d'utiliser un serveur qui peut injecter des variables.

### Lancement de l'application

Pour servir le projet, nous utilisons un simple serveur statique. Le `package.json` inclut une commande pour cela.

```bash
npm start
```

Ouvrez votre navigateur et allez sur `http://localhost:8080` (ou le port indiqué par la commande).

## 📂 Structure du projet

```
/
├── components/       # Composants React réutilisables
├── data/             # Données statiques (mock)
├── services/         # Logique métier, appels API (Gemini)
├── types.ts          # Définitions de types TypeScript
├── App.tsx           # Composant principal de l'application
├── index.html        # Fichier HTML racine
├── index.tsx         # Point d'entrée de l'application
├── package.json      # Dépendances et scripts du projet
└── README.md         # Ce fichier
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
