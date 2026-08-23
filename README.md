# 👗 DressChooseAI

> **Ton dressing automatisé !**  

---

## L'idée
Voici une application intelligente capable d'aider les utilisteurs et utilisatrices à choisir leurs tenues vestimentaires au quotidien. L’idée de ce projet m’est venue d’une situation très simple : chaque soir, je me pose la même question : “comment est-ce que je vais m’habiller demain ?”. Voila donc une solution qui automatise ce choix tout en restant personnalisée !

L’application fonctionne à partir d’une base de données que l’utilisateur ou l'utilisatrice construit lui/elle-même en ajoutant ses vêtements, accompagnés d’images et de caractéristiques comme le type (haut, bas, chaussures...), la couleur ou encore la saison. À partir de ces informations, le système est capable de générer des tenues complètes en combinant les différents éléments du dressing !

Et pour affiner les propositions, plusieurs paramètres sont pris en compte, comme les préférences de l’utilisateur/trice en matière de styles ou d’associations de couleurs, mais aussi des éléments externes tels que la météo du jour. L’objectif est d’obtenir des suggestions de tenues adaptées et personnalisées !

---

## Fonctionnalités

- **Garde-robe digitale** — Ajoute tous tes vêtements avec photos, catégorie, couleur et saison
- **Météo du lendemain** — Affichage automatique de la météo pour adapter les suggestions
- **Assistante Mode IA** — Chat avec une IA qui connaît ton dressing et te propose des tenues complètes
- **Associations de couleurs** — L'IA tient compte des combinaisons qui vont bien ensemble
- **Comptes personnels** — Chaque utilisatrice a son propre dressing, ses propres données
- **Interface responsive** — Utilisable sur mobile et desktop

---

## Structure du projet

```
dresschooseai/
├── index.html          # Page principale (garde-robe)
├── auth.html           # Page de connexion / inscription
├── script.js           # Logique principale
├── auth.js             # Gestion authentification
├── style.css           # Styles
├── vercel.json         # Config Vercel + headers sécurité
├── .gitignore          # Fichiers ignorés par Git
└── api/
    ├── chat.js         # Fonction serverless → Groq IA
    └── meteo.js        # Fonction serverless → OpenWeatherMap
```

---

## Utilisation

1. **Crée ton compte** sur la page de connexion
2. **Confirme ton email** (vérifie tes spams !)
3. **Connecte-toi** et découvre ton dressing vide
4. **Ajoute tes vêtements** avec photos et caractéristiques
5. **Ouvre le chat IA** 💬 et demande une tenue !

### Exemples de requêtes à l'IA
> "Propose moi une tenue chic pour demain"  
> "J'ai un entretien, qu'est-ce que tu me conseilles ?"  
> "Une tenue casual et confortable pour le week-end"  
> "Je préfère les tons neutres, qu'est-ce qui va ensemble ?"

---

## Roadmap

- [ ] Géolocalisation automatique pour la météo
- [ ] Modifier un vêtement (pas juste supprimer)
- [ ] Historique des tenues portées
- [ ] Suggestions basées sur les tenues précédentes
- [ ] Application mobile 

---

## Licence

Projet personnel — usage libre pour apprendre et s'inspirer.
