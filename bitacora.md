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
## Comparación: `totalCiudadCadena` y `totalCiudadUnaPasada`

**Comprobación:** con `generarVentas(10000)`, ambas devuelven el mismo valor para Medellín, Bogotá, Cali y Pereira, y también con ciudades escritas con mayúsculas y espacios sobrantes.

### Recorridos y arreglos nuevos

| | `totalCiudadCadena` | `totalCiudadUnaPasada` |
|---|---|---|
| Recorridos completos | 4: `map`, `filter`, `map`, `reduce`. Los dos primeros recorren las n ventas; los dos últimos, solo las k que pasan el filtro. | 1 |
| Elementos visitados | 2n + 2k (en la prueba: 24.836) | n (10.000) |
| Arreglos grandes nuevos | 3 (uno por `map`, uno por `filter`, otro por el segundo `map`) | 0 |
| Arreglos pequeños nuevos | 2 por cada venta, porque `normalizarCiudad` usa `split` y `map` | 0 |
| **Total de arreglos nuevos** | **2n + 5** | **0** |

Además, el primer `map` crea n objetos nuevos (una copia de cada venta con la ciudad normalizada).

### Notación Big O

| | Tiempo | Espacio adicional |
|---|---|---|
| `totalCiudadCadena` | O(n) | O(n) |
| `totalCiudadUnaPasada` | O(n) | O(1) |

- **Tiempo:** las dos son O(n). En la cadena hay 4 recorridos y en la otra 1, pero 4n también crece de forma proporcional a n. La constante es mayor, el crecimiento es el mismo.
- **Espacio:** la cadena guarda arreglos intermedios cuyo tamaño crece con n (el primer `map` guarda n ventas copiadas), así que usa memoria proporcional a n. La de una pasada usa solo unas pocas variables (`total`, `buscada`), sin importar cuántas ventas haya.
- Los 2n arreglos pequeños de `split` y `map` no ocupan memoria todos a la vez: cada uno queda descartado enseguida. Cuentan para el trabajo de crearlos (parte del tiempo), no para el pico de memoria.

### Conclusión

Dan el mismo resultado y tienen la misma complejidad de tiempo. La versión en cadena es más fácil de leer paso a paso. La de una pasada es más eficiente con memoria, y por eso la prefiero cuando el volumen de ventas es grande.

## 1. Por qué ambas versiones de `totalCiudad` son O(n) en tiempo

`totalCiudadCadena` recorre arreglos cuatro veces y `totalCiudadUnaPasada` una sola, pero las dos son O(n). La razón son las reglas de simplificación de la notación Big O:

1. **Se eliminan las constantes multiplicativas.** O(n) no describe cuánto tarda, sino **cómo crece** el trabajo cuando n crece. Si el trabajo es 4n, al multiplicar n por 10 se multiplica por 10, igual que con n. Por eso 4n, 2n y 100n son todos O(n).
2. **Se conserva solo el término que más crece.** En la cadena, las visitas son 2n + 2k, donde k es el número de ventas de esa ciudad y k ≤ n. En el peor caso (todas son de esa ciudad) son 4n, y en el mejor, 2n. En ambos casos queda entre 2n y 4n: O(n).

Comprobación con los datos medidos (n = 10.000, k = 2.418): la cadena visitó 24.836 elementos y la de una pasada 10.000, es decir, unas 2,5 veces más trabajo. Pero si se duplican las ventas, ambas duplican su trabajo. La constante cambia **cuánto** tardan, no **cómo crece** su tiempo.

Esto es distinto al caso de `clientesRecurrentes`, donde el doble ciclo hacía n(n−1)/2 pasos. Ahí el trabajo crece con n², y al multiplicar n por 10 se multiplica por 100. Una constante no puede "arreglar" ese crecimiento, y por eso fue necesario cambiar el algoritmo.

## 2. Complejidad espacial de las funciones del motor

