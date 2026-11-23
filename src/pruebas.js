const { ventas } = require("./datos");
const { catalogo } = require("./catalogo");

const {
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  clientesRecurrentes,
  clientesRecurrentesSet,
  comprasPorCliente,
  clientesRecurrentesMap,
  comboRegalo,
  totalCiudadCadena,
  totalCiudadUnaPasada,
} = require("./analitica");

function comprobar(descripcion, obtenido, esperado) {
  const ok = obtenido === esperado;
  console.log(ok ? "OK   " : "FALLA", descripcion, "->", obtenido, ok ? "" : "(esperado: " + esperado + ")");
}

const uno = [ventas[0]];
const vacio = [];

console.log(" Arreglo completo (12 ventas) ");
comprobar("totalVendido", totalVendido(ventas), 985000);
comprobar("unidadesVendidas", unidadesVendidas(ventas), 21);
comprobar("ventaMayor (id)", ventaMayor(ventas).id, 10);
comprobar("ticketPromedio", ticketPromedio(ventas), 985000 / 11);
comprobar("ventasPorCiudad Medellín", ventasPorCiudad(ventas, "Medellín"), 356000);

console.log(" Un solo elemento (id 1) ");
comprobar("totalVendido", totalVendido(uno), 84000);
comprobar("unidadesVendidas", unidadesVendidas(uno), 2);
comprobar("ventaMayor (id)", ventaMayor(uno).id, 1);
comprobar("ticketPromedio", ticketPromedio(uno), 84000);
comprobar("ventasPorCiudad Medellín", ventasPorCiudad(uno, "Medellín"), 84000);
comprobar("ventasPorCiudad Cali", ventasPorCiudad(uno, "Cali"), 0);

console.log(" Arreglo vacío ");
comprobar("totalVendido", totalVendido(vacio), 0);
comprobar("unidadesVendidas", unidadesVendidas(vacio), 0);
comprobar("ventaMayor", ventaMayor(vacio), null);
comprobar("ticketPromedio", ticketPromedio(vacio), null);
comprobar("ventasPorCiudad", ventasPorCiudad(vacio, "Medellín"), 0);

console.log(" totalPorCiudad ");
const porCiudad = totalPorCiudad(ventas);
comprobar("Medellín", porCiudad["Medellín"], 356000);
comprobar("Bogotá", porCiudad["Bogotá"], 276000);
comprobar("Cali", porCiudad["Cali"], 185000);
comprobar("Pereira", porCiudad["Pereira"], 168000);
comprobar("nº de ciudades", Object.keys(porCiudad).length, 4);

const espacios = totalPorCiudad([
  { ciudad: "Bogotá ", cantidad: 1, precio: 10 },
  { ciudad: " BOGOTÁ", cantidad: 2, precio: 10 },
]);
comprobar("Bogotá con espacios y mayúsculas", espacios["Bogotá"], 30);
comprobar("un solo grupo", Object.keys(espacios).length, 1);
comprobar("Un solo elemento: Medellín", totalPorCiudad(uno)["Medellín"], 84000);
comprobar("Un solo elemento: nº de ciudades", Object.keys(totalPorCiudad(uno)).length, 1);
comprobar("Arreglo vacío: nº de ciudades", Object.keys(totalPorCiudad(vacio)).length, 0);

console.log(" unidadesPorProducto ");
const unidades = unidadesPorProducto(ventas);
comprobar("Huila 500 g", unidades["Origen Huila 500 g"], 7);
comprobar("Nariño 250 g", unidades["Origen Nariño 250 g"], 6);
comprobar("Prensa francesa", unidades["Prensa francesa"], 2);
comprobar("Sierra 500 g", unidades["Origen Sierra 500 g"], 5);
comprobar("Molino manual", unidades["Molino manual"], 1);
comprobar("nº de productos", Object.keys(unidades).length, 5);
comprobar("Un solo elemento: Huila 500 g", unidadesPorProducto(uno)["Origen Huila 500 g"], 2);
comprobar("Un solo elemento: nº de productos", Object.keys(unidadesPorProducto(uno)).length, 1);
comprobar("Arreglo vacío: nº de productos", Object.keys(unidadesPorProducto(vacio)).length, 0);

