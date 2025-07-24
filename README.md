# 🧾 Simple Menu – QR Code Digital Menu for Bars & Restaurants

Simple Menu est un projet SaaS minimaliste destiné aux bars, cafés et restaurants, permettant de créer **des menus en ligne personnalisés** accessibles via **QR Code**.

Chaque établissement dispose :
- d'une page publique dynamique (`/e/nom-du-bar`)
- d'une interface d'administration sécurisée (`/e/nom-du-bar/admin`)
- d'une base de données personnalisée pour gérer ses produits, offres, happy hours…

---

## 🚀 Fonctionnalités

- 🔐 Authentification admin par mot de passe hashé
- 🧾 Affichage du menu avec sections et produits dynamiques
- ✍️ Édition en ligne (nom, description, prix, disponibilité…)
- 🎨 Couleurs & logo personnalisables par bar
- 📸 Images uploadables via Cloudinary
- 📦 Architecture multi-clients scalable (`/e/[slug]`)
- 🧠 Rendu SSR avec cache intelligent (Next.js App Router)
- 📱 Accès mobile-friendly (idéal pour les QR codes)
- 💸 Stripe pour la gestion des abonnements

---

## 🧠 Stack technique

| Technologie    | Rôle                                             |
|----------------|--------------------------------------------------|
| **Next.js 15** | Frontend SSR (App Router)                        |
| **Supabase**   | BDD Postgres, Auth & API                         |
| **TailwindCSS**| UI responsive et rapide                          |
| **Cloudinary** | Hébergement d’images (logo, produits)            |
| **Stripe**     | (à venir) pour la facturation                    |

---

## 🗂️ Structure du projet

```
src/
├─ app/
│ ├─ e/[slug]/ → Pages dynamiques par établissement
│ │ ├─ page.tsx → Page publique (menu)
│ │ ├─ admin/page.tsx→ Interface d’administration
│ └─ layout.tsx → Layout principal avec <Footer>
├─ components/ → Composants réutilisables (MenuDisplay, Footer…)
├─ lib/ → Clients Supabase (server/browser)
├─ pages/api/ → API legacy (si Pages Router utilisé)
├─ app/api/ → API route handlers (App Router)
├─ types/ → Types TypeScript pour la base Supabase
.env → Clés d’environnement
```

---

## 🛠️ Installation & Lancement

### 1. Cloner le repo
   
```bash
git clone https://github.com/N1borg/Simple-Menu.git
cd Simple-Menu
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le projet en local

```bash
npm run dev
```

### 4. Accéder à l’app

Page menu : http://localhost:3000/demo

Admin : http://localhost:3000/demo/admin