Criterio: cuento la memoria adicional que crea la función (incluido lo que devuelve), sin contar el arreglo de entrada. Uso c = ciudades distintas, p = productos distintos, m = clientes distintos y k = ventas que pasan un filtro. Todos esos valores son menores o iguales que n.

| Función | Memoria adicional | Por qué |
|---|---|---|
| `valorVenta` | O(1) | Una multiplicación. |
| `totalVendido`, `unidadesVendidas` | O(1) | Una sola variable acumuladora. |
| `ventaMayor` | O(1) | Guarda una referencia a una venta que ya existe, no una copia. |
| `ticketPromedio` | O(1) | Dos contadores (`total` y `validas`). |
| `ventasPorCiudad` | O(1) | Una variable y un texto temporal por vuelta. |
| `totalVendidoM`, `unidadesVendidasM` | O(1) | `reduce` lleva un solo número y no crea arreglos. |
| `ventasPorCiudadM` | O(k), peor caso O(n) | `filter` crea un arreglo con las ventas de esa ciudad. |
| `normalizarCiudad` | O(1) respecto a n | Crea arreglos pequeños (las palabras de un nombre), de tamaño independiente de n. |
| `primeraVenta` | O(1) | No crea nada. |
| `totalCiudadUnaPasada` | O(1) | Una variable acumuladora. |
| `totalCiudadCadena` | O(n) | Crea un arreglo de n ventas copiadas y otros dos de tamaño k. |
| `ventasDelDia` | O(k), peor caso O(n) | `filter` guarda las ventas de ese día. |
| `totalPorCiudad` | **O(c)** | El objeto resultado tiene una entrada por ciudad distinta. |
| `unidadesPorProducto` | **O(p)** | Una entrada por producto distinto. |
| `topProductosPorValor` | **O(p)** | Un objeto de p productos, una lista de p, una copia ordenada de p y el recorte de k. |
| `clientesRecurrentes` (corregida) | **O(m)** | Un objeto con una entrada por cliente distinto, más la lista de recurrentes. |

### Las dos que pediste revisar

- **`totalPorCiudad`:** no usa memoria "proporcional a las ventas", sino a las **ciudades distintas**. Con 4 ciudades fijas (como en los datos medidos), ocupa lo mismo con 100 ventas que con 100.000, así que en la práctica se comporta como O(1) respecto a n. Pero en el peor caso (cada venta en una ciudad diferente) c = n y sería O(n). Por eso la clasifico como O(c), con c ≤ n.
- **`topProductosPorValor`:** también depende de los **productos distintos** (5 en los datos), no de n. Además hay un costo oculto: `[...lista]` copia el arreglo para no modificar el original, así que durante la ordenación hay dos listas de p elementos. Sigue siendo O(p), con una constante mayor. En tiempo no es lineal: el `sort` cuesta O(p log p), y el recorrido de las ventas, O(n). El total es O(n + p log p). Como p es pequeño, el recorrido domina.

### Idea clave

- Las funciones que solo **acumulan un número** usan memoria constante.
- Las que **agrupan** guardan una entrada por grupo: su memoria depende del número de grupos, no del de ventas.
- Las que usan `filter` o `map` crean **arreglos nuevos** y pagan memoria proporcional a lo que dejan pasar.
- `clientesRecurrentes` corregida usa más memoria que la original (que solo guardaba la lista de recurrentes) a cambio de pasar de O(n²) a O(n) en tiempo. Es un intercambio de memoria por velocidad, y aquí conviene.

## 3. Decisión: qué versión de `totalCiudad` queda en el motor

**Decisión:** dejo **`totalCiudadUnaPasada`**.

| Criterio | `totalCiudadCadena` | `totalCiudadUnaPasada` |
|---|---|---|
| Tiempo | O(n) | O(n) |
| Memoria adicional | O(n) | O(1) |
| Recorridos | 4 | 1 |
| Arreglos nuevos (n = 10.000) | 20.005 | 0 |
| Legibilidad | Cada paso tiene nombre (normalizar, filtrar, valorar, sumar). | Un ciclo con un `if` y una suma. |