console.log(" topProductosPorValor ");
const top = topProductosPorValor(ventas, 3);
comprobar("Top 3: cantidad", top.length, 3);
comprobar("Puesto 1: producto", top[0].producto, "Origen Huila 500 g");
comprobar("Puesto 1: valor", top[0].valor, 294000);
comprobar("Puesto 2: producto", top[1].producto, "Origen Sierra 500 g");
comprobar("Puesto 2: valor", top[1].valor, 225000);
comprobar("Puesto 3: producto", top[2].producto, "Prensa francesa");
comprobar("Puesto 3: valor", top[2].valor, 190000);
comprobar("k mayor que los productos (k = 10)", topProductosPorValor(ventas, 10).length, 5);
comprobar("k = 0", topProductosPorValor(ventas, 0).length, 0);
comprobar("Un solo elemento: cantidad", topProductosPorValor(uno, 3).length, 1);
comprobar("Un solo elemento: valor", topProductosPorValor(uno, 3)[0].valor, 84000);
comprobar("Arreglo vacío", topProductosPorValor(vacio, 3).length, 0);

const idsAntes = [...ventas].map((v) => v.id);
topProductosPorValor(ventas, 3);
const mismoOrden = ventas.every((v, i) => v.id === idsAntes[i]);
comprobar("ventas sin modificar tras ordenar", mismoOrden, true);

console.log(" clientesRecurrentes ");
const recurrentes = clientesRecurrentes(ventas);
comprobar("12 ventas: cuántos clientes recurrentes", recurrentes.length, 3);
comprobar("12 ventas: lista", recurrentes.join(","), "C01,C02,C03");
comprobar("Un solo elemento", clientesRecurrentes(uno).length, 0);
comprobar("Arreglo vacío", clientesRecurrentes(vacio).length, 0);
comprobar("Sin clientes repetidos", clientesRecurrentes([ventas[0], ventas[1], ventas[2]]).length, 0);
comprobar("Un cliente con 3 compras aparece una sola vez", clientesRecurrentes([ventas[0], ventas[3], ventas[10]]).join(","), "C01");

console.log(" totalCiudadCadena ");
comprobar("Medellín (incluye la fila 5)", totalCiudadCadena(ventas, "Medellín"), 356000);
comprobar("Con espacios y mayúsculas", totalCiudadCadena(ventas, "  MEDELLÍN "), 356000);
comprobar("Bogotá", totalCiudadCadena(ventas, "Bogotá"), 276000);
comprobar("Ciudad que no existe", totalCiudadCadena(ventas, "Armenia"), 0);
comprobar("Un solo elemento", totalCiudadCadena(uno, "Medellín"), 84000);
comprobar("Arreglo vacío", totalCiudadCadena(vacio, "Medellín"), 0);

console.log(" totalCiudadUnaPasada ");
comprobar("Medellín (incluye la fila 5)", totalCiudadUnaPasada(ventas, "Medellín"), 356000);
comprobar("Con espacios y mayúsculas", totalCiudadUnaPasada(ventas, "  MEDELLÍN "), 356000);
comprobar("Bogotá", totalCiudadUnaPasada(ventas, "Bogotá"), 276000);
comprobar("Ciudad que no existe", totalCiudadUnaPasada(ventas, "Armenia"), 0);
comprobar("Un solo elemento", totalCiudadUnaPasada(uno, "Medellín"), 84000);
comprobar("Arreglo vacío", totalCiudadUnaPasada(vacio, "Medellín"), 0);
for (const ciudad of ["Medellín", "Bogotá", "Cali", "Pereira", "Armenia"]) {
  comprobar("Igual que totalCiudadCadena: " + ciudad, totalCiudadUnaPasada(ventas, ciudad), totalCiudadCadena(ventas, ciudad));
}

