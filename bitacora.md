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

## Comportamiento con arreglo vacío y de un elemento

Cada función se probó con tres entradas: el arreglo completo (12 ventas), un arreglo de un solo elemento y un arreglo vacío.

| Función | Arreglo vacío | Razón |
|---------|---------------|-------|
| `totalVendido([])` | `0` | Una suma sin elementos vale cero. |
| `unidadesVendidas([])` | `0` | Igual que la anterior. |
| `ventasPorCiudad([], ciudad)` | `0` | No se vendió nada en esa ciudad. |
| `ventaMayor([])` | `null` | No existe ninguna venta que devolver; `null` indica "sin resultado". |
| `ticketPromedio([])` | `null` | Dividir entre cero daría `NaN`. Se devuelve `null` y no `0` para no confundirlo con un promedio real de cero pesos. |

Criterio: las sumas devuelven `0` porque ese valor es una respuesta válida; las funciones que buscan o promedian devuelven `null` porque no hay respuesta posible.

Con un solo elemento, todas las funciones devuelven el valor de esa venta (por ejemplo, `ticketPromedio` es igual al valor de la única venta). Caso extra: si el único elemento tiene cantidad 0, `totalVendido` da `0` y `ticketPromedio` da `null`, porque no hay ventas válidas.

Consecuencia para el resto del código: quien use `ventaMayor` o `ticketPromedio` debe revisar si el resultado es `null` antes de usarlo.

## Verificación a mano con tablas de traza

Datos: las 12 ventas de `src/datos.js`. Valor de cada venta = cantidad × precio.

### Traza 1: `totalVendido(ventas)`

Variable que cambia: `total`, que empieza en 0.

| Vuelta | id | Cálculo (cantidad × precio) | valorVenta | total acumulado |
|--------|----|-----------------------------|-----------:|----------------:|
| 1 | 1 | 2 × 42000 | 84000 | 84000 |
| 2 | 2 | 1 × 26000 | 26000 | 110000 |
| 3 | 3 | 1 × 95000 | 95000 | 205000 |
| 4 | 4 | 1 × 42000 | 42000 | 247000 |
| 5 | 5 | 3 × 45000 | 135000 | 382000 |
| 6 | 6 | 2 × 26000 | 52000 | 434000 |
| 7 | 7 | 1 × 120000 | 120000 | 554000 |
| 8 | 8 | 0 × 42000 | 0 | 554000 |
| 9 | 9 | 2 × 45000 | 90000 | 644000 |
| 10 | 10 | 4 × 42000 | 168000 | 812000 |
| 11 | 11 | 1 × 95000 | 95000 | 907000 |
| 12 | 12 | 3 × 26000 | 78000 | 985000 |

**Resultado a mano:** 985000
**Resultado del programa:** 985000
**¿Coinciden?** Sí.

### Traza 2: `ventaMayor(ventas)`

Variable que cambia: `mayor` (la mejor venta vista hasta ahora), que empieza en `null`.

| Vuelta | id | valorVenta | ¿Supera a `mayor`? | `mayor` después |
|--------|----|-----------:|--------------------|-----------------|
| 1 | 1 | 84000 | `mayor` es null, entra | id 1 (84000) |
| 2 | 2 | 26000 | 26000 > 84000: no | id 1 |
| 3 | 3 | 95000 | 95000 > 84000: sí | id 3 (95000) |
| 4 | 4 | 42000 | 42000 > 95000: no | id 3 |
| 5 | 5 | 135000 | 135000 > 95000: sí | id 5 (135000) |
| 6 | 6 | 52000 | no | id 5 |
| 7 | 7 | 120000 | 120000 > 135000: no | id 5 |
| 8 | 8 | 0 | no | id 5 |
| 9 | 9 | 90000 | no | id 5 |
| 10 | 10 | 168000 | 168000 > 135000: sí | id 10 (168000) |
| 11 | 11 | 95000 | no | id 10 |
| 12 | 12 | 78000 | no | id 10 |