**Justificación:**

- **Legibilidad:** la cadena es más declarativa, pero la versión de una pasada no es difícil de leer: ocho líneas con un ciclo, un `if` y una suma, como las demás funciones del motor (`totalVendido`, `ventasPorCiudad`). La diferencia de legibilidad es pequeña.
- **Recursos:** la cadena crea una copia de cada venta y 2n arreglos pequeños solo para comparar ciudades. Con un año de historial, eso es memoria y trabajo que no aporta nada al resultado.
- **Mismo resultado:** probé que dan el mismo valor con 10.000 ventas y con ciudades sucias, así que el cambio no cuesta exactitud.
- **Quién la usa:** el reporte lo ejecuta la gerente con el historial anual, que es justo donde los recursos importan. La legibilidad la necesita quien mantiene el código, y con esta versión no sale perdiendo.

**Qué hago con la otra:** `totalCiudadCadena` queda solo como referencia para comparar en las pruebas y en las mediciones (`pruebas.js` y `medir.js`), no la usa el reporte.

**Un punto a anotar:** en el motor ya existe `ventasPorCiudad`, que hace casi lo mismo. La diferencia es que `totalCiudadUnaPasada` también junta los espacios repetidos *dentro* del nombre (`"Santa  Marta"` igual a `"Santa Marta"`). Conviene dejar claro cuál usa el reporte y, a futuro, unificar las dos.

## Método aplicado a `clientesRecurrentes`

Problema: dado el arreglo de ventas, devolver los clientes que compraron más de una vez.

### 1. Entender el problema

**Entradas**
- `ventas`: un arreglo de ventas. Cada venta es un objeto con (entre otras) la propiedad `cliente`, un texto como `"C01"`.

**Salida**
- Un arreglo con los códigos de los clientes que aparecen en **más de una venta**.

**Restricciones y decisiones**
- Cada cliente aparece **una sola vez** en el resultado, aunque haya comprado muchas veces.
- El orden es el de la **primera aparición** de cada cliente en las ventas.
- Los códigos se comparan **tal cual**: `"C01"` y `"c01 "` son clientes distintos. No se normalizan.
- Todas las ventas cuentan, incluso la de cantidad 0 (fila 8). La función no decide qué ventas son válidas: si se quiere excluirlas, se filtran antes de llamarla.
- No debe modificar el arreglo de entrada.
- Debe responder en un tiempo razonable con un historial anual (decenas o cientos de miles de ventas).

### 2. Ejemplos y casos borde

| Caso | Entrada (clientes) | n | Salida esperada |
|---|---|---:|---|
| Datos del Día 1 | las 12 ventas | 12 | `["C01", "C02", "C03"]` |
| Arreglo vacío | `[]` | 0 | `[]` |
| Una sola venta | C01 | 1 | `[]` |
| Nadie repite | C01, C02, C03 | 3 | `[]` |
| Un cliente con 3 compras | C01, C01, C01 | 3 | `["C01"]` (una sola vez) |
| Todas del mismo cliente | C01, C01, C01, C01 | 4 | `["C01"]` |
| Orden de aparición | C02, C01, C02, C01 | 4 | `["C02", "C01"]` |
| Mismo cliente escrito distinto | C01, "c01 " | 2 | `[]` (se consideran distintos) |
| Venta con cantidad 0 | C06 (cantidad 0), C06 (cantidad 2) | 2 | `["C06"]` (la función no filtra) |

Los casos que más pueden fallar son el **un cliente con muchas compras** (que no se repita en la lista) y el **orden**, porque cambian según cómo se escriba la solución.

### 3. Fuerza bruta y su complejidad

**Idea:** comparar cada venta con todas las que vienen después. Si dos son del mismo cliente y ese cliente aún no está en la lista, agregarlo.

