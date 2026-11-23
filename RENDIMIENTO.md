# Rendimiento del motor (v0.2)

Este documento resume cuánto trabajo y cuánta memoria usa cada función del motor, qué se proyecta para 1.000.000 de ventas, qué funciones tienen más riesgo cuando los datos crezcan y cuál sería el primer paso de optimización.

## Cómo leer los datos

- **n** es el número de ventas. Las mediciones usan `generarVentas(n)`.
- **Tiempo (Big O):** cómo crece el trabajo cuando n crece. O(1) no depende de n; O(n) crece en la misma proporción; O(n²) se multiplica por 100 cuando n se multiplica por 10.
- **Espacio (Big O):** memoria adicional que crea la función (incluido lo que devuelve), sin contar el arreglo de entrada.
- **Grupos distintos:** c = ciudades, p = productos, m = clientes, k = ventas de la ciudad buscada, d = ventas del día buscado. Con n = 10.000 hubo c = 4, p = 5, m = 1.000, k = 2.511 y d = 334. Con n = 1.000.000 hubo c = 4, p = 5, m = 175.849 y d = 33.334. Son datos aleatorios, así que cambian en cada ejecución.
- **Operaciones** = visitas + comparaciones, contadas con las versiones instrumentadas. Las marcadas "(contador)" son conteos exactos.
- **Tiempos:** medianas de varias ejecuciones, con calentamiento previo, en el entorno de pruebas. En otro computador serán distintos, y entre ejecuciones del mismo computador pueden variar hasta un 30 %. Los valores menores a 0,1 ms son solo un orden de magnitud.

## Tabla de funciones

### Funciones del motor

| Función | Qué hace | Tiempo | Espacio | Justificación | Medido con n = 10.000 |
|---|---|---|---|---|---|
| `valorVenta` | Calcula `cantidad × precio` de una venta. | O(1) | O(1) | Una multiplicación; no recorre nada. | 1 operación; ≈ 0,0002 ms |
| `totalVendido` | Suma el valor de todas las ventas. | O(n) | O(1) | Un solo `for...of`; una variable acumuladora. | 10.000 operaciones (contador); 0,10 ms |
| `unidadesVendidas` | Suma las unidades de todas las ventas. | O(n) | O(1) | Un solo `for...of`; una variable acumuladora. | 0,008 ms |
| `ventaMayor` | Devuelve la venta de mayor valor. | O(n) | O(1) | Un ciclo con una comparación por venta (menos la primera). Guarda una referencia a una venta existente, no una copia. | 19.999 operaciones (contador: 10.000 visitas + 9.999 comparaciones); 0,06 ms |
| `ticketPromedio` | Valor medio de las ventas válidas (cantidad > 0); `null` si no hay. | O(n) | O(1) | Un ciclo con dos contadores (`total` y `validas`). | 0,06 ms |
| `ventasPorCiudad` | Total vendido en una ciudad, ignorando mayúsculas y espacios. | O(n) | O(1) | Un ciclo; compara con `trim` y `toLowerCase`. | 0,23 ms |
| `totalVendidoM` | Igual que `totalVendido`, con `reduce`. | O(n) | O(1) | `reduce` lleva un solo número y no crea arreglos. | 0,06 ms |
| `unidadesVendidasM` | Igual que `unidadesVendidas`, con `reduce`. | O(n) | O(1) | Igual que la anterior. | 0,05 ms |
| `ventasPorCiudadM` | Igual que `ventasPorCiudad`, con `filter` y `reduce`. | O(n) | O(k), peor caso O(n) | `filter` crea un arreglo con las ventas de esa ciudad. | 0,25 ms (k = 2.511) |
| `totalPorCiudad` | Total vendido por cada ciudad, en un objeto. | O(n) | O(c), peor caso O(n) | Un ciclo; el objeto tiene una entrada por ciudad distinta, no por venta. | 20.000 operaciones (contador: 10.000 visitas + 10.000 revisiones); 1,37 ms |
| `unidadesPorProducto` | Unidades vendidas de cada producto, en un objeto. | O(n) | O(p), peor caso O(n) | Un ciclo; una entrada por producto distinto. | 0,26 ms (p = 5) |
| `topProductosPorValor` | Los k productos que más dinero generaron, de mayor a menor. | O(n + p log p) | O(p) | Un recorrido de las ventas, más ordenar los p productos con `sort`. La copia `[...lista]` evita modificar el original, pero duplica la lista de p productos. | 0,43 ms (k = 3) |
| `ventasDelDia` | Devuelve las ventas de una fecha. | O(n) por consulta | O(d), peor caso O(n) | `filter` recorre las n ventas y guarda las del día. Cada día consultado repite el recorrido completo. | 0,10 ms (d = 334) |
| `primeraVenta` | Devuelve la primera venta (o `null` si no hay). | O(1) | O(1) | Solo lee la posición 0; no recorre. | 1 operación (contador); ≈ 0,0002 ms |
| `clientesRecurrentes` | Clientes que compraron más de una vez. | O(n) | O(m), peor caso O(n) | Un ciclo cuenta las compras por cliente en un objeto y otro revisa los m clientes. Más memoria que la versión original, a cambio de ser mucho más rápida. | 11.000 operaciones (10.000 visitas + 1.000 clientes distintos); 0,39 ms |
| `totalCiudadUnaPasada` | Total vendido en una ciudad. **Es la versión que queda en el motor.** | O(n) | O(1) | Un solo ciclo, sin arreglos intermedios. | 0,62 ms; 0 arreglos nuevos (contador) |
| `normalizarCiudad` | Quita espacios y deja cada palabra con inicial mayúscula. | O(1) respecto a n | O(1) respecto a n | Trabaja sobre un solo nombre (pocas palabras). Cada llamada crea 2 arreglos pequeños. | No medida por separado |
| `claveCiudad` | Quita espacios y pasa a minúsculas, para comparar ciudades. | O(1) respecto a n | O(1) respecto a n | Solo operaciones sobre un texto; no crea arreglos. | No medida por separado |

