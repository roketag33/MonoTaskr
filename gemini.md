MonoTaskr – Guide pour Gemini (gemini.md)

Ce document sert de contrat de collaboration entre le projet MonoTaskr et le modèle Gemini chargé d’écrire du code.

Objectif : que Gemini puisse shipper vite du code de qualité, aligné avec :

les principes SOLID, DRY, YAGNI ;

l’architecture prévue pour MonoTaskr (extension Chrome Manifest V3 + landing) ;

la roadmap et les spécifications décrites dans Confluence et Jira.

Si tu es Gemini en train de lire ceci : considère ce fichier comme ton "README interne" avant d’écrire la moindre ligne de code.

1. Contexte rapide MonoTaskr

MonoTaskr est une extension de navigateur qui :

permet de démarrer des sessions de focus (25/45/60 min) ;

bloque certains sites distractifs (YouTube, réseaux sociaux, etc.) pendant ces sessions ;

stocke en local un historique de sessions et des stats basiques ;

propose une expérience simple, sans compte utilisateur, centrée sur le navigateur.

Le périmètre principal du code :

extension Chrome Manifest V3 (service worker, popup, content scripts, options, page de blocage) ;

une landing page marketing simple pour présenter le produit ;

aucune backend complexe pour le MVP (tout en local).

Pour les détails produit, se référer aux pages Confluence listées ci-dessous.

2. Sources de vérité pour Gemini

Avant de coder, Gemini doit systématiquement chercher des informations dans :

2.1. Confluence – Documentation produit & technique

Espace Confluence : MonoTaskr.

Page hub principale :

MonoTaskr – Plan de lancement & documentation

Pages importantes :

MonoTaskr – 1. Analyse concurrentielle

MonoTaskr – 2. Utilisateurs, personas & interviews

MonoTaskr – 3. MVP & Roadmap

MonoTaskr – 4. PRD léger (Product Requirements)

MonoTaskr – 14. Epics & user stories (Jira)

MonoTaskr – 15. Spécifications techniques – extension

MonoTaskr – 16. Flows UX & écrans

MonoTaskr – 17. Modèle de données & événements métier

MonoTaskr – 18. Contraintes non-fonctionnelles & privacy

MonoTaskr – 19. Checklist de release

MonoTaskr – 20. Definition of Done (DoD) par Epic

Gemini doit :

lire en priorité les sections 14, 15, 16, 17 avant d’implémenter une feature ;

s’assurer que le comportement implémenté correspond bien à l’UX et au data model décrits ;

documenter dans le code ou les commentaires là où il a dû faire une hypothèse.

2.2. Jira – Roadmap & tickets d’implémentation

Projet Jira : MonoTaskr (clé MON).

Les Epics (MON-1 → MON-6) décrivent les grands blocs : blocage, popup, stats, onboarding, landing, release.

Les Stories (MON-7 → MON-16) décrivent le comportement attendu du point de vue utilisateur.

Les Sous-tâches (TECH-\*) décrivent le travail technique à faire.

Gemini doit :

prendre un ticket Jira comme unité de travail ;

lire la Story + les sous-tâches associées ;

vérifier la cohérence avec Confluence (sections 14–17) ;

produire du code qui couvre clairement les critères d’acceptation.

3. Principes d’ingénierie à respecter

3.1. SOLID

Gemini doit appliquer les principes SOLID, en particulier :

Single Responsibility Principle (SRP) :

une fonction / classe / module doit avoir une seule raison de changer ;

ex : séparer storage.ts, messaging.ts, models.ts, plutôt qu’un gros fichier utilitaire.

Open/Closed Principle (OCP) :

le code doit être ouvert à l’extension, fermé à la modification inutile ;

préférer les abstractions (interfaces, fonctions pures) qui permettent d’ajouter des comportements sans tout casser.

Liskov Substitution, Interface Segregation, Dependency Inversion :

éviter des types / interfaces trop généralistes ;

injecter les dépendances importantes (ex : adapter de stockage, horloge) plutôt que les appeler en dur, quand c’est pertinent.

Gemini n’a pas besoin de sur-architecturer, mais doit éviter le spaghetti code.

3.2. DRY (Don’t Repeat Yourself)

Factoriser les :

accès à chrome.storage (helpers dédiés) ;

types de données (Session, UserSettings, etc.) dans un module partagé ;

logique de calcul (durée réelle, stats du jour).

Éviter de dupliquer des chaînes sensibles (noms de clés storage, noms de messages runtime, etc.).

3.3. YAGNI (You Aren’t Gonna Need It)

Ne pas implémenter de fonctionnalités non présentes dans la Story / Confluence / Roadmap.

Ne pas anticiper :

multi-navigateurs, multi-profils, sync cloud, comptes utilisateurs, etc., tant que ce n’est pas dans le scope.

Si une idée d’extension apparaît, la noter en commentaire ou TODO clair, mais ne pas la coder sans spécification.

3.4. Ship fast (mais propre)

Gemini doit optimiser pour :

livrer des incréments fonctionnels petits mais complets ;

garder le code lisible, testé sur les parties critiques ;

éviter les refactors massifs non demandés.

Concrètement :

commencer par implémenter la version simple qui respecte les critères ;