```js
function clientesRecurrentesLento(ventas) {
  const recurrentes = [];
  for (let i = 0; i < ventas.length; i++) {
    for (let j = i + 1; j < ventas.length; j++) {
      if (ventas[i].cliente === ventas[j].cliente && !recurrentes.includes(ventas[i].cliente)) {
        recurrentes.push(ventas[i].cliente);
      }
    }
  }
  return recurrentes;
}
```

**Es correcta:** da el resultado esperado en todos los casos de la tabla. Su problema es el costo.

**Complejidad de tiempo:**
- El doble ciclo hace n(n − 1) / 2 comparaciones: 66 con n = 12, 6 con n = 4, 0 con n = 0 o n = 1.
- `includes` suma otro recorrido (de la lista de recurrentes) cada vez que dos ventas coinciden. En el peor caso casi duplica el trabajo.
- Total: **O(n²)**.

**Complejidad de espacio:** **O(r)**, donde r es el número de clientes recurrentes (la lista del resultado).

**Medido:** con 10.000 ventas tardó 455 ms; con 100.000, 63,8 s. Al duplicar n, el tiempo se multiplica por cerca de 4.

### 4. Idea de optimización

**Qué trabajo se repite:** para cada venta se vuelve a buscar, recorriendo las demás, si su cliente aparece de nuevo. Se hace la misma pregunta ("¿este cliente ya salió antes?") una y otra vez, y cada vez se responde mirando todo el arreglo.

**Qué información se puede guardar para no buscarla de nuevo:** cuántas compras lleva cada cliente. Con un objeto `compras` (una entrada por cliente), cada venta se resuelve en un solo paso: se consulta la entrada de su cliente y se le suma 1.

**Idea en dos pasos (ya implementada):**
1. Recorrer las ventas una sola vez, contando las compras de cada cliente en el objeto.
2. Recorrer el objeto y quedarse con los clientes que tienen más de 1 compra.

**Complejidad:**
- Tiempo: **O(n)** (n visitas más las m entradas del objeto, con m ≤ n).
- Espacio: **O(m)**, donde m es el número de clientes distintos. Se paga memoria para ahorrar tiempo.

**Comprobación:** da la misma salida, en el mismo orden, que la fuerza bruta en todos los casos de la tabla y en 15 conjuntos generados de 2 a 2.000 ventas. Con 100.000 ventas tarda unos 14 ms contra 63,8 s.

**Mejora posterior (solo idea):** guardar los clientes ya vistos entre reportes para procesar solo las ventas nuevas. Está descrita en `RENDIMIENTO.md`, sección "Plan de optimización".

## Intercambio entre tiempo y memoria de `clientesRecurrentes` (Set y Map)

### La idea en palabras simples

La versión original no recuerda nada: cada vez que quiere saber si un cliente ya compró antes, **vuelve a mirar todas las ventas**. La nueva versión **anota en una libreta** (un `Set` o un `Map`) quién ya compró, y consulta esa libreta en un solo paso. Gasta memoria para guardar la libreta, y a cambio ya no necesita repetir las búsquedas.

### Qué se gana y qué se paga

| | Original (doble ciclo) | Nueva (`Set` o `Map`) |
|---|---|---|
| Tiempo | O(n²) | O(n) |
| Memoria adicional | O(r): solo la lista de recurrentes | O(m): un registro por cada cliente distinto |
| Con 10.000 ventas | 377 a 499 ms | 0,7 a 1 ms |
| Con 100.000 ventas | 63,8 s | unos 5 ms |

(r = clientes recurrentes y m = clientes distintos, con r ≤ m.)

Se ahorró el trabajo de **buscar** y se pagó el de **recordar**.

### Cuánta memoria cuesta, medida

Con 1.000.000 de ventas hubo 221.550 clientes distintos y 209.853 recurrentes. Memoria retenida por cada estructura (medida con el recolector de basura, es aproximada):