**Resultado a mano:** el registro con `id: 10` (Origen Huila 500 g, Pereira, 4 unidades, 168000)
**Resultado del programa:** `id: 10`, con ese mismo registro completo
**¿Coinciden?** Sí.

### Traza 3: `ventasPorCiudad(ventas, "  MEDELLÍN ")`

Primero la función limpia la búsqueda: `"  MEDELLÍN "` pasa a `"medellín"`. Luego compara cada ciudad también limpia.

| id | Ciudad en los datos | Ciudad limpia | ¿Coincide? | valorVenta | total acumulado |
|----|---------------------|---------------|------------|-----------:|----------------:|
| 1 | Medellín | medellín | sí | 84000 | 84000 |
| 2 | Bogotá | bogotá | no | - | 84000 |
| 3 | Cali | cali | no | - | 84000 |
| 4 | Medellín | medellín | sí | 42000 | 126000 |
| 5 | medellín | medellín | sí | 135000 | 261000 |
| 6 a 10 | Bogotá, Bogotá, Cali, Cali, Pereira | no coinciden | no | - | 261000 |
| 11 | Medellín | medellín | sí | 95000 | 356000 |
| 12 | Bogotá | bogotá | no | - | 356000 |

**Resultado a mano:** 356000
**Resultado del programa:** 356000
**¿Coinciden?** Sí. La fila 5 (`"medellín"` en minúscula) sí se sumó gracias a la comparación flexible.

### Conclusión

Las tres trazas coinciden con la salida del programa. Comprobación cruzada: Medellín (356000) + Bogotá (276000) + Cali (185000) + Pereira (168000) = 985000, igual que `totalVendido`.

## Preguntas que responde cada función

Las cinco preguntas de la sesión:
- **¿Qué recorro?** Qué elementos se visitan uno por uno.
- **¿Qué filtro?** Qué elementos se descartan o se separan.
- **¿Qué transformo?** Qué dato se convierte en otro.
- **¿Qué acumulo?** Qué se va juntando durante el recorrido.
- **¿Cómo agrupo?** Bajo qué clave se reúnen las ventas.

### Versiones con ciclo `for...of`

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `valorVenta(venta)` | Nada: recibe una sola venta | No | Venta → `cantidad × precio` | No | No |
| `totalVendido(ventas)` | Cada venta | No | Venta → su valor, con `valorVenta` | `total`, la suma de valores | No |
| `unidadesVendidas(ventas)` | Cada venta | No | Venta → su `cantidad` | `unidades`, la suma de cantidades | No |
| `ventaMayor(ventas)` | Cada venta | No descarta: compara y se queda con la mejor | Venta → su valor, solo para comparar | `mayor`, la mejor venta vista hasta ahora (no es una suma; guarda el registro completo) | No |
| `ticketPromedio(ventas)` | Cada venta | Solo pasan las de `cantidad > 0` | Venta → su valor | `total` y `validas` (cuántas ventas contaron); al final se divide | No |
| `ventasPorCiudad(ventas, ciudad)` | Cada venta | Solo pasan las que tienen la ciudad buscada | Ciudad → sin espacios y en minúsculas, para comparar; venta → su valor | `total` de esa ciudad | No: devuelve un solo grupo, el de la ciudad pedida |
| `totalPorCiudad(ventas)` | Cada venta | No | Ciudad → nombre normalizado (con `normalizarCiudad`); venta → su valor | `totales[ciudad]`, un total por ciudad | Por ciudad normalizada: objeto con una clave por ciudad |
| `unidadesPorProducto(ventas)` | Cada venta | No | Venta → su `cantidad` | `unidades[producto]`, unidades por producto | Por producto: objeto con una clave por producto |
| `topProductosPorValor(ventas, k)` | Cada venta; luego la lista de productos | No filtra ventas; al final `slice(0, k)` se queda con los k primeros | Venta → su valor; luego el objeto → lista de `{ producto, valor }` | `valores[producto]`, el dinero por producto | Por producto; después se ordena de mayor a menor (sobre una copia, sin tocar `ventas`) |

