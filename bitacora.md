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

## Predicción antes de medir

**Pregunta:** si n (número de ventas) se multiplica por 10, ¿cuánto se multiplica el número de operaciones de cada función?

Defino operaciones = visitas + comparaciones. Predigo a partir del código, sin haber ejecutado la medición:

| Función | Qué hace por cada venta | Operaciones previstas | Si n × 10 |
|---|---|---|---|
| `totalVendido` | 1 visita, sin comparaciones | n | se multiplica por 10 |
| `ventaMayor` | 1 visita y 1 comparación (menos en la primera venta) | 2n − 1 | se multiplica por 10 aproximadamente |
| `totalPorCiudad` | 1 visita y 1 revisión de si la ciudad ya existe | 2n | se multiplica por 10 |

**Razonamiento:** las tres funciones tienen un solo ciclo que recorre cada venta una vez, y dentro del ciclo hacen una cantidad fija de trabajo (no hay ciclos anidados). Por eso el trabajo total es proporcional a n: crece de forma lineal. `ventaMayor` da 2n − 1 y no 2n porque la primera venta no se compara con nadie, así que el factor es un poco distinto de 10 con n pequeño (con n = 12 pasa de 23 a 239 operaciones al pasar a n = 120, factor 10,4), y se acerca a 10 cuando n crece.

**Valores previstos con n = 100 y n = 1000:**

| Función | n = 100 | n = 1000 |
|---|---:|---:|
| `totalVendido` | 100 | 1000 |
| `ventaMayor` | 199 | 1999 |
| `totalPorCiudad` | 200 | 2000 |

**Qué me haría cambiar de opinión:** si alguna función multiplicara sus operaciones por mucho más de 10 (por ejemplo, por 100), significaría que hay un ciclo dentro de otro que no vi.

**Supuesto:** no cuento el costo interno de buscar una clave en un objeto ni de normalizar el texto de la ciudad. Lo trato como una sola operación.

(Resultado real: se completa después de medir.)

## Comparación entre predicción y resultados, y clasificación

Operaciones = visitas + comparaciones. Medido con `medir.js` (datos de `generarVentas`).

### Predicción contra resultado

| Función | Predicción | n = 100 | n = 1.000 | n = 10.000 | n = 100.000 | Factor al multiplicar n × 10 | ¿Coincide? |
|---|---|---:|---:|---:|---:|---|---|
| `totalVendido` | n | 100 | 1.000 | 10.000 | 100.000 | 10,00 | Sí, exacto |
| `ventaMayor` | 2n − 1 | 199 | 1.999 | 19.999 | 199.999 | 10,05 y después 10,00 | Sí, exacto |
| `totalPorCiudad` | 2n | 200 | 2.000 | 20.000 | 200.000 | 10,00 | Sí, exacto |
| `primeraVenta` | no la había predicho | 1 | 1 | 1 | 1 | 1,00 | Ver nota |

Nota: `primeraVenta` se agregó después de escribir la predicción, así que no estaba en ella. Su resultado también se deduce del código: solo lee la posición 0.

Todos los valores medidos son iguales a las fórmulas previstas. No hubo sorpresas. El único factor distinto de 10,00 es el de `ventaMayor` entre 100 y 1.000 (10,05), y se había anticipado: la primera venta no se compara con nadie, y ese "−1" pesa menos cuando n crece.

### Clasificación

| Función | Clasificación | Justificación con el código | Justificación con los números |
|---|---|---|---|
| `primeraVenta` | **O(1)** | Solo lee `ventas[0]`. No hay ciclo, así que el trabajo no depende de cuántas ventas haya. | 1 operación con n = 100 y con n = 100.000. Factor 1,00. |
| `totalVendido` | **O(n)** | Un solo `for...of` que visita cada venta una vez y hace una suma por vuelta. | n operaciones. Con n × 10, el trabajo × 10. |
| `ventaMayor` | **O(n)** | Un solo ciclo con una comparación por venta. Hacer 2 operaciones por vuelta en lugar de 1 cambia la constante, no la forma del crecimiento. | 2n − 1 operaciones. Factor 10,00. |
| `totalPorCiudad` | **O(n)** | Un solo ciclo. Por vuelta: una visita, una revisión de si la ciudad existe y una suma. No hay ciclos anidados. | 2n operaciones. Factor 10,00. |

