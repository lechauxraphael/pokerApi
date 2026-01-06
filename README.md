🃏 API Poker - Texas Hold'em (NestJS)

📋 Liste des routes actives

🔐 Authentification

  Toutes les routes privées nécessitent un JWT dans le header Authorization: Bearer <token>.
  L’utilisateur authentifié est déterminé automatiquement via ce token, il n’est pas nécessaire de passer son ID dans la route ou le body.

  POST → http://localhost:8800/api/auth/register {pseudo, mdp}
  → { access_token }
  Crée un compte utilisateur et retourne un access_token. (public)
  
  POST → http://localhost:8800/api/auth/login  {pseudo, mdp}
  → { access_token }
  Permet à un utilisateur de se connecter et retourne un access_token. (public)

  POST → http://localhost:8800/api/auth/logout
  Permet à un utilisateur de se déconnecter (privé)

👥 Joueurs

  GET → http://localhost:8800/api/users
  Récupère tous les utilisateurs (public)
  
  GET → http://localhost:8800/api/users/:id
  Récupère un utilisateur spécifique (public)

  GET → http://localhost:8800/api/users/me
  Récupère les infos personnelles de l’utilisateur connecté
  Profil utilisateur (privé)

  💰 Argent et mises

  GET  http://localhost:8800/api/users/me/money
  Récupère l’argent du joueur connecté (privé)

  POST http://localhost:8800/api/users/me/deposit { amount }
  Ajoute de l'argent sur le compte de l'utilisateur connecté(privé)

🪑 Tables

  GET → http://localhost:8800/api/tables
  Permet de voir toutes les tables disponibles (public)

  GET → http://localhost:8800/api/tables/:tableName
  Permet d'avoir les informations sur une table précise (noms, joueurs, blinds, statut...) (public)
  
  POST → http://localhost:8800/api/tables/:tableName/join
  Permet à l’utilisateur connecté de rejoindre une table. Le joueur est déterminé via son JWT. (privé)

  DELETE → http://localhost:8800/api/tables/:tableName/leave
  Permet à l’utilisateur connecté de quitter une table (privé)

  nom
  joueurs
  blindes
  statut

🎮 Parties

  POST → http://localhost:8800/api/tables/:tableName/games
  Lance une nouvelle partie (privé)
  
  GET → http://localhost:8800/api/tables/games
  Récupère toutes les parties (public)
  
  GET → http://localhost:8800/api/tables/:tableName/games
  Récupèrer une partie spécifique (public)

 🎬 Actions

  POST → http://localhost:8800/api/tables/:tableName/action {type : fold, check, call, raise, all-in}
  Effectue une action pour le joueur connecté (privé)
  
  POST → http://localhost:8800/api/tables/:tableName/blind {type : big, small, neutre}
  Définit le rôle du joueur connecté. Permet de savoir quel blind a un joueur. (privé)

🧩 Deck

  GET → http://localhost:8800/api/tables/:tableName/deck {tableau d'objet de cartes}
  Récupère le deck complet d'une table (attention : ne jamais exposer les cartes privées des joueurs) (privé)

🃏 Cartes
  POST → http://localhost:8800/api/tables/:tableName/deck/distribute {tableau d'objet de cartes}
  Distribue les cartes aux joueurs de la table. Chaque joueur ne verra que ses propres cartes. (privé)

  POST → http://localhost:8800/api/tables/:tableName/deck/burn {card}
  Brûle une carte du Deck (privé)

  GET → http://localhost:8800/api/tables/:tableName/deck/cards/:id 
  Récupère une carte spécifique (usage interne/serveur, pas exposer aux autres joueurs) (privé)

  ⚙️ Déroulement typique d’une partie

      - Connexion / Authentification
      - Choix d’une table
      - Vérification de l’argent disponible
      - Rejoindre la table
      - Affichage des cartes (uniquement celles du joueur connecté)
      - Affichage du rôle (big_blind, small_blind ou neutre)
      - Choix des actions (fold, check, call, raise, all-in)
      - Quitter la table