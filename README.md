# Café Origen – Analítica de ventas (v1.0)

Motor de análisis de ventas hecho en Node.js, sin librerías externas. Lee las ventas de la tienda, calcula indicadores y entrega un reporte en pantalla que la gerente puede ejecutar sin abrir el código.

## Qué hace
- Resume las ventas: total, unidades, ticket promedio y venta mayor.
- Agrupa por ciudad, por producto y por día.
- Apoya la campaña de fin de año: combos de tarjeta de regalo, producto estrella, cupones y mejor semana.
- Funciona con los datos reales del Día 1 (12 ventas) o con miles de ventas generadas al azar para probar el rendimiento.

## Requisitos
- Node.js 16 o superior (`node --version` para comprobarlo).
- No hay que instalar nada más.

## Primeros pasos
1. Instala Node.js 16 o superior desde https://nodejs.org (la versión LTS sirve).
2. Descarga o clona el proyecto y abre una terminal dentro de la carpeta `cafe-origen-analitica`.
3. Comprueba que Node funciona: `node --version` debe mostrar un número de versión.
4. Ejecuta el reporte: `node src/reporte.js`. Debe mostrar 10 secciones y terminar con una línea de `=`.
5. Ejecuta las pruebas: `node src/pruebas.js`. Ninguna línea debe decir FALLA.

No hay que instalar paquetes ni ejecutar `npm install`.

## Cómo ejecutarlo
Desde la carpeta del proyecto:

| Comando | Qué hace |
|---|---|
| `node src/reporte.js` | Reporte completo con los datos reales del Día 1 |
| `node src/reporte.js 100000` | Reporte con 100.000 ventas generadas |
| `node src/reporte.js 2026-09-03 2026-09-07` | Resumen de los días indicados (formato AAAA-MM-DD) |
| `node src/reporte.js 10000 2026-09-05` | 10.000 ventas generadas y resumen de un día |
| `node src/reporte.js 100000 --basico` | Solo las secciones 1 a 5 (versión v0.1) |
| `reporte.bat` | Doble clic en Windows; deja la ventana abierta al terminar |

Otros comandos:

| Comando | Para qué sirve |
|---|---|
| `node src/pruebas.js` | Ejecuta todas las pruebas; cada línea dice OK o FALLA |
| `node src/verificar.js` | Comprueba que las versiones con ciclos y con métodos de arreglos dan lo mismo |
| `node src/revisar.js` | Ejecuta el reporte con varios argumentos y busca NaN, undefined y etiquetas repetidas |
| `node src/medir.js` | Mide operaciones y tiempos de las funciones y del reporte |

## Preguntas que responde el reporte
| Sección | Pregunta | Función principal |
|---|---|---|
| 1. Resumen general | ¿Cuánto se vendió, cuántas unidades, cuál es el ticket promedio y la venta mayor? | `totalVendido`, `unidadesVendidas`, `ticketPromedio`, `ventaMayor` |
| 2. Ventas por ciudad | ¿Cuánto vendió cada ciudad? | `totalPorCiudad` |
| 3. Unidades por producto | ¿Cuántas unidades se vendieron de cada producto? | `unidadesPorProducto` |
| 4. Top 3 | ¿Qué productos generaron más dinero? | `topProductosPorValor` |
| 5. Resumen por día | ¿Cómo le fue a un día concreto? | `ventasDelDia` |
| 6. Clientes recurrentes | ¿Quiénes compraron más de una vez y cuántas? | `clientesRecurrentesSet`, `comprasPorCliente` |
| 7. Producto estrella | ¿Qué producto se repite más en cada ciudad? | `productoEstrellaPorCiudad` |
| 8. Combo de regalo | ¿Qué dos productos suman exactamente la tarjeta de $87.000? | `comboRegaloMap` (y `parMasCercano` si no hay combo exacto) |
| 9. Cliente para cupón | ¿Quién es el primer cliente que compró una sola vez? | `primerClienteUnico` |
| 10. Mejor semana | ¿Cuáles fueron los 7 días seguidos con más ventas? | `mejorSemana` |

Las funciones de presupuesto para clientes corporativos (`parMasCercano`) también se pueden usar con cualquier presupuesto.

## Estructura del proyecto
```
cafe-origen-analitica/
├── reporte.bat         Atajo para ejecutar el reporte en Windows
├── README.md           Esta documentación
├── RENDIMIENTO.md      Complejidad, mediciones, riesgos y optimizaciones
├── bitacora.md         Bitácora del trabajo (decisiones y aprendizajes)
└── src/
    ├── datos.js        Las 12 ventas del Día 1 y los totales diarios de septiembre
    ├── catalogo.js     Catálogo de 8 productos con sus precios
    ├── analitica.js    Todas las funciones de análisis (el motor)
    ├── generador.js    Genera n ventas al azar para pruebas y mediciones
    ├── reporte.js      Reporte que ve la gerente
    ├── pruebas.js      Pruebas automáticas con casos normales y casos borde
    ├── verificar.js    Compara versiones con ciclos y con métodos de arreglos
    ├── revisar.js      Revisa que el reporte no tenga NaN ni datos repetidos
    ├── demostrar.js    Demostración de errores comunes y de cómo se evitan
    └── medir.js        Mediciones de operaciones y tiempos
```
```

## Decisiones sobre los datos
- **Ciudades:** se normalizan (sin espacios sobrantes y con inicial mayúscula), así "medellín" y "Medellín" cuentan como la misma.
- **Cantidad 0:** la venta se registra, pero no cuenta como venta válida para el ticket promedio.
- **Sin ventas válidas:** el ticket promedio es `null` y el reporte lo muestra como "sin ventas válidas" (nunca NaN).
- **Empates en el producto estrella:** gana el producto que apareció primero en esa ciudad.
- **Primer cliente con una sola compra:** se toma el primero en el orden en que aparecen las ventas.
- **Fechas:** formato AAAA-MM-DD. Si el formato no es válido, el reporte lo avisa.

## Rendimiento
Con 100.000 ventas, el reporte completo se genera en una fracción de segundo. Todas las funciones del reporte son O(n) o mejores. El detalle por función, las proyecciones y los riesgos están en `RENDIMIENTO.md`.