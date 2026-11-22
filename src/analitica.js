function valorVentas(ventas) {
    return ventas.cantidad * ventas.precio;
}

function totalVendido(ventas){
    let total = 0;
    for (const venta of ventas){
        total += valorVentas(venta)
    }
    return total;
}

function unidadesVendidas(ventas){
    let unidades = 0;
    for(const venta of ventas) {
        unidades += venta.cantidad
    }
    return unidades;
}

function ventaMayor(ventas){
    let mayor = null;
    for(const venta of ventas){
        if(mayor === null || valorVentas(venta) > valorVentas(mayor)){
            mayor = venta;
        }
    }
    return mayor;
}

function ticketPromedio(ventas){
    let total = 0;
    let validas = 0;
    for (const venta of ventas){
        if (venta.cantidad > 0){
            total += valorVentas(venta)
            validas++;
        }
    }
    if (validas === 0){
        return null;
    }
    return total / validas;
}

function ventasPorCiudad (ventas, ciudad){
    const buscada = ciudad.trim().toLowerCase();
    let total = 0;
    for (const venta of ventas){
        if(venta.ciudad.trim().toLowerCase()=== buscada){
            total += valorVentas(venta);
        }
    }
    return total;
}
module.exports = {valorVentas, totalVendido, unidadesVendidas, ventaMayor, ticketPromedio, ventasPorCiudad};