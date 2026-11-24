const { ventas: ventasDia1, ventasDiarias } = require("./datos");
const { catalogo } = require("./catalogo");
const { generarVentas } = require("./generador");
const {
  valorVenta,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia,
  clientesRecurrentesSet,
  comprasPorCliente,
  productoEstrellaPorCiudad,
  comboRegaloMap,
  parMasCercano,
  primerClienteUnico,
  mejorSemana,
} = require("./analitica");

const ANCHO = 56;
const TARJETA_REGALO = 87000;
const DIAS_SEMANA = 7;

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

const argumentos = process.argv.slice(2);
const soloBasico = argumentos.includes("--basico");
const resto = argumentos.filter((argumento) => argumento !== "--basico");
const usaGeneradas = resto.length > 0 && /^\d+$/.test(resto[0]);
const ventas = usaGeneradas ? generarVentas(Number(resto[0])) : ventasDia1;
const fechasPedidas = usaGeneradas ? resto.slice(1) : resto;
const fechas = fechasPedidas.length > 0 ? fechasPedidas : ["2026-09-03", "2026-09-07"];

const validas = ventas.filter((venta) => venta.cantidad > 0);
const mayor = ventaMayor(ventas);
const promedio = ticketPromedio(ventas);

function resumenDia(fecha) {
  console.log("Fecha: " + fecha);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha.trim())) {
    console.log("   Formato no válido. Use AAAA-MM-DD, por ejemplo 2026-09-03.");
    return;
  }
  const delDia = ventasDelDia(ventas, fecha);
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

function seccionesDeCampana() {
  seccion("6. CLIENTES RECURRENTES");
  const recurrentes = clientesRecurrentesSet(ventas);
  const compras = comprasPorCliente(ventas);
  const masFieles = [...recurrentes]
    .sort((a, b) => compras.get(b) - compras.get(a))
    .slice(0, 5);
  console.log(fila("Clientes con más de una compra", recurrentes.length));
  for (const cliente of masFieles) {
    console.log(fila("   " + cliente, compras.get(cliente) + " compras"));
  }
  if (recurrentes.length > masFieles.length) {
    console.log("   ... y " + (recurrentes.length - masFieles.length) + " más");
  }

  seccion("7. PRODUCTO ESTRELLA POR CIUDAD");
  for (const [ciudad, estrella] of Object.entries(productoEstrellaPorCiudad(ventas))) {
    console.log(fila(ciudad, estrella.producto + " (" + estrella.apariciones + ")"));
  }

  seccion("8. COMBO DE REGALO SUGERIDO");
  console.log(fila("Tarjeta de regalo", dinero(TARJETA_REGALO)));
  const combo = comboRegaloMap(catalogo, TARJETA_REGALO);
  if (combo !== null) {
    console.log("   " + combo.primero + " + " + combo.segundo);
    console.log(fila("Total del combo", dinero(combo.total)));
  } else {
    console.log("   Sin combinación exacta.");
    const cercano = parMasCercano(catalogo, TARJETA_REGALO);
    if (cercano !== null) {
      console.log("   Más cercana sin pasarse: " + cercano.primero + " + " + cercano.segundo);
      console.log(fila("Total del combo", dinero(cercano.total)));
    }
  }

  seccion("9. CLIENTE PARA CUPÓN");
  const clienteCupon = primerClienteUnico(ventas);
  if (clienteCupon === null) {
    console.log("   Ningún cliente compró una sola vez.");
  } else {
    const suVenta = ventas.find((venta) => venta.cliente === clienteCupon);
    console.log(fila("Primer cliente con una sola compra", clienteCupon));
    console.log("   Venta " + suVenta.id + " · " + suVenta.fecha + " · " + suVenta.producto);
  }

  seccion("10. MEJOR SEMANA DE SEPTIEMBRE");
  const semana = mejorSemana(ventasDiarias, DIAS_SEMANA);
  if (semana === null) {
    console.log("   No hay suficientes días para calcular la semana.");
  } else {
    console.log(fila("Días", semana.inicio + " al " + (semana.inicio + DIAS_SEMANA - 1)));
    console.log(fila("Total de la semana", dinero(semana.total * 1000)));
    console.log(fila("Promedio diario", dinero(Math.round((semana.total * 1000) / DIAS_SEMANA))));
  }
}

console.log("=".repeat(ANCHO));
console.log(centrado("REPORTE DE VENTAS - CAFÉ ORIGEN"));
console.log("=".repeat(ANCHO));

seccion("1. RESUMEN GENERAL");
console.log(fila("Datos", usaGeneradas ? ventas.length.toLocaleString("es-CO") + " ventas generadas" : "Día 1 (ventas reales)"));
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

seccion("5. RESUMEN POR DÍA");
fechas.forEach((fecha, i) => {
  if (i > 0) {
    console.log("");
  }
  resumenDia(fecha);
});

if (!soloBasico) {
  seccionesDeCampana();
}

console.log("");
console.log("=".repeat(ANCHO));