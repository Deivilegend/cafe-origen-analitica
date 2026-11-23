const { ventas } = require("./datos");

const {
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
} = require("./analitica");

function comprobar(descripcion, obtenido, esperado) {
  const ok = obtenido === esperado;
  console.log(ok ? "OK   " : "FALLA", descripcion, "->", obtenido, ok ? "" : "(esperado: " + esperado + ")");
}

const uno = [ventas[0]];
const vacio = [];

console.log("--- Arreglo completo (12 ventas) ---");
comprobar("totalVendido", totalVendido(ventas), 985000);
comprobar("unidadesVendidas", unidadesVendidas(ventas), 21);
comprobar("ventaMayor (id)", ventaMayor(ventas).id, 10);
comprobar("ticketPromedio", ticketPromedio(ventas), 985000 / 11);
comprobar("ventasPorCiudad Medellín", ventasPorCiudad(ventas, "Medellín"), 356000);

console.log("--- Un solo elemento (id 1) ---");
comprobar("totalVendido", totalVendido(uno), 84000);
comprobar("unidadesVendidas", unidadesVendidas(uno), 2);
comprobar("ventaMayor (id)", ventaMayor(uno).id, 1);
comprobar("ticketPromedio", ticketPromedio(uno), 84000);
comprobar("ventasPorCiudad Medellín", ventasPorCiudad(uno, "Medellín"), 84000);
comprobar("ventasPorCiudad Cali", ventasPorCiudad(uno, "Cali"), 0);

console.log("--- Arreglo vacío ---");
comprobar("totalVendido", totalVendido(vacio), 0);
comprobar("unidadesVendidas", unidadesVendidas(vacio), 0);
comprobar("ventaMayor", ventaMayor(vacio), null);
comprobar("ticketPromedio", ticketPromedio(vacio), null);
comprobar("ventasPorCiudad", ventasPorCiudad(vacio, "Medellín"), 0);

console.log("--- totalPorCiudad ---");
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