### Por qué ninguna es O(n²)

Una función O(n²) tendría un ciclo dentro de otro (por ejemplo, comparar cada venta con todas las demás). En ese caso, al multiplicar n por 10 el trabajo se multiplicaría por **100**. Los factores medidos son 10,00 y 1,00, lejos de 100.

### Ideas para recordar

- **O(1):** el trabajo no cambia cuando crece n.
- **O(n):** el trabajo crece en la misma proporción que n.
- Las constantes no cambian la clasificación: `totalPorCiudad` hace el doble de operaciones que `totalVendido`, pero ambas son O(n).

### Límites de esta medición

- Cuento operaciones de mis funciones, no tiempo. Una operación de buscar o sumar en un objeto no es igual a una suma, pero la trato como una sola.
- No medí `topProductosPorValor`, que ordena la lista de productos con `sort`. Ese paso depende del número de productos (5 en estos datos), no de n, y el ordenamiento suele crecer más rápido que lineal respecto a ese número.
- Los datos generados tienen siempre las mismas 4 ciudades y 5 productos, y por eso el tamaño de los grupos no crece con n.

## Traza de `clientesRecurrentes` (versión original) con 5 ventas

Arreglo de prueba: las ventas con id 1 a 5. Índices y clientes:

| Índice | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| Cliente | C01 | C02 | C03 | C01 | C04 |

Cada fila de la traza es una comparación `ventas[i].cliente === ventas[j].cliente`. La variable `recurrentes` empieza vacía (`[]`).

| Nº | i | j | `ventas[i].cliente` | `ventas[j].cliente` | ¿Iguales? | `recurrentes` después |
|---:|---:|---:|---|---|---|---|
| 1 | 0 | 1 | C01 | C02 | no | [] |
| 2 | 0 | 2 | C01 | C03 | no | [] |
| 3 | 0 | 3 | C01 | C01 | **sí**; `includes` dice que C01 no está, se agrega | [C01] |
| 4 | 0 | 4 | C01 | C04 | no | [C01] |
| 5 | 1 | 2 | C02 | C03 | no | [C01] |
| 6 | 1 | 3 | C02 | C01 | no | [C01] |
| 7 | 1 | 4 | C02 | C04 | no | [C01] |
| 8 | 2 | 3 | C03 | C01 | no | [C01] |
| 9 | 2 | 4 | C03 | C04 | no | [C01] |
| 10 | 3 | 4 | C01 | C04 | no | [C01] |

Con i = 4 el ciclo interno no se ejecuta, porque no quedan ventas después.

**Resultado:** `['C01']`. Es correcto, porque con estas 5 ventas solo C01 compró más de una vez.
**Comparaciones entre ventas: 10.**
(Además, `recurrentes.includes` se ejecutó una vez, en la comparación 3, y revisó una lista vacía.)

### Cuántas comparaciones hace el ciclo interno por cada i

| i | Valores de j | Comparaciones |
|---:|---|---:|
| 0 | 1, 2, 3, 4 | 4 |
| 1 | 2, 3, 4 | 3 |
| 2 | 3, 4 | 2 |
| 3 | 4 | 1 |
| 4 | (ninguno) | 0 |
| | **Total** | **10** |

### Generalización para n ventas

Para cada i, el ciclo interno hace n − 1 − i comparaciones. La suma da:

(n − 1) + (n − 2) + ... + 2 + 1 + 0 = **n(n − 1) / 2**

Con n = 5: 5 × 4 / 2 = 10, igual que la traza.

| n | Comparaciones = n(n−1)/2 |
|---:|---:|
| 5 | 10 |
| 12 | 66 |
| 100 | 4.950 |
| 1.000 | 499.500 |
| 10.000 | 49.995.000 |
| 100.000 | 4.999.950.000 |

Esto coincide con lo medido con el contador (499.500 con n = 1.000 y 49.995.000 con n = 10.000).

