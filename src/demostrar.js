const { ventas } = require("./datos");
const { totalPorCiudad, tickedPromedio, ventasDelDia } = require("./analitica")

function comprobar(descripcion, obtenido, esperado) {
    const ok = obtenido === esperando;
    console.log(ok ? "OK  ": "FALLA", descripcion, "->", obtenido, ok ? "" : "(esperando: " + esperado + ")")
}

console.log(" Error 1: ciudad duplicada ");
const bogota = totalPorCiudad([
  { ciudad: "Bogotá", cantidad: 1, precio: 120000 },
  { ciudad: "Bogotá ", cantidad: 2, precio: 26000 },
  { ciudad: " BOGOTÁ", cantidad: 1, precio: 10000 },
]);
comprobar("Bogotá con 3 escrituras: nº de grupos", Object.keys(bogota).length, 1);
comprobar("Bogotá con 3 escrituras: total", bogota["Bogotá"], 182000);
comprobar("12 ventas reales: nº de ciudades", Object.keys(totalPorCiudad(ventas)).length, 4);
comprobar("12 ventas reales: Medellín junta la fila 5", totalPorCiudad(ventas)["Medellín"], 356000);

console.log(" Error 2: NaN en día sin ventas ");
comprobar("día sin ventas (2026-09-07)", ticketPromedio(ventasDelDia(ventas, "2026-09-07")), null);
comprobar("arreglo vacío", ticketPromedio([]), null);
comprobar("día con solo cantidad 0", ticketPromedio([ventas[7]]), null);
const fechas = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"];
comprobar("ningún día del 1 al 7 da NaN", fechas.some((f) => Number.isNaN(ticketPromedio(ventasDelDia(ventas, f)))), false);