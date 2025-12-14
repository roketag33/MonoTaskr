# Chrome Web Store Screenshots Guide

## Required Screenshots

Le Chrome Web Store nécessite **au moins 1 screenshot**, mais il est recommandé d'en fournir **3-5** pour maximiser l'attrait.

### Dimensions Recommandées

- **1280 x 800 pixels** (ratio 16:10)
- ou **640 x 400 pixels** (si besoin de plus petits fichiers)

## Screenshots à Prendre

### 1. Popup Principal - Timer View

**Fichier:** `screenshot-1-timer.png`

**Comment:**

1. Charger l'extension dans Chrome (`chrome://extensions`)
2. Cliquer sur l'icône MonoTaskr pour ouvrir le popup
3. Sélectionner une durée (ex: 25m)
4. Prendre un screenshot du popup avec:
   - Timer affiché (25:00)
   - Boutons de durée visibles
   - Bouton "Start Focus" bien visible

**Conseil:** Utiliser Windows Snipping Tool (Win + Shift + S) ou Chrome DevTools

### 2. History & Stats View

**Fichier:** `screenshot-2-history.png`

**Comment:**

1. Compléter quelques sessions de focus au préalable
2. Ouvrir le popup
3. Cliquer sur "📊 View History"
4. Prendre un screenshot montrant:
   - Statistiques du jour (Sessions today / Minutes focus)
   - Liste des sessions complétées
   - Design épuré

### 3. Settings View

**Fichier:** `screenshot-3-settings.png`

**Comment:**

1. Ouvrir le popup
2. Cliquer sur "⚙️ Settings"
3. Prendre un screenshot montrant:
   - Liste des sites bloqués
   - Input pour ajouter un site
   - Bouton "Reset to Defaults"

### 4. Blocking Overlay (Optionnel mais recommandé)

**Fichier:** `screenshot-4-blocking.png`

**Comment:**

1. Démarrer une session de focus (25m)
2. Ouvrir youtube.com dans un nouvel onglet
3. Prendre un screenshot de la page de blocage montrant:
   - Message "Focus Mode Active"
   - Overlay complet

### 5. Landing Page Hero (Optionnel)

**Fichier:** `screenshot-5-landing.png`

**Comment:**

1. Ouvrir `landing/index.html` dans le navigateur
2. Prendre un screenshot de la section hero
3. Montre le branding et le value proposition

## Étapes Pour Capturer les Screenshots

### Méthode 1: Windows Snipping Tool

```bash
# Raccourci clavier
Win + Shift + S

# Sélectionner la zone
# Coller dans Paint et sauvegarder en PNG
```

### Méthode 2: Chrome DevTools

```bash
# Ouvrir DevTools
F12

# Toggle Device Toolbar
Ctrl + Shift + M

# Régler dimensions à 1280x800
# Cliquer sur ⋮ → Capture screenshot
```

### Méthode 3: Extension Screenshot

Utiliser une extension comme "GoFullPage" ou "Awesome Screenshot"

## Post-Processing (Optionnel)

Pour un rendu professionnel, vous pouvez:

1. **Ajouter un drop shadow** autour du popup
2. **Placer sur un fond de couleur** (ex: dégradé)
3. **Ajouter des annotations** pour expliquer les features
4. Utiliser des outils comme:
   - Figma (gratuit)
   - Canva (gratuit)
   - Photopea (gratuit, en ligne)

## Checklist Finale

- [ ] Screenshot 1: Timer View (1280x800 PNG)
- [ ] Screenshot 2: History/Stats (1280x800 PNG)
- [ ] Screenshot 3: Settings (1280x800 PNG)
- [ ] Screenshot 4: Blocking Overlay (optionnel)
- [ ] Screenshot 5: Landing Page (optionnel)
- [ ] Tous les screenshots sont < 5MB chacun
- [ ] Noms de fichiers descriptifs
- [ ] Placés dans `/screenshots/` folder

## Exemples de Composition

### Layout 1: Simple

```
+---------------------------+
|   [Popup Screenshot]      |
|                           |
+---------------------------+
```

### Layout 2: Showcase Features

```
+------------+  +------------+  +------------+
| Screenshot |  | Screenshot |  | Screenshot |
|     1      |  |     2      |  |     3      |
+------------+  +------------+  +------------+
   Timer           History        Settings
```

### Layout 3: Professional (avec annotations)

```
+---------------------------+
|   [Screenshot]            |
|   ← Arrow: "Start Focus"  |
|   ← Arrow: "Stats"        |
+---------------------------+
```

---

**Note:** Une fois les screenshots pris, placez-les dans `/screenshots/` et committez-les avec le reste.
