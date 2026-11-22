const { ventas } = require("./datos");
const {totalVendido, unidadesVendidas, ventaMayor, ticketPromedio, ventasPorCiudad,} = require("./analitica");

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

console.log(" Un solo elemento (id 1)");
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