# 🌸 Flower Compendium
### A Victorian Botanical Record

*A record of blooms, their meaning & their story.*

**[→ Open the app](https://latichris.github.io/Flower-Compendium-App/)**

---

## About

Flower Compendium is a Progressive Web App (PWA) built as a personal project — a digital botanical record inspired by the Victorian language of flowers. It catalogs 59 flowers with their historical meanings, symbolism, and botanical details, presented in an elegant illustrated style.

The app includes a live AI-powered flower identifier that uses your device's camera to recognise flowers in real time.

---

## Features

- 📖 **Compendium** — 59 flowers with individual profile pages covering meaning, symbolism, and botanical notes
- 🔍 **AI Identifier** — real-time flower identification via camera, powered by a MobileNetV2 model with TensorFlow.js
- 🎨 **Victorian aesthetic** — custom illustrated card designs and a warm colour palette
- 🌙 **Dark mode** — warm dark theme toggled from Settings
- 🔎 **Search & filter** — filter the catalogue by meaning or colour, or search by name

---

## AI Identifier

The identifier runs entirely in the browser using TensorFlow.js — no data is sent to any server. It was trained on the [Flowers-299 dataset](https://www.kaggle.com/datasets/bogdancretu/flowers-299) by Bogdan Cretu (Kaggle) using MobileNetV2 with transfer learning.

> **Note:** The identifier has been trained exclusively on the 59 flowers in this compendium. Scanning a flower not found here may return an incorrect result.

---

## Install as an App (PWA)

The app can be installed on your device directly from the browser — no app store required.

**On mobile (iOS/Android):** Open the app in your browser, tap the share button, and select *Add to Home Screen*.

**On desktop (Chrome/Edge):** Look for the install icon in the address bar, or go to the browser menu and select *Install app*.

---

## Download APK (Android)

An Android APK is available for direct installation without a browser.

**[⬇ Download APK](https://github.com/latichris/Flower-Compendium-App/raw/main/releases/download/v1.0.0/flower-compendium.apk)**

> Enable *Install from unknown sources* in your Android settings before installing.

---

## Credits

| | |
|---|---|
| **Inspired by** | *Floriography: An Illustrated Guide to the Victorian Language of Flowers* — Jessica Roux |
| **Music** | *Home* — Toby Fox (Undertale) |
| **Identifier Dataset** | Flowers-299 — Bogdan Cretu, Kaggle |

---

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- TensorFlow.js 4.x + MobileNetV2 (on-device inference)
- GitHub Pages hosting
- PWA (Web App Manifest + Service Worker)