| Estructura | Memoria |
|---|---:|
| Lista de recurrentes de la original (r) | 2 MB |
| `Map` con la cuenta de cada cliente (m) | 7 MB |
| Dos `Set`, vistos y recurrentes | 10 MB |
| Objeto con la cuenta de cada cliente | 12 MB |
| Las 1.000.000 de ventas, para comparar | 140 MB |

Conclusión: la memoria adicional de la nueva solución es de **5 a 10 MB**, un 5 % a 8 % de lo que ya ocupan los datos. A cambio, el tiempo baja de más de un minuto a milisegundos. Es un intercambio muy favorable.

### Por qué la diferencia de memoria es pequeña en estos datos

En los datos generados casi todos los clientes compran más de una vez (209.853 recurrentes de 221.550 clientes), así que la lista de la original (r) es casi tan grande como la libreta de la nueva (m). Si **pocos** clientes repitieran, la original guardaría una lista diminuta, y la nueva seguiría guardando a todos los clientes. Ahí la diferencia de memoria sería mayor, pero el ahorro de tiempo seguiría siendo el mismo.

### Cuándo conviene y cuándo no

- **Conviene** cuando el tiempo es el problema (historial anual) y la memoria sobra. Es el caso del reporte: 140 MB de ventas más unos pocos MB de libreta.
- **No conviene** si hubiera muy poca memoria disponible y pocos datos: con 12 ventas la versión original es igual de rápida y no necesita libreta.
- **No se puede evitar el costo de la memoria** si se quiere no buscar de nuevo: para saber que un cliente ya compró hay que recordarlo, así que la memoria crece con el número de clientes distintos (m), aunque no con el número de ventas.

### Costos ocultos de la memoria

- **La memoria también cuesta tiempo.** Con 1.000.000 de ventas, `clientesRecurrentes` tardó 4 a 6 veces más de lo proyectado a partir de 10.000 ventas. Una libreta con cientos de miles de entradas ya no cabe en la memoria rápida del procesador y se redimensiona al crecer.
- **Entre las dos versiones nuevas:** con 1.000.000 de ventas el `Map` tardó 236 ms y los dos `Set` 394 ms, porque los `Set` mantienen dos conjuntos grandes a la vez (10 MB contra 7 MB). Con 100.000 ventas o menos no se nota diferencia.
- **Qué guarda cada una:** el `Map` guarda un número por cliente (cuántas compras hizo), lo que sirve para otras preguntas (por ejemplo, quién compró 5 veces o más). Los `Set` solo guardan "ya lo vi" y "es recurrente", que alcanza para esta pregunta pero no para otras.

### Resumen

Se cambió una búsqueda repetida (tiempo cuadrático, poca memoria) por una libreta de clientes (tiempo lineal, memoria proporcional a los clientes distintos). El costo en memoria es de unos pocos MB y el beneficio en tiempo es de varios órdenes de magnitud.

## Clasificación de complejidad: funciones de la campaña de fin de año

n = número de productos del catálogo (`comboRegaloMap`) o de ventas (las otras dos).

| Función | Tiempo | Espacio extra | Por qué |
|---|---|---|---|
| `comboRegaloMap(catalogo, valor)` | O(n) | O(n) | Un solo recorrido. Cada `has`, `get` y `set` del Map cuesta O(1). El Map guarda hasta n precios. |
| `productoEstrellaPorCiudad(ventas)` | O(n) | O(n) | El primer recorrido cuenta las n ventas. El segundo recorre los Maps internos, que en total tienen como máximo n entradas. |
| `primerClienteUnico(ventas)` | O(n) | O(n) | Dos recorridos seguidos: n + n = 2n, que se simplifica a O(n). El Map guarda un contador por cliente distinto. |

