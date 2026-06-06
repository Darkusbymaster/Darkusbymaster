# PLC Code Generator Pro ⚡

Generador de código PLC multiplataforma con soporte para **35+ marcas industriales**. Compatible con Windows (EXE), iOS y Android (PWA).

## Marcas Soportadas

| Región | PLCs |
|--------|------|
| Americanos | Allen-Bradley, GE-Fanuc, Honeywell, Emerson |
| Europeos | Siemens (S7-300/400, S7-1200/1500), Schneider, ABB, Beckhoff, Phoenix Contact, Pilz, WAGO, B&R, VIPA |
| Japoneses | Mitsubishi (MELSEC-Q, iQ-R), Omron (CJ/CP, NX/NJ), Keyence, Panasonic, Yokogawa, Fuji Electric |
| Asiáticos | Delta, LS Electric, Fatek, Unitronics, Weintek, Koyo, IDEC, Teco, Vigor, HollySys, Inovance |

## Lenguajes de Programación

- **LD** - Diagrama Ladder
- **ST/SCL** - Texto Estructurado (IEC 61131-3)
- **STL** - Lista de Instrucciones Siemens
- **IL** - Lista de Instrucciones IEC

## Instalación

```bash
npm install
```

## Uso

### Web/Móvil (PWA)
Abrir `index.html` en un navegador. Funciona offline en iOS/Android.

### Windows (EXE)
```bash
npm run build:win
```
El instalador se genera en `dist/`.

### Desarrollo
```bash
npm start          # Ejecutar con Electron
npm test           # Tests + cobertura
npm run lint       # ESLint
```

## Estructura

```
├── index.html              # UI principal
├── src/
│   ├── plc.js              # Lógica de generación (35+ PLCs)
│   └── ui.js               # Interacciones DOM + notificaciones
├── electron/
│   └── main.js             # Configuración Electron (Windows EXE)
├── tests/
│   ├── plc.test.js         # 30+ tests del motor PLC
│   └── ui.test.js          # 21+ tests de la interfaz
├── icons/                  # Iconos PWA/Electron
├── sw.js                   # Service Worker (offline)
├── manifest.json           # PWA manifest
└── package.json            # Config + electron-builder
```

## Tests

```bash
npm test
```

Cobertura actual: **97.5% statements, 92.8% branches, 84.6% functions, 98.1% lines**
