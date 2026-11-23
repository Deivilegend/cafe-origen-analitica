const { ventas } = require("./datos");
const {
  valorVenta,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia
} = require("./analitica");

const ANCHO = 56;

function dinero(valor) {
  return "$" + valor.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function fila(etiqueta, valor) {
  return etiqueta.padEnd(ANCHO - String(valor).length) + valor;
}

function centrado(texto) {
  const izquierda = Math.floor((ANCHO - texto.length) / 2);
  return " ".repeat(izquierda) + texto;
}

function seccion(texto) {
  console.log("");
  console.log(texto);
  console.log("-".repeat(ANCHO));
}

const validas = ventas.filter((venta) => venta.cantidad > 0);
const mayor = ventaMayor(ventas);
const promedio = ticketPromedio(ventas);

console.log("=".repeat(ANCHO));
console.log(centrado("REPORTE DE VENTAS - CAFÉ ORIGEN"));
console.log("=".repeat(ANCHO));

seccion("1. RESUMEN GENERAL");
console.log(fila("Ventas registradas", ventas.length));
console.log(fila("Ventas válidas (cantidad > 0)", validas.length));
console.log(fila("Total vendido", dinero(totalVendido(ventas))));
console.log(fila("Unidades vendidas", unidadesVendidas(ventas)));
console.log(fila("Ticket promedio", promedio === null ? "sin ventas válidas" : dinero(promedio)));
if (mayor !== null) {
  console.log(fila("Mayor venta", dinero(valorVenta(mayor))));
  console.log("   " + mayor.producto + " · cliente " + mayor.cliente + " · " + mayor.ciudad);
}

seccion("2. VENTAS POR CIUDAD");
for (const [ciudad, total] of Object.entries(totalPorCiudad(ventas))) {
  console.log(fila(ciudad, dinero(total)));
}
console.log("-".repeat(ANCHO));
console.log(fila("Total", dinero(totalVendido(ventas))));

seccion("3. UNIDADES POR PRODUCTO");
for (const [producto, unidades] of Object.entries(unidadesPorProducto(ventas))) {
  console.log(fila(producto, unidades));
}
console.log("-".repeat(ANCHO));
console.log(fila("Total", unidadesVendidas(ventas)));

seccion("4. TOP 3 DE PRODUCTOS POR VALOR");
topProductosPorValor(ventas, 3).forEach((item, i) => {
  console.log(fila((i + 1) + ". " + item.producto, dinero(item.valor)));
});

function resumenDia(fecha) {
  const delDia = ventasDelDia(ventas, fecha);
  console.log("Fecha: " + fecha);
  if (delDia.length === 0) {
    console.log("   Sin ventas registradas este día.");
    return;
  }
  const promedioDia = ticketPromedio(delDia);
  console.log(fila("   Ventas registradas", delDia.length));
  console.log(fila("   Total vendido", dinero(totalVendido(delDia))));
  console.log(fila("   Unidades vendidas", unidadesVendidas(delDia)));
  console.log(fila("   Ticket promedio", promedioDia === null ? "sin ventas válidas" : dinero(promedioDia)));
}

seccion("5. RESUMEN POR DÍA");
resumenDia("2026-09-03");
console.log("");
resumenDia("2026-09-07");
console.log("");
console.log("=".repeat(ANCHO));