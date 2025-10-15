🃏 API Poker - Texas Hold'em (NestJS)

📋 Liste des routes actives

🔐 Authentification
  POST → http://localhost:8800/api/auth/register
  Crée un compte utilisateur
  
  POST → http://localhost:8800/api/auth/login
  
  Permet à un utilisateur de se connecter

  POST → http://localhost:8800/api/auth/logout
  
  Permet à un utilisateur de se connecter

  GET → http://localhost:8800/api/auth/profil
  
  Profil utilisateur (besoin d'un token)

👥 Joueurs

  GET → http://localhost:8800/api/players
  
  Récupère tous les utilisateurs
  
  GET → http://localhost:8800/api/players/:id
  
  Récupère un utilisateur spécifique

🪑 Tables

  GET → http://localhost:8800/api/tables
  
  Permet de voir les tables disponibles
  
  POST → http://localhost:8800/api/tables
  
  Permet à un joueur de s’asseoir à une table

  GET → http://localhost:8800/api/tables/:id
  
  Permet de voir une table précise

🎮 Parties

  POST → http://localhost:8800/api/games
  
  Lance une nouvelle partie
  
  GET → http://localhost:8800/api/games
  
  Récupère toutes les parties
  
  GET → http://localhost:8800/api/games/:id
  
  Récupèrer une partie spécifique

🧩 Deck

  GET → http://localhost:8800/api/decks
  
  Récupère le deck complet de cartes

🃏 Cartes
  POST → http://localhost:8800/api/cards
  
  Permet de distribuer des cartes

  GET → http://localhost:8800/api/cards
  
  Récupère toutes les cartes

  GET → http://localhost:8800/api/cards/:id
  
  Récupère une carte spécifique

💰 Argent et mises

  GET → http://localhost:8800/api/money
  
  Récupère l’argent d’un joueur

  POST → http://localhost:8800/api/raise
  
  Effectue une mise, relance ou dépôt d’argent (enchère)

  Actions

  POST → http://localhost:8800/api/actions/fold
  
  Permet à un joueur de se coucher

  POST → http://localhost:8800/api/actions/check
  
  Permet à un joueur de checker
  
  POST → http://localhost:8800/api/actions/call
  Permet à un joueur de suivre
  
  POST → http://localhost:8800/api/actions/raise
  Permet à un joueur de relancer
