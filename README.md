# 🦷 Bocca 3D Interattiva - Three.js

Modello 3D interattivo di una bocca con denti, gengive e lingua realizzato con Three.js.

## 🌟 Caratteristiche

- **32 denti** (16 superiori, 16 inferiori) con anatomia realistica:
  - Incisivi frontali
  - Canini
  - Premolari
  - Molari
- **Gengive** superiori e inferiori modellate
- **Lingua** con texture realistica
- **Interattività**:
  - ✅ Click sui denti per selezionarli (si illuminano in verde)
  - ✅ Apertura e chiusura della bocca con animazione fluida
  - ✅ Rotazione 3D con mouse drag
  - ✅ Zoom con scroll
- **Illuminazione realistica** con ombre

## 🚀 Come usare

### Installazione

```bash
npm install
```

### Avvio in modalità sviluppo

```bash
npm run dev
```

Il progetto si aprirà automaticamente nel browser su `http://localhost:3000`

### Build per produzione

```bash
npm run build
```

### Preview della build

```bash
npm run preview
```

## 🎮 Controlli

- **Click sui denti**: Seleziona un dente (si illumina in verde)
- **Drag del mouse**: Ruota la vista 3D
- **Scroll**: Zoom in/out
- **Pulsante "Apri Bocca"**: Anima l'apertura della bocca
- **Pulsante "Chiudi Bocca"**: Anima la chiusura della bocca
- **Pulsante "Reset Vista"**: Torna alla vista iniziale

## 📁 Struttura del progetto

```
DentalThreeJs/
├── index.html          # Pagina principale
├── main.js            # Logica Three.js e animazioni
├── package.json       # Dipendenze
├── vite.config.js     # Configurazione Vite
└── README.md          # Documentazione
```

## 🛠️ Tecnologie utilizzate

- **Three.js** v0.160.0 - Libreria 3D WebGL
- **Vite** v5.0.0 - Build tool e dev server
- **OrbitControls** - Controlli camera 3D

## 📝 Dettagli tecnici

### Anatomia dei denti

Ogni dente è composto da:
- **Corona**: Parte visibile del dente con geometria specifica (incisivo, canino, molare)
- **Radice**: Parte sotto la gengiva

### Materiali

- **Denti**: Materiale Phong bianco con alta lucentezza
- **Gengive**: Materiale Phong rosa chiaro
- **Lingua**: Materiale Phong rosso/rosa con texture irregolare

### Animazione bocca

L'apertura/chiusura della bocca funziona tramite:
- Rotazione della mandibola inferiore attorno al punto di cerniera
- Traslazione verticale per simulare il movimento naturale
- Interpolazione fluida per transizioni smooth

## 🎨 Personalizzazione

Puoi modificare facilmente:
- Colori dei materiali (linee 42-54 in `main.js`)
- Numero e posizione dei denti (funzioni `createUpperTeeth` e `createLowerTeeth`)
- Velocità di animazione (variabile `speed` nella funzione `animateMouth`)
- Angolo massimo di apertura bocca (variabile `maxMouthOpen`)

## 📄 Licenza

MIT
