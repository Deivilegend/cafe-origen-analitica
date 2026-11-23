const { generarVentas } = require("./generador");
const { nuevoContador, totalVendidoI, ventaMayorI, totalPorCiudadI, primeraVentaI, clientesRecurrentes } = require("./analitica");

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