### Versiones con métodos de arreglo

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `totalVendidoM(ventas)` | Cada venta, dentro de `reduce` | No | Venta → su valor | `reduce` lleva la suma en `acum` (empieza en 0) | No |
| `unidadesVendidasM(ventas)` | Cada venta, dentro de `reduce` | No | Venta → su `cantidad` | `reduce` lleva la suma en `acum` | No |
| `ventasPorCiudadM(ventas, ciudad)` | Cada venta, primero en `filter` y luego en `reduce` | `filter` deja las de la ciudad buscada | Venta → su valor | `reduce` suma los valores que quedaron | No |

### Idea general

- Con ciclo, las cinco operaciones se ven separadas: el `for...of` recorre, el `if` filtra, la línea con `valorVenta` transforma y el `+=` acumula.
- Con métodos, cada método hace una parte: `filter` filtra, `map` transforma y `reduce` acumula.
- Para agrupar uso un objeto: la clave es el grupo (ciudad o producto) y el valor es lo que acumulo en él.
- Cuando el resultado depende de un orden, como en `topProductosPorValor`, ordeno una copia, nunca el arreglo original.

## Errores reportados por la gerente

Comprobación con `node demostrar.js`: la versión v0.1 no presenta ninguno de los dos errores.

### Error 1: "Bogotá aparecía dos veces"

- **Síntoma:** en "ventas por ciudad", una misma ciudad salía en dos filas, con su total partido.
- **Entrada que lo produce:** ventas de la misma ciudad escritas distinto: `"Bogotá"`, `"Bogotá "` (espacio al final) o `" BOGOTÁ"`. En los 12 datos reales ocurre con `"medellín"` y `"Medellín"` (fila 5).
- **Hipótesis:** si el programa usa el texto de la ciudad como clave sin limpiarlo, JavaScript trata cada escritura como una clave distinta.
- **Prueba realizada:** pasé a `totalPorCiudad` tres ventas de Bogotá con tres escrituras distintas, y las 12 ventas reales.
- **Causa:** falta de normalización de la clave de agrupación (espacios sobrantes y mayúsculas).
- **Corrección y demostración:** `normalizarCiudad` aplica `trim()`, `toLowerCase()` y pone mayúscula inicial a cada palabra antes de agrupar. Resultado: las tres escrituras de Bogotá dan 1 solo grupo con total 182000, y los datos reales dan 4 ciudades, con Medellín en 356000 (incluye la fila 5).
- **Limitación:** no une `"Bogota"` (sin tilde) con `"Bogotá"`. Si el archivo de la gerente tiene ese caso, habría que quitar las tildes al normalizar.

### Error 2: "El ticket promedio daba NaN en un día sin ventas"

- **Síntoma:** al filtrar un día sin ventas, el ticket promedio mostraba `NaN`.
- **Entrada que lo produce:** el arreglo vacío que resulta de `ventasDelDia(ventas, "2026-09-07")`.
- **Hipótesis:** dividir el total entre la cantidad de ventas sin revisar si es 0 da `0 / 0`, que en JavaScript es `NaN`.
- **Prueba realizada:** llamé a `ticketPromedio` con un día sin ventas, con `[]` y con un día cuya única venta tiene cantidad 0, y revisé con `Number.isNaN` los días del 2026-09-01 al 2026-09-07.
- **Causa:** división entre cero, por no definir qué devolver cuando no hay ventas válidas.
- **Corrección y demostración:** `ticketPromedio` cuenta solo las ventas con `cantidad > 0` y, si no hay ninguna, devuelve `null` antes de dividir. Los tres casos devuelven `null` y ningún día da `NaN`. El reporte lo muestra como "Sin ventas registradas este día".