### Mejor y peor caso
- `comboRegaloMap` termina apenas encuentra la pareja. Mejor caso: O(1) (la pareja está en los dos primeros productos). Peor caso: O(n) (no hay pareja).
- `primerClienteUnico` puede cortar el segundo recorrido antes, pero el primero siempre es completo. Su mejor caso sigue siendo O(n).

### Notas
- El espacio real de `productoEstrellaPorCiudad` es O(c · p), con c ciudades y p productos distintos, y nunca pasa de n. En los datos del Día 1 son 4 ciudades y 5 productos.
- `normalizarCiudad` recorre el texto de la ciudad. Como los nombres son cortos, se toma como O(1).

### Comparación con las versiones lentas
- `comboRegalo` (fuerza bruta): O(n²) en tiempo, O(1) de espacio extra.
- `clientesRecurrentes` original: O(n²) en tiempo.
- Las funciones nuevas bajan a O(n) en tiempo y pagan con O(n) de memoria (intercambio tiempo–memoria).

## Las tres primeras ventanas (k = 7)

Días de septiembre (en miles): 320, 410, 280, 390, 510, 620, 700, 300, 290, 450, ...

```
Día:      1    2    3    4    5    6    7    8    9   10
Valor:  320  410  280  390  510  620  700  300  290  450

Ventana 1: [320  410  280  390  510  620  700]  300  290  450   = 3230
Ventana 2:  320 [410  280  390  510  620  700  300] 290  450    = 3210
Ventana 3:  320  410 [280  390  510  620  700  300  290] 450    = 3090
```

| Ventana | Días | Cómo se calcula | Total |
|---|---|---|---|
| 1 | 1 a 7 | 320 + 410 + 280 + 390 + 510 + 620 + 700 (suma completa) | 3230 |
| 2 | 2 a 8 | 3230 + 300 (entra el día 8) − 320 (sale el día 1) | 3210 |
| 3 | 3 a 9 | 3210 + 290 (entra el día 9) − 410 (sale el día 2) | 3090 |

La versión deslizante suma completa solo la primera ventana. Las demás se calculan con una suma y una resta.
La mejor ventana de todo el mes es la del día 24 al 30, con 3670 (miles).

## Par más cercano al presupuesto: `parMasCercano` (dos punteros)

### Idea
Se ordenan los productos por precio. Un puntero `i` empieza en el más barato y otro `j` en el más caro.
- Si la suma **supera** el presupuesto, el más caro no sirve con nadie más barato que `i` (ya sería menor, pero `i` es el menor posible): se baja `j`.
- Si la suma **cabe**, se guarda si es la mejor hasta ahora y se sube `i` para buscar una suma mayor.
- Si la suma es **exactamente** el presupuesto, no se puede mejorar y se termina.
- Termina cuando `i` y `j` se juntan. Si nunca hubo una suma que cupiera, devuelve `null`.

### Catálogo ordenado
| Posición | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| Producto | Filtros | Nariño 250 g | Taza | Huila 500 g | Sierra 500 g | Huila 1 kg | Prensa | Molino |
| Precio | 18.000 | 26.000 | 35.000 | 42.000 | 45.000 | 79.000 | 95.000 | 120.000 |

### Traza para 100.000
| Paso | i | j | Suma | ¿Cabe? | Acción | Mejor hasta ahora |
|---|---|---|---|---|---|---|
| 1 | 0 (18.000) | 7 (120.000) | 138.000 | No | j baja | ninguno |
| 2 | 0 (18.000) | 6 (95.000) | 113.000 | No | j baja | ninguno |
| 3 | 0 (18.000) | 5 (79.000) | 97.000 | Sí | se guarda, i sube | **97.000** (Filtros + Huila 1 kg) |
| 4 | 1 (26.000) | 5 (79.000) | 105.000 | No | j baja | 97.000 |
| 5 | 1 (26.000) | 4 (45.000) | 71.000 | Sí | no mejora, i sube | 97.000 |
| 6 | 2 (35.000) | 4 (45.000) | 80.000 | Sí | no mejora, i sube | 97.000 |
| 7 | 3 (42.000) | 4 (45.000) | 87.000 | Sí | no mejora, i sube | 97.000 |
| 8 | 4 | 4 | - | - | i = j, termina | 97.000 |