n’ajouter de complexité qu’en cas de besoin réel ;

laisser de la place à des refactors ultérieurs, guidés par de vrais problèmes.

4. Style de code & conventions

4.1. Langages & stack

Pour l’extension :

TypeScript pour le code ;

Manifest V3 ;

possibilité d’utiliser React pour le popup / options / pages, si le projet le prévoit dans la doc technique.

Pour la landing :

stack front standard (Next.js, Vite + React, ou équivalent), selon ce qui est décrit dans les spécifications Confluence.

4.2. Bonnes pratiques générales

Gemini doit :

écrire du code typé (pas de any sans justification explicite) ;

privilégier des fonctions pures pour la logique métier (calculs, mapping de données) ;

isoler les effets de bord (accès storage, API Chrome, timers) dans des modules dédiés ;

utiliser des noms explicites pour les fonctions, variables et types ;

limiter les commentaires aux endroits vraiment utiles (règles métiers non évidentes, décisions d’archi).

4.3. Gestion des erreurs

Gérer les erreurs raisonnablement, en particulier :

échec de lecture/écriture du storage ;

absence de données ;

comportements inattendus du navigateur (onglets fermés, rechargement de service worker).

Ne pas surcharger l’utilisateur de messages d’erreur : certains cas peuvent être loggés silencieusement ou traités avec des valeurs par défaut.

5. Architecture haut niveau à respecter

L’architecture cible de MonoTaskr (détaillée en Confluence, section 15. Spécifications techniques) ressemble à :

Service worker (background) :

gère l’état global de la session (currentSession) ;

gère les timers (via chrome.alarms ou équivalent) ;

applique ou retire le blocage des sites ;

reçoit et traite les messages du popup / pages.

Popup :

affiche l’état de la session (aucune / en cours) ;

permet de démarrer / arrêter une session ;

affiche les stats du jour.

Content scripts / page de blocage :

interceptent ou remplacent le contenu des sites bloqués pendant une session ;

affichent une page de blocage claire, conforme à l’UX décrite dans Confluence.

Options / settings :

gestion de la liste des sites bloqués ;

réglages simples (durées par défaut, onboarding vu/pas vu).

Shared / core :

models : types Session, UserSettings, etc. ;

storage : accès à chrome.storage ;

messaging : types de messages entre popup / background / content scripts ;

stats : calcul du temps de focus, agrégats journaliers.

Gemini doit respecter cette séparation au maximum, pour garder le projet modulaire.

6. Manière de travailler (Workflow Gemini)

Pour chaque tâche (Story ou Sous-tâche Jira), Gemini doit :

Lire le contexte :

la Story Jira (critères d’acceptation) ;

la page Confluence pertinente (PRD, Specs techniques, UX flows) ;

éventuellement la roadmap MVP.

Établir un mini-plan d’implémentation (même mentalement) :

quelles fonctions / modules créer ou modifier ;

quels types utiliser ou introduire ;

quels tests ajouter si nécessaire.

Mettre a jour le code

pull main puis creer la branche en suivant les conventions de développeur git avec le nom et numéro du ticket jira

Coder de façon incrémentale et TDD :

commencer par écrire les test pour avoir un workflow TDD

contiuer avec la structure (types, fonctions, squelette de composant) ;

implémenter la logique métier ;

brancher aux APIs du navigateur / UI en dernier.

Auto-vérifier :

lancer les test pour voir si tout passe

lancer le lint

lancer le build

le code compile (TypeScript) ;

la logique correspond à ce qui est écrit dans Confluence ;

les fonctionnalités optionnelles non spécifiées ne sont pas introduites (respect de YAGNI).

Documenter minimalement :

ajouter des commentaires courts pour les décisions non triviales ;

si Gemini a dû faire une hypothèse, la signaler (comment / TODO) avec une formulation claire.

7. Quand l’info manque ou est ambiguë

Si Confluence et Jira ne donnent pas une réponse claire, Gemini doit :

Chercher d’abord dans :

MonoTaskr – 14. Epics & user stories (Jira) ;

MonoTaskr – 15. Spécifications techniques – extension ;

MonoTaskr – 16. Flows UX & écrans ;

MonoTaskr – 17. Modèle de données & événements.

Si c’est toujours ambigu :

choisir la solution la plus simple, la moins intrusive ;

respecter tous les principes : SOLID, DRY, YAGNI, ship-fast.

Documenter l’hypothèse :

dans un commentaire ou un TODO (// TODO: décision prise faute de spécification claire, à valider) ;

en gardant l’implémentation facile à ajuster ensuite.

8. Résumé pour Gemini

Tu dois lire Confluence et Jira avant de coder.

Tu optimises pour :

code propre, modulaire, lisible, typé ;

features livrables rapidement (MVP-first) ;

pas de sur-architecture.

Tu appliques SOLID, DRY, YAGNI de façon pragmatique.

Tu respectes l’architecture MV3 / popup / background / content décrite dans les specs.

Tu n’ajoutes rien qui n’est pas dans la roadmap ou les spécifications, sauf si c’est "gratuit" et clairement justifié.

Ce fichier gemini.md est ta référence pour la façon de travailler sur MonoTaskr.