**Conclusión:** el número de comparaciones es casi n²/2, así que la función es **O(n²)**: si n se multiplica por 10, las comparaciones se multiplican por casi 100. Eso explica que con 12 datos no se notara y que con el historial anual tardara varios minutos. Esas comparaciones no dependen de cuántos clientes se repitan: se hacen siempre, aunque nadie sea recurrente.

### Comparación con la versión corregida (mismas 5 ventas)

La versión corregida cuenta compras en un objeto:

| Paso | Operaciones |
|---|---:|
| Primer ciclo: 1 visita por venta | 5 |
| Segundo ciclo: 1 visita por cliente distinto (C01, C02, C03, C04) | 4 |
| **Total** | **9** |

Con n = 5, 10 contra 9 casi no se diferencia. Con n = 1.000 son 499.500 contra unas 1.200 (medido). La versión corregida hace n visitas más el número de clientes distintos, que nunca supera n, así que es **O(n)**.

## Análisis de tiempos de `clientesRecurrentes` (versión original)

### 1. ¿Qué pasa cuando n se duplica?

Medí cada tamaño 5 veces y tomé la mediana, para reducir el ruido.

| n | Tiempo (mediana, ms) | Factor frente al tamaño anterior |
|---:|---:|---:|
| 1.000 | 5,21 | - |
| 2.000 | 10,96 | 2,10 |
| 4.000 | 49,97 | 4,56 |
| 8.000 | 239,31 | 4,79 |
| 16.000 | 1.248,77 | 5,22 |

**Lectura:** al duplicar n, el tiempo se multiplica por entre 4,5 y 5,2 en los tamaños grandes. Eso es lo que predice O(n²): si el trabajo es proporcional a n², duplicar n lo multiplica por 2² = 4. Comparar con O(n), donde duplicar n duplicaría el tiempo (factor 2).

- **Factor 2,10 con n = 2.000:** no es una excepción. Con 5 y 11 ms el tiempo es tan corto que el ruido del computador domina.
- **Factores un poco por encima de 4:** el ciclo interno recorre un arreglo cada vez más grande que ya no cabe tan bien en la memoria rápida del procesador, y `includes` suma trabajo extra (ver punto 3).
- Al ajustar la curva con todos los puntos, el exponente da 2,03, es decir, casi exactamente cuadrático.

### 2. Estimación para 100.000 y 1.000.000 de ventas

Estimé con el tiempo de n = 16.000 (1.249 ms), multiplicándolo por (n / 16.000)²:

| n | Estimación | Resultado real |
|---:|---:|---:|
| 100.000 | 48,8 s | **63,8 s** |
| 1.000.000 | 4.878 s (81 min) | no se ejecutó |

- **Se ejecutó 100.000** porque la estimación era menor a dos minutos.
- **La estimación se quedó corta cerca de un 25 %.** De 16.000 a 100.000 el tiempo se multiplicó por 51, no por 39 (que es 6,25²). El exponente real en ese tramo es 2,15, un poco mayor que 2, por los efectos de memoria y por `includes`. Es una limitación de extrapolar con tamaños pequeños.
- **Para 1.000.000, con el dato real de 100.000:** si fuera exactamente n² serían 63,8 × 100 = 6.380 s (1,8 horas). Con el exponente 2,15 medido, serían unas 8.900 s (2,5 horas). Estimación: **entre 1,8 y 2,5 horas**. No se ejecutó porque supera por mucho los dos minutos.
- **Conclusión:** con 100.000 ventas ya tarda más de un minuto, y con un millón tardaría horas. Esto explica que la gerente viera que "se quedó pensando varios minutos".

### 3. Costo oculto: `recurrentes.includes`

`includes` no es gratis: **recorre el arreglo `recurrentes` buscando el cliente**, hasta encontrarlo o llegar al final. Solo se ejecuta cuando dos ventas son del mismo cliente (el `&&` salta el `includes` si la primera condición es falsa).

- **Cuántas veces se llama:** una vez por cada par de ventas del mismo cliente.
- **Cuánto cuesta cada llamada:** hasta el tamaño actual de `recurrentes` (m), que puede llegar a n/2.