console.log(" clientesRecurrentesSet y clientesRecurrentesMap ");
const pruebasClientes = [
  ["12 ventas", ventas],
  ["Un solo elemento", uno],
  ["Arreglo vacío", vacio],
  ["Sin clientes repetidos", [ventas[0], ventas[1], ventas[2]]],
  ["Cliente con 3 compras", [ventas[0], ventas[3], ventas[10]]],
];
for (const [nombre, datos] of pruebasClientes) {
  const original = clientesRecurrentes(datos).join(",");
  comprobar("Set igual al original: " + nombre, clientesRecurrentesSet(datos).join(","), original);
  comprobar("Map igual al original: " + nombre, clientesRecurrentesMap(datos).join(","), original);
}
comprobar("Set: 12 ventas", clientesRecurrentesSet(ventas).join(","), "C01,C02,C03");
comprobar("Map: 12 ventas", clientesRecurrentesMap(ventas).join(","), "C01,C02,C03");

console.log(" comprasPorCliente ");
const compras = comprasPorCliente(ventas);
comprobar("Es un Map", compras instanceof Map, true);
comprobar("Compras de C01", compras.get("C01"), 3);
comprobar("Cliente inexistente", compras.get("C99"), undefined);
comprobar("Arreglo vacío: tamaño", comprasPorCliente(vacio).size, 0);

const raros = [
  { cliente: "constructor" },
  { cliente: "constructor" },
  { cliente: "__proto__" },
  { cliente: "__proto__" },
];
comprobar("Set con claves raras", clientesRecurrentesSet(raros).join(","), "constructor,__proto__");
comprobar("Map con claves raras", clientesRecurrentesMap(raros).join(","), "constructor,__proto__");

console.log(" comboRegalo ");
const combos = comboRegalo(catalogo, 87000);
comprobar("87.000: cantidad de combos", combos.length, 1);
comprobar("87.000: primer producto", combos[0].primero, "Origen Huila 500 g");
comprobar("87.000: segundo producto", combos[0].segundo, "Origen Sierra 500 g");
comprobar("87.000: total", combos[0].total, 87000);
comprobar("61.000 (Nariño 250 g + Taza)", comboRegalo(catalogo, 61000).length, 1);
comprobar("215.000 (Prensa + Molino)", comboRegalo(catalogo, 215000).length, 1);
comprobar("Sin solución (1.000)", comboRegalo(catalogo, 1000).length, 0);
comprobar("Catálogo vacío", comboRegalo([], 87000).length, 0);
comprobar("Un solo producto no se empareja consigo mismo", comboRegalo([{ producto: "A", precio: 43500 }], 87000).length, 0);
comprobar("Dos productos distintos con el mismo precio", comboRegalo([{ producto: "A", precio: 43500 }, { producto: "B", precio: 43500 }], 87000).length, 1);
comprobar("Varias soluciones", comboRegalo([{ producto: "A", precio: 10 }, { producto: "B", precio: 20 }, { producto: "C", precio: 30 }, { producto: "D", precio: 10 }], 30).length, 2);

console.log(" comboRegaloMap ");
const m87 = comboRegaloMap(catalogo, 87000);
comprobar("87.000: primer producto", m87.primero, "Origen Huila 500 g");
comprobar("87.000: segundo producto", m87.segundo, "Origen Sierra 500 g");
comprobar("87.000: total", m87.total, 87000);
const m61 = comboRegaloMap(catalogo, 61000);
comprobar("61.000: primer producto", m61.primero, "Origen Nariño 250 g");
comprobar("61.000: segundo producto", m61.segundo, "Taza de cerámica");
comprobar("Sin combinación (1.000)", comboRegaloMap(catalogo, 1000), null);
comprobar("Catálogo vacío", comboRegaloMap([], 87000), null);
comprobar("Un solo producto no se empareja consigo mismo", comboRegaloMap([{ producto: "A", precio: 43500 }], 87000), null);
comprobar("Dos productos distintos con el mismo precio", comboRegaloMap([{ producto: "A", precio: 43500 }, { producto: "B", precio: 43500 }], 87000).segundo, "B");
for (const valor of [87000, 61000, 60000, 215000, 1000]) {
  comprobar("Coincide con fuerza bruta: " + valor, comboRegaloMap(catalogo, valor) !== null, comboRegalo(catalogo, valor).length > 0);
}