Resultado: Filtros de papel x100 + Origen Huila 1 kg = 97.000. Se hicieron 7 sumas, no las 28 parejas.

### Resultados de las pruebas
| Presupuesto | Resultado |
|---|---|
| 100.000 | Filtros + Huila 1 kg = 97.000 |
| 140.000 | Sierra 500 g + Prensa francesa = 140.000 (exacto) |
| 40.000 | `null` (la pareja más barata, Filtros + Nariño, ya cuesta 44.000) |

### Complejidad
| Función | Tiempo | Espacio extra |
|---|---|---|
| `comboRegalo` (fuerza bruta) | O(n²) | O(1) más el resultado |
| `comboRegaloMap` | O(n) | O(n) |
| `parMasCercano` | **O(n log n)** | **O(n)** |

Desglose de `parMasCercano`:
- **Copiar el arreglo:** O(n) tiempo y O(n) espacio.
- **Ordenar:** O(n log n) tiempo. Es el paso más caro.
- **Dos punteros:** O(n) tiempo, porque cada paso mueve `i` hacia arriba o `j` hacia abajo, y como mucho hay n pasos. Usa O(1) de espacio extra.
- **Total:** O(n log n) + O(n) = O(n log n) en tiempo, y O(n) en espacio por la copia.

`comboRegaloMap` solo sirve para una suma exacta. "Lo más cerca posible sin pasarse" necesita comparar sumas, y para eso hace falta el orden. Si el catálogo ya estuviera ordenado, solo se pagaría el recorrido O(n).

## Cierre: resumen de los MiniRetos y estrategias de optimización

| MiniReto | Qué construí | Archivos |
|---|---|---|
| 1. Explorar los datos | Las 12 ventas como arreglo de objetos, diccionario de datos y casos borde (ciudad con minúscula, cantidad 0). | `datos.js`, `explorar.js` |
| 2. Funciones con ciclos | `valorVenta`, `totalVendido`, `unidadesVendidas`, `ventaMayor`, `ticketPromedio` y `ventasPorCiudad`, con pruebas de arreglo completo, de un elemento y vacío, y trazas a mano. | `analitica.js`, `pruebas.js` |
| 3. Métodos de arreglos | Versiones con `reduce` y `filter` y programa que compara ambas versiones con las mismas entradas. | `analitica.js`, `verificar.js` |
| 4. Agrupar datos | `totalPorCiudad` (con ciudades normalizadas), `unidadesPorProducto` y `topProductosPorValor`. | `analitica.js` |
| 5. Reporte formateado | Reporte con pesos formateados, secciones alineadas y `ventasDelDia`, con validación de fechas. | `reporte.js`, `analitica.js` |
| 6. Reporte para la gerente | Reporte ejecutable sin abrir el código, reproducción de errores comunes, revisión automática de NaN y duplicados, README de uso. | `revisar.js`, `demostrar.js`, `README.md`, `reporte.bat` |
| 7. Medir y clasificar | Generador de ventas al azar, versiones con contador, predicciones antes de medir y clasificación O(1), O(n) y O(n²). | `generador.js`, `medir.js` |
| 8. Corregir el cuello de botella | `clientesRecurrentes` original O(n²) reproducido, versión O(n), tiempos con n = 1.000 a 16.000 y proyección a 100.000 y 1.000.000. | `analitica.js`, `medir.js` |
| 9. Informe de rendimiento | `RENDIMIENTO.md` con tabla de todas las funciones, proyección, ranking de riesgos y plan de optimización. | `RENDIMIENTO.md` |
| 10. Tiempo contra memoria | `totalCiudadCadena` contra `totalCiudadUnaPasada`, y `clientesRecurrentesSet`, `comprasPorCliente` y `clientesRecurrentesMap` con comparación de tiempos y memoria. | `analitica.js`, `medir.js` |
| 11. Campaña de fin de año | Catálogo, `comboRegalo` y `comboRegaloMap`, `parMasCercano`, `productoEstrellaPorCiudad` y `primerClienteUnico`. | `catalogo.js`, `analitica.js` |
| 12. Mejor semana y producto final | `mejorSemanaBruta` y `mejorSemana` (ventana deslizante), reporte v1.0 con 10 secciones y opción de n ventas, comparación v0.1 contra v1.0, README y `RENDIMIENTO.md` finales. | `datos.js`, `reporte.js`, `README.md`, `RENDIMIENTO.md` |