Medí los pasos que hace `includes` por dentro con n = 6.000, donde el ciclo doble hace 17.997.000 comparaciones (n(n−1)/2):

| Situación | Llamadas a `includes` | Pasos dentro de `includes` | Pasos como % de las comparaciones |
|---|---:|---:|---:|
| Nadie repite | 0 | 0 | 0 % |
| Cada cliente compra 2 veces | 3.000 | 4.498.500 | 25 % |
| Cada cliente compra 10 veces | 27.000 | 8.112.900 | 45 % |
| Cada cliente compra 100 veces | 297.000 | 9.058.440 | 50 % |
| Todas las ventas son del mismo cliente (peor caso) | 17.997.000 | 17.996.999 | 100 % |

**Efecto en la complejidad:**

- El doble ciclo hace siempre n(n−1)/2 comparaciones, sin importar los datos.
- `includes` suma, como mucho, otro tanto parecido: en el peor caso (todos los pares coinciden), una llamada por par, y cada una cuesta al menos un paso. El total sube a casi **n²** comparaciones, el doble del mejor caso.
- Si hay muchos clientes con pocas repeticiones, el costo de `includes` es una fracción menor (25 % al 50 % extra).
- **La clase de complejidad no cambia: sigue siendo O(n²).** `includes` multiplica la constante por un factor de hasta 2, pero no hace que crezca más rápido que n². Su efecto real es que el tiempo depende de los datos: en el mejor caso (nadie repite) es n²/2, y en el peor, casi n².
- Eso explica por qué los factores medidos (4,5 a 5,2) quedan por encima de 4.

**Corrección:** contar las compras por cliente en un objeto, con un solo recorrido, elimina tanto el doble ciclo como el `includes`: hace unas n + (clientes distintos) operaciones, O(n).

## Conclusión para la gerente: por qué el reporte de clientes recurrentes se volvía lento

**Qué pasaba**

La versión preliminar buscaba a los clientes que compraron más de una vez comparando **cada venta con todas las demás**, una por una. Es como si, para saber qué clientes repiten, alguien tomara la primera factura del año y la revisara contra todas las demás, luego la segunda contra todas las siguientes, y así hasta el final.

Con pocas ventas eso no se nota. Con las 12 ventas de prueba son unas 66 comparaciones y el resultado sale al instante, por eso en las pruebas funcionó. Pero el trabajo no crece al mismo ritmo que las ventas, sino mucho más rápido: **si las ventas se duplican, el trabajo se multiplica por cuatro**.

**Lo que medimos**

| Ventas | Tiempo de la versión preliminar |
|---:|---|
| 1.000 | unos 5 milésimas de segundo |
| 16.000 | cerca de 1 segundo |
| 100.000 | un poco más de 1 minuto |
| 1.000.000 | entre 1,8 y 2,5 horas (estimado, no se ejecutó) |

Un año de historial se parece a los números de abajo, no a los de arriba. Por eso el reporte "se quedaba pensando varios minutos". No es un problema de los datos ni del computador, sino de la forma en que la función hacía la búsqueda.

**Qué se hizo**

La nueva versión recorre las ventas **una sola vez** y va anotando cuántas compras tiene cada cliente, como una libreta con una línea por cliente. Al terminar, revisa la libreta y separa a los que tienen más de una compra.

| Ventas | Tiempo de la versión nueva |
|---:|---|
| 100.000 | unas centésimas de segundo |
| 1.000.000 | menos de 1 segundo |

**Que el resultado sea el mismo**

Se compararon las dos versiones con distintos volúmenes de datos y entregan la misma lista de clientes, en el mismo orden. Con los 12 datos de prueba, los clientes recurrentes son C01, C02 y C03.

**Qué significa para el negocio**

El reporte ahora responde al instante con el historial anual, y seguirá haciéndolo aunque las ventas se multipliquen. A futuro, una prueba con pocos datos no avisa de este tipo de problema, así que conviene probar los reportes con volúmenes parecidos a los reales antes de entregarlos.

*Nota: los tiempos corresponden a las pruebas realizadas en el entorno de desarrollo y pueden variar en otro computador. El caso de 1.000.000 de ventas es una estimación.*