### Funciones de medición

| Función | Qué hace | Tiempo | Espacio | Justificación | Medido con n = 10.000 |
|---|---|---|---|---|---|
| `nuevoContador` | Crea el objeto `{ visitas, comparaciones }`. | O(1) | O(1) | Un objeto con dos números. | - |
| `totalVendidoI`, `ventaMayorI`, `totalPorCiudadI`, `primeraVentaI` | Copias de las funciones originales que suman 1 al contador por cada visita o comparación. | Igual que su original | Igual que su original (`totalPorCiudadI`: O(c)) | El contador se pasa por referencia, así que cuenta sin cambiar el resultado. | 10.000, 19.999, 20.000 y 1 operaciones |
| `generarVentas` | Genera n ventas al azar para las pruebas. | O(n) | O(n) | Un ciclo que crea una venta por vuelta; el resultado tiene n elementos. | 1,9 ms |

### Funciones de referencia (no las usa el reporte)

| Función | Qué hace | Tiempo | Espacio | Justificación | Medido con n = 10.000 |
|---|---|---|---|---|---|
| `totalCiudadCadena` | Lo mismo que `totalCiudadUnaPasada`, con `map`, `filter`, `map` y `reduce`. Se usa para comparar. | O(n) | O(n) | 4 recorridos. Copia las n ventas y crea 2 arreglos pequeños por venta al normalizar. | 2,07 ms; 4 recorridos, 20.005 arreglos nuevos (2n + 5) (contador) |
| `clientesRecurrentesLento` | Versión original del compañero (en `medir.js`). | **O(n²)** | O(r) | Doble ciclo: compara cada venta con todas las siguientes, y `includes` recorre otra lista. `r` es el número de clientes recurrentes de esa lista. | 49.995.000 comparaciones (n(n−1)/2, calculado); 455 ms |

## Cómo crece el trabajo

Operaciones medidas con contador al multiplicar n por 10:

| n | `totalVendido` | `ventaMayor` | `totalPorCiudad` | `primeraVenta` |
|---:|---:|---:|---:|---:|
| 100 | 100 | 199 | 200 | 1 |
| 1.000 | 1.000 | 1.999 | 2.000 | 1 |
| 10.000 | 10.000 | 19.999 | 20.000 | 1 |
| 100.000 | 100.000 | 199.999 | 200.000 | 1 |

Al multiplicar n por 10, las tres primeras multiplican su trabajo por 10 (lineal) y `primeraVenta` no cambia (constante).

## Proyección: cuánto tardaría cada reporte con 1.000.000 de ventas

**Método.** Para las partes O(n), el tiempo con 1.000.000 se estima multiplicando por 100 el tiempo medido con 10.000 ventas, porque 1.000.000 es 100 veces 10.000. Después ejecuté los mismos reportes con 1.000.000 de ventas para comprobar la estimación. Para la versión O(n²) no se puede multiplicar por 100 (el tiempo se multiplicaría por 10.000), y no se ejecutó, porque tardaría horas.