### Método que apliqué en cada optimización
Siempre los mismos cuatro pasos: **1)** entender el problema (entradas, salidas, restricciones); **2)** probar ejemplos y casos borde (vacío, un elemento, empates, sin solución); **3)** resolver por fuerza bruta y anotar su complejidad; **4)** buscar qué trabajo se repite y cómo evitarlo. Antes de dar por buena una versión rápida, la comparé con la lenta con los mismos datos.

| Optimización | Trabajo que se repetía | Estrategia | De → a | Costo |
|---|---|---|---|---|
| Clientes recurrentes | Comparar cada venta con todas las siguientes y revisar con `includes` | Recordar lo ya visto con `Set`/`Map` (tabla hash): preguntar "¿ya apareció?" cuesta O(1) | O(n²) → O(n) | Memoria O(m) |
| Total de una ciudad | Varios recorridos y arreglos intermedios (`map`, `filter`, `map`, `reduce`) | Fusionar los pasos en una sola pasada | O(n), 4 recorridos → O(n), 1 recorrido | Ninguno (gana también en memoria) |
| Combo de regalo exacto | Probar todas las parejas | Buscar el complemento (`valor − precio`) en un Map de precios ya vistos | O(q²) → O(q) | Memoria O(q) |
| Par más cercano al presupuesto | Probar todas las parejas, sin poder usar la búsqueda exacta | Ordenar y usar dos punteros: si la suma se pasa baja el mayor; si cabe sube el menor | O(q²) → O(q log q) | Copia y orden (O(q)) |
| Mejor semana | Volver a sumar k días en cada bloque | Ventana deslizante: reutilizar la suma anterior, sumando el día que entra y restando el que sale | O(n · k) → O(n) | Ninguno (O(1)) |
| Producto estrella por ciudad | Contar a mano producto por producto en cada ciudad | Conteo de frecuencias con un Map por ciudad, en un solo recorrido | O(n) | Memoria O(c · p) |
| Primer cliente con una sola compra | Contar las compras de cada cliente cada vez que se revisa uno | Dos recorridos con un Map: uno cuenta y otro busca el primero en el orden original | O(n) | Memoria O(m) |

### Lo que aprendí
- Casi toda mejora fuerte consiste en **no repetir trabajo**: recordar lo ya visto (Map/Set), reutilizar un resultado anterior (ventana) o ordenar una vez para poder descartar opciones (dos punteros).
- Optimizar casi siempre cambia **tiempo por memoria**; hay que decirlo y medirlo, no solo suponerlo.
- La estimación por Big O sirve para saber cómo crece el tiempo, pero los tiempos reales se desvían: hay que medir (por ejemplo, con 100.000 ventas la versión original tardó 63,8 s, más de lo estimado).
- Las pruebas con casos borde (vacío, un elemento, empates, sin solución) encontraron errores que el caso normal no mostraba (NaN, ciudades duplicadas, objetos con claves como "constructor").
- Con solo 8 productos o 12 ventas, fuerza bruta y versión optimizada se sienten igual. La diferencia aparece cuando n crece, y por eso medí con datos generados.