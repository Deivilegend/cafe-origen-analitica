const { generarVentas } = require("./generador");
const { nuevoContador, totalVendidoI, ventaMayorI, totalPorCiudadI, primeraVentaI, clientesRecurrentes, totalCiudadCadena, totalCiudadUnaPasada} = require("./analitica");

const tamanos = [100, 1000, 10000, 100000];
const funciones = [
  { nombre: "totalVendido", ejecutar: totalVendidoI },
  { nombre: "ventaMayor", ejecutar: ventaMayorI },
  { nombre: "totalPorCiudad", ejecutar: totalPorCiudadI },
  { nombre: "primeraVenta", ejecutar: primeraVentaI },
];

function operaciones(ejecutar, ventas) {
  const contador = nuevoContador();
  ejecutar(ventas, contador);
  return contador.visitas + contador.comparaciones;
}

function formato(numero) {
  return numero.toLocaleString("es-CO");
}

function linea(columnas) {
  return columnas.map((texto, i) => (i === 0 ? String(texto).padStart(10) : String(texto).padStart(16))).join(" | ");
}

const resultados = tamanos.map((n) => {
  const ventas = generarVentas(n);
  return { n, ops: funciones.map((f) => operaciones(f.ejecutar, ventas)) };
});

console.log("Operaciones = visitas + comparaciones");
console.log("");
console.log(linea(["n", ...funciones.map((f) => f.nombre)]));
console.log("-".repeat(10 + 3 * 19));
for (const fila of resultados) {
  console.log(linea([formato(fila.n), ...fila.ops.map(formato)]));
}

console.log("");
console.log("Factor al multiplicar n por 10 (operaciones nuevas / operaciones anteriores)");
console.log("");
console.log(linea(["de n a n×10", ...funciones.map((f) => f.nombre)]));
console.log("-".repeat(10 + 3 * 19));
for (let i = 1; i < resultados.length; i++) {
  const factores = resultados[i].ops.map((op, j) => (op / resultados[i - 1].ops[j]).toFixed(2));
  console.log(linea([formato(resultados[i - 1].n) + "→" + formato(resultados[i].n), ...factores]));
}

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

function medirTiempo(etiqueta, funcion, ventas) {
  console.time(etiqueta);
  const inicio = performance.now();
  funcion(ventas);
  const duracion = performance.now() - inicio;
  console.timeEnd(etiqueta);
  return duracion;
}

const tamanosTiempo = [1000, 2000, 4000, 8000, 16000];

clientesRecurrentesLento(generarVentas(500));
clientesRecurrentes(generarVentas(500));

const filasTiempo = [];
for (const n of tamanosTiempo) {
  const ventas = generarVentas(n);
  const lento = medirTiempo("original n=" + n, clientesRecurrentesLento, ventas);
  const rapido = medirTiempo("corregida n=" + n, clientesRecurrentes, ventas);
  filasTiempo.push({ n, "original (ms)": Number(lento.toFixed(2)), "corregida (ms)": Number(rapido.toFixed(2)) });
}

for (let i = 0; i < filasTiempo.length; i++) {
  filasTiempo[i]["factor original"] = i === 0 ? "-" : Number((filasTiempo[i]["original (ms)"] / filasTiempo[i - 1]["original (ms)"]).toFixed(2));
  filasTiempo[i]["factor corregida"] = i === 0 ? "-" : Number((filasTiempo[i]["corregida (ms)"] / filasTiempo[i - 1]["corregida (ms)"]).toFixed(2));
}

console.log("Tiempo de clientesRecurrentes");
console.table(filasTiempo);

const nDiezMil = 10000;
const ventasDiezMil = generarVentas(nDiezMil);
const ciudadesPrueba = ["Medellín", "Bogotá", "Cali", "Pereira"];

console.log("--- Mismo valor con n = " + nDiezMil + " ---");
for (const c of ciudadesPrueba) {
  const x = totalCiudadCadena(ventasDiezMil, c);
  const y = totalCiudadUnaPasada(ventasDiezMil, c);
  console.log(c.padEnd(9), "cadena:", x, "| una pasada:", y, "| iguales:", x === y);
}

function contarLlamadas(funcion) {
  const llamadas = [];
  const guardadas = {};
  for (const [objeto, nombre] of [[Array.prototype, "map"], [Array.prototype, "filter"], [Array.prototype, "reduce"], [String.prototype, "split"]]) {
    guardadas[nombre] = objeto[nombre];
    objeto[nombre] = function (...args) {
      llamadas.push({ metodo: nombre, largo: nombre === "split" ? null : this.length });
      return guardadas[nombre].apply(this, args);
    };
  }
  try {
    funcion();
  } finally {
    Array.prototype.map = guardadas.map;
    Array.prototype.filter = guardadas.filter;
    Array.prototype.reduce = guardadas.reduce;
    String.prototype.split = guardadas.split;
  }
  return llamadas;
}

for (const [nombre, f] of [["totalCiudadCadena", totalCiudadCadena], ["totalCiudadUnaPasada", totalCiudadUnaPasada]]) {
  const llamadas = contarLlamadas(() => f(ventasDiezMil, "Medellín"));
  const grandes = llamadas.filter((l) => l.largo !== null && l.largo > 10);
  const nuevos = llamadas.filter((l) => l.metodo !== "reduce").length;
  console.log(nombre);
  console.log("  recorridos grandes:", grandes.map((l) => l.metodo + "(" + l.largo + ")").join(", ") || "ninguno (un for...of)");
  console.log("  arreglos nuevos creados:", nuevos);
}

const { mejorSemanaBruta, mejorSemana } = require("./analitica");
const { mejorSemanaBruta, mejorSemana } = require("./analitica");
const { ventasDiarias } = require("./datos");

function diasAlAzar(n) {
  const dias = [];
  for (let i = 0; i < n; i++) {
    dias.push(Math.floor(Math.random() * 1000));
  }
  return dias;
}

function medirMs(funcion, dias, k) {
  const inicio = performance.now();
  const resultado = funcion(dias, k);
  return { resultado, ms: performance.now() - inicio };
}

console.log(" Septiembre (k = 7) ");
console.log("bruta     :", mejorSemanaBruta(ventasDiarias, 7));
console.log("deslizante:", mejorSemana(ventasDiarias, 7));

const dias = diasAlAzar(100000);
const filas = [];
for (const k of [7, 100, 1000, 10000]) {
  const a = medirMs(mejorSemanaBruta, dias, k);
  const b = medirMs(mejorSemana, dias, k);
  const igual = a.resultado.total === b.resultado.total && a.resultado.inicio === b.resultado.inicio;
  filas.push({
    k,
    coinciden: igual ? "SI" : "NO",
    total: b.resultado.total,
    inicio: b.resultado.inicio,
    "bruta (ms)": Number(a.ms.toFixed(2)),
    "deslizante (ms)": Number(b.ms.toFixed(2)),
  });
}
console.log(" 100.000 días al azar ");
console.table(filas);