| Reporte (sección) | Funciones que usa | Medido con 10.000 | Estimación con 1.000.000 (× 100) | Medido con 1.000.000 | Real / estimado |
|---|---|---:|---:|---:|---:|
| 1. Resumen general | `totalVendido`, `unidadesVendidas`, `ticketPromedio`, `ventaMayor` y un `filter` para contar las ventas válidas | 0,41 ms | 41 ms | 130 ms | 3,2 |
| 2. Ventas por ciudad | `totalPorCiudad`, `totalVendido` | 1,82 ms | 182 ms | 187 ms | 1,0 |
| 3. Unidades por producto | `unidadesPorProducto`, `unidadesVendidas` | 0,33 ms | 33 ms | 46 ms | 1,4 |
| 4. Top 3 de productos | `topProductosPorValor` | 0,53 ms | 53 ms | 34 ms | 0,6 |
| 5. Resumen por día (2 días) | `ventasDelDia` (×2), `totalVendido`, `unidadesVendidas`, `ticketPromedio` | 0,22 ms | 22 ms | 33 ms | 1,5 |
| Clientes recurrentes (versión corregida) | `clientesRecurrentes` | 0,30 ms | 30 ms | 124 ms | 4,1 |
| **Suma de las seis** | | **3,6 ms** | **361 ms** | **554 ms** | **1,5** |
| Clientes recurrentes (versión original) | `clientesRecurrentesLento` | 455 ms | 1,8 a 2,5 horas (estimado) | no se ejecutó | - |

**Cómo se estimó la versión original.** Con 100.000 ventas tardó 63,8 s. Si fuera exactamente cuadrática, con 1.000.000 tardaría 63,8 × 100 = 6.380 s (1,8 horas). El tramo de 16.000 a 100.000 mostró un exponente de 2,15, y con ese exponente salen unas 8.900 s (2,5 horas). Por eso el rango es de 1,8 a 2,5 horas.

**Qué dice la comprobación:**

- La proyección "× 100" acertó en el orden de magnitud para el conjunto (361 ms estimados contra 554 ms medidos), pero **algunas partes se desviaron mucho**: el resumen general tardó 3,2 veces más y los clientes recurrentes, 4,1 veces más. En otra ejecución de `clientesRecurrentes` midió 252 ms, y en una anterior 640 ms.
- **Resumen general:** el `filter` que cuenta ventas válidas crea un arreglo de casi 1.000.000 de elementos solo para leer su largo. Es memoria y tiempo que un contador en un ciclo no gastaría.
- **Clientes recurrentes:** con 10.000 ventas el objeto guarda 1.000 clientes y con 1.000.000 guarda 175.849. Un objeto tan grande no cabe en la memoria rápida del procesador y se redimensiona al crecer, así que el tiempo crece más que la proyección lineal.
- **Conclusión:** con 1.000.000 de ventas, el reporte completo con la versión corregida tardaría alrededor de medio segundo. Con la versión original, solo la sección de clientes recurrentes tardaría más de una hora y media.

## Riesgos: qué funciones empeoran más cuando los datos crecen

**Criterio.** Ordeno de mayor a menor riesgo con estas preguntas, en este orden:

1. **Clase de tiempo:** ¿crece más rápido que n? (O(n²) pesa más que O(n)).
2. **Memoria que crece con n en la práctica:** una clase O(m) o O(k) cuenta más si m o k suben junto con n (como los clientes) que si se quedan fijos (como las 4 ciudades).
3. **Tiempo medido con 1.000.000 de ventas:** desempata entre funciones de la misma clase.
4. **Repetición de uso:** una función que se llama una vez por día, por ejemplo, multiplica su costo.

