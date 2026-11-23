const PRODUCTOS = [
  { nombre: "Origen Huila 500 g", precio: 42000 },
  { nombre: "Origen Nariño 250 g", precio: 26000 },
  { nombre: "Origen Sierra 500 g", precio: 45000 },
  { nombre: "Prensa francesa", precio: 95000 },
  { nombre: "Molino manual", precio: 120000 },
];

const CIUDADES = ["Medellín", "Bogotá", "Cali", "Pereira"];

function enteroAlAzar(minimo, maximo) {
  return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

function elegirAlAzar(lista) {
  return lista[enteroAlAzar(0, lista.length - 1)];
}

function codigoCliente(numero) {
  return "C" + String(numero).padStart(2, "0");
}

function generarVentas(n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("n debe ser un entero mayor o igual a 0");
  }
  const clientesDistintos = enteroAlAzar(1, Math.max(1, Math.floor(n / 3)));
  const ventas = [];
  for (let i = 0; i < n; i++) {
    const producto = elegirAlAzar(PRODUCTOS);
    ventas.push({
      id: i + 1,
      fecha: "2026-09-" + String((i % 30) + 1).padStart(2, "0"),
      cliente: codigoCliente(enteroAlAzar(1, clientesDistintos)),
      producto: producto.nombre,
      ciudad: elegirAlAzar(CIUDADES),
      cantidad: enteroAlAzar(1, 5),
      precio: producto.precio,
    });
  }
  return ventas;
}

module.exports = { generarVentas };