const { ventas } = require("./datos")
const { totalVendido, totalVendidoM, unidadesVendidas, unidadesVendidasM, ventasPorCiudad, ventasPorCiudadM} = require("./analitica")

function comparar(nombre, conCiclo, conMetodos){
    const resultado = conCiclo === conMetodos ? "OK" : "DIFERENTE";
    console.log(resultado, "-", nombre, "| ciclo:", conCiclo, "| metodos:", conMetodos);
}

const conjuntos = [
    {nombre:"arreglo completo", datos: ventas},
    {nombre:"un solo elemento", datos: [ventas[0]]},
    {nombre:"arreglo vacio", datos: []},
];

for(const { nombre, datos } of conjuntos){
    console.log("---" + nombre + "---");
    comparar("totalVendido", totalVendido(datos), totalVendidoM(datos));
    comparar("unidadesVendidas", unidadesVendidas(datos), unidadesVendidasM(datos));
    for (const ciudad of ["Medellín", "  MEDELLÍN ", "Bogotá", "Cali", "Pereira", "Armenia"]){
        comparar("ventasPorCiudad(" + JSON.stringify(ciudad) + ")",
            ventasPorCiudad(datos, ciudad), ventasPorCiudadM(datos, ciudad));
    }
}