| Puesto | Función | Nivel | Por qué | Medido con 1.000.000 |
|---:|---|---|---|---|
| 1 | `clientesRecurrentesLento` (referencia, ya reemplazada) | Crítico | O(n²): el trabajo se multiplica por 100 al multiplicar n por 10. | 1,8 a 2,5 h (estimado) |
| 2 | `clientesRecurrentes` | **Alto** | Es la función en uso cuya memoria realmente crece con los datos (175.849 clientes con 1.000.000 de ventas, contra 1.000 con 10.000) y cuyo tiempo real superó 4 a 6 veces la proyección lineal. | 124 a 252 ms |
| 3 | `totalCiudadCadena` (referencia) | Alto, pero no se usa | Memoria O(n): copia todas las ventas y crea 2n + 5 arreglos. Es la más lenta de las lineales. | 412 ms |
| 4 | `totalPorCiudad` | Medio | La más lenta de las funciones lineales en uso. Cada venta llama a `normalizarCiudad`, que crea 2 arreglos pequeños. La memoria es O(c) y c es 4, así que no crece con n. | 177 ms |
| 5 | `ventasPorCiudadM` | Medio | O(k): `filter` guarda en memoria todas las ventas de la ciudad. | 56 ms |
| 6 | `ventasDelDia` | Medio | O(d) de memoria, y recorre las n ventas **por cada día consultado**. Con un historial anual (365 días) el costo se multiplica por 365. | 22 ms por consulta |
| 7 | `totalCiudadUnaPasada`, `topProductosPorValor`, `unidadesPorProducto` | Bajo a medio | Memoria O(1) u O(p) con p fijo. `topProductosPorValor` tiene un `sort` de p productos que solo pesaría si el catálogo creciera mucho. | 64 ms, 42 ms y 42 ms |
| 8 | `ventasPorCiudad`, `ventaMayor`, `totalVendidoM`, `unidadesVendidasM`, `ticketPromedio`, `totalVendido`, `unidadesVendidas` | Bajo | Un recorrido, memoria constante. | 4 a 31 ms |
| 9 | `valorVenta`, `primeraVenta`, `normalizarCiudad`, `claveCiudad` | Mínimo | No dependen de n. | menos de 1 ms |

**Observación sobre el reporte.** En `reporte.js`, el `filter` que cuenta las ventas válidas (`ventas.filter((venta) => venta.cantidad > 0)`) crea un arreglo O(n) solo para leer su largo. No es una función del motor, pero explica por qué el resumen general fue 3,2 veces más lento de lo proyectado.

## Plan de optimización (no implementado)

**Función de mayor riesgo en uso:** `clientesRecurrentes`. La versión original ya se reemplazó, y esta es la que queda con más riesgo según el criterio anterior.

### ¿Qué trabajo se repite?

1. **Entre reportes:** cada vez que se genera el reporte, la función vuelve a recorrer **todo el historial** y a contar las compras de cada cliente. Con 1.000.000 de ventas son 1.000.000 de visitas, aunque las ventas de ayer son las mismas de hoy y solo se agregaron unas pocas nuevas. Es el trabajo más grande que se repite.
2. **Dentro de la función:** hace dos pasos sobre la información. Primero cuenta las compras de cada cliente en un objeto (175.849 entradas) y luego recorre ese objeto completo para quedarse con los de más de una compra. Además, guarda un número exacto de compras por cliente, aunque la pregunta solo necesita saber si tiene 0, 1 o más de una.

### ¿Qué información se podría guardar para no buscarla de nuevo?

1. **Un estado por cliente, no un contador.** Bastan dos conjuntos: los clientes *vistos* una vez y los *recurrentes*. Al llegar una venta nueva: si el cliente no está en "vistos", se agrega ahí; si ya estaba, se pasa a "recurrentes". Así se evita el segundo recorrido y el contador exacto.
2. **Guardar ese estado entre reportes**, junto con el último `id` de venta procesado. En el reporte siguiente solo se procesan las ventas con `id` mayor al guardado, y el trabajo pasa de proporcional al historial completo a proporcional a las ventas nuevas.

### Qué se gana y qué cuesta

- **Se gana:** el trabajo por reporte deja de depender del tamaño del historial; solo depende de las ventas nuevas.
- **No se gana:** la memoria. Los clientes vistos siguen ocupando O(m), porque hay que recordar quién ya compró. Es el mismo costo, y es inevitable si se quiere no volver a buscar.
- **Riesgos del plan:** si se corrige o borra una venta antigua, el estado guardado queda desactualizado y habría que recalcularlo; el estado guardado debe persistirse en un archivo; y los códigos de cliente se comparan tal cual (`"C01"` y `"c01 "` serían clientes distintos).

### Cómo se comprobaría después de implementarlo

- Que devuelva la misma lista (en el mismo orden) que la versión actual con los 12 datos (C01, C02, C03) y con los datos generados.
- Medir de nuevo con `medir.js`: que el tiempo por reporte siga la cantidad de ventas nuevas y no el tamaño del historial.
- Repetir la medición con 1.000.000 de ventas y comparar con los 124 a 252 ms actuales.