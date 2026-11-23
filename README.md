# Café Origen: analítica de ventas (v0.1)

## ¿Qué es?

Un motor de análisis de ventas para Café Origen, escrito en JavaScript (Node.js). Lee un registro de 12 ventas de septiembre de 2026 y genera un reporte con totales, ventas por ciudad, unidades por producto, los productos que más dinero generan y el resumen de cualquier día.

Cada venta tiene: `id`, `fecha`, `cliente`, `producto`, `ciudad`, `cantidad` y `precio` (precio de **una** unidad, en pesos colombianos). El valor de una venta es `cantidad × precio`.

## Requisitos

Tener Node.js instalado (descarga la versión LTS en nodejs.org). Para comprobarlo: `node --version`.

## Cómo ejecutarlo

### Para ver el reporte (sin abrir el código)

- **Windows:** haz doble clic en `reporte.bat`.
- **Terminal**, desde la carpeta del proyecto:

```bash
npm run reporte
```

### Para ver el resumen de uno o varios días

Escribe las fechas como `AAAA-MM-DD`:

```bash
npm run reporte -- 2026-09-03
npm run reporte -- 2026-09-03 2026-09-07
```

Los datos cubren del 2026-09-01 al 2026-09-06. Un día fuera de ese rango muestra "Sin ventas registradas este día". Una fecha con otro formato muestra un aviso.

### Para quienes mantienen el código

```bash
node src/pruebas.js     # pruebas de cada función (arreglo completo, un elemento y vacío)
node src/verificar.js   # compara la versión con ciclo y la versión con métodos de arreglo
node src/demostrar.js   # comprueba que no reaparecen los errores reportados
node src/revisar.js     # ejecuta el reporte y busca NaN, undefined y grupos duplicados
```

## Preguntas que responde

1. ¿Cuánto se vendió en total, cuántas unidades y cuál fue la venta más grande?
2. ¿Cuánto vale, en promedio, una venta válida (ticket promedio)?
3. ¿Cuánto se vendió en cada ciudad?
4. ¿Cuántas unidades se vendieron de cada producto?
5. ¿Cuáles son los 3 productos que más dinero generaron?
6. ¿Cómo le fue a la tienda un día en particular, incluidos los días sin ventas?

## Estructura

```
cafe-origen-analitica/
├── README.md
├── package.json
├── reporte.bat
└── src/
    ├── datos.js        # las 12 ventas, tal como vienen
    ├── analitica.js    # funciones de cálculo
    ├── reporte.js      # el reporte que se muestra en pantalla
    ├── explorar.js     # exploración inicial de los datos
    ├── pruebas.js, verificar.js, demostrar.js, revisar.js
```

## Decisiones sobre los datos

Los datos originales no se modifican. La limpieza se resuelve al calcular:

- **Ciudades:** `"medellín"` (fila 5) y `"Medellín"` son la misma ciudad. Se normalizan quitando espacios sobrantes y poniendo mayúscula inicial antes de agrupar.
- **Cantidad 0 (fila 8):** no cuenta como venta válida. Aporta 0 pesos y 0 unidades, y se excluye del ticket promedio. Por eso el reporte muestra 12 ventas registradas y 11 válidas.
- **Sin resultados:** si no hay ventas válidas (por ejemplo, un día sin ventas), el ticket promedio no se calcula y se informa "sin ventas válidas", en lugar de mostrar `NaN`.

## Limitaciones conocidas

- La normalización de ciudades no ignora tildes: `"Bogota"` y `"Bogotá"` serían grupos distintos.
- Las fechas se comparan como texto, así que deben venir en formato `AAAA-MM-DD`.

## Versión

0.1.0