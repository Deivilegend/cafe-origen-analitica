## Diccionario de datos

Fuente: `src/datos.js`, arreglo `ventas` con 12 registros. Cada registro es un objeto con 7 propiedades.

| Propiedad | Tipo | Significado | Ejemplo | Observaciones |
|-----------|------|-------------|---------|---------------|
| `id` | number | Número único de la venta (1 a 12). Identifica cada fila. | `5` | Sin repetidos; va en orden. |
| `fecha` | string | Día en que se hizo la venta, en formato `AAAA-MM-DD`. | `"2026-09-03"` | Es texto, no un objeto `Date`. Las fechas van del 2026-09-01 al 2026-09-06. |
| `cliente` | string | Código del cliente que compró. No es el nombre, es un identificador. | `"C01"` | Hay 8 clientes distintos (C01 a C08). C01 aparece 3 veces. |
| `producto` | string | Nombre del producto vendido, con su presentación cuando aplica. | `"Origen Huila 500 g"` | Hay 5 productos distintos: 4 cafés/accesorios con nombre repetido en varias ventas (Huila 500 g, Nariño 250 g, Sierra 500 g) y 2 artículos de preparación (Prensa francesa, Molino manual). |
| `ciudad` | string | Ciudad donde se hizo o se entregó la venta. | `"Medellín"` | Inconsistencia: la fila 5 trae `"medellín"` en minúscula. |
| `cantidad` | number | Unidades vendidas en esa venta. | `2` | Inconsistencia: la fila 8 trae `0`, que no tiene sentido para una venta. |
| `precio` | number | Precio de **una** unidad, en pesos colombianos (COP). | `42000` | Parece unitario, no total: el mismo producto siempre tiene el mismo precio. El total de la venta sería `cantidad * precio`. |

## Casos borde detectados

Revisé las 12 ventas de `src/datos.js`. Los datos originales NO se modifican: la limpieza se hace en una copia, para poder comparar antes y después.

### 1. Ciudad escrita de dos formas (fila 5)

- **Qué pasa:** la fila con `id: 5` trae `"medellín"` en minúscula; las demás filas de esa ciudad traen `"Medellín"`.
- **Por qué importa:** JavaScript distingue mayúsculas, así que al agrupar por ciudad saldrían 5 ciudades en vez de 4, y las ventas de Medellín quedarían partidas en dos grupos.
- **Decisión:** normalizar a `"Medellín"` en la copia limpia. Es la misma ciudad, solo cambia la escritura, así que no se pierde información.

### 2. Cantidad igual a cero (fila 8)

- **Qué pasa:** la venta `id: 8` (cliente C06, Origen Huila 500 g, Cali) tiene `cantidad: 0`.
- **Por qué importa:** una venta de cero unidades no es una venta real; puede ser un pedido cancelado o un error de digitación. Si se deja, suma $0 a los ingresos pero cuenta como una venta en los conteos y baja los promedios.
- **Decisión:** excluir esta fila de la copia limpia y dejar constancia aquí. No la corrijo a 1 porque no tengo forma de saber cuál era la cantidad real, y inventar un dato es peor que descartarlo. Quedan 11 ventas válidas.

### 3. Clientes repetidos y un cliente sin compras válidas

- **Qué pasa:** el código `C01` aparece 3 veces (filas 1, 4 y 11), y `C02` y `C03` aparecen 2 veces cada uno. Además, `C06` solo aparece en la fila 8, la que se excluye por tener cantidad 0.
- **Por qué importa:** si "número de clientes" se calcula con `ventas.length` saldría 12 (o 11), y eso mide ventas, no clientes. Contar sin fijarse en C06 daría 8 clientes, cuando solo 7 hicieron una compra real.
- **Decisión:** contar clientes con identificadores únicos sobre la copia limpia, lo que da 7 clientes. Los repetidos no se eliminan: son clientes que compraron más de una vez, y eso es información útil.

