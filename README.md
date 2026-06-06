# PLC Generator Multiplataforma

Generador de código PLC para Allen-Bradley, Siemens y Mitsubishi. Interfaz móvil optimizada con generación y descarga de código.

## Estructura del Proyecto

```
├── index.html          # Interfaz de usuario
├── src/
│   ├── plc.js          # Lógica de generación y reparación de código PLC
│   └── ui.js           # Manejo de interacciones del DOM
├── tests/
│   ├── plc.test.js     # Tests unitarios del módulo PLC
│   └── ui.test.js      # Tests unitarios del módulo UI
├── package.json
├── jest.config.js
└── .eslintrc.json
```

## Instalación

```bash
npm install
```

## Tests

```bash
npm test
```

Genera reporte de cobertura en `coverage/`.

## Uso

Abrir `index.html` en un navegador. Seleccionar tipo de PLC, entradas/salidas, y generar código.
