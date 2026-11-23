function valorVenta(venta) {
    return venta.cantidad * venta.precio;
}

function totalVendido(ventas) {
    let total = 0;
    for (const venta of ventas) {
        total += valorVenta(venta);
    }
    return total;
}

function unidadesVendidas(ventas) {
    let unidades = 0;
    for (const venta of ventas) {
        unidades += venta.cantidad;
    }
    return unidades;
}

function ventaMayor(ventas) {
    let mayor = null;
    for (const venta of ventas) {
        if (mayor === null || valorVenta(venta) > valorVenta(mayor)) {
            mayor = venta;
        }
    }
    return mayor;
}

function ticketPromedio(ventas) {
    let total = 0;
    let validas = 0;
    for (const venta of ventas) {
        if (venta.cantidad > 0) {
            total += valorVenta(venta);
            validas++;
        }
    }
    if (validas === 0) {
        return null;
    }
    return total / validas;
}

function ventasPorCiudad(ventas, ciudad) {
    const buscada = ciudad.trim().toLowerCase();
    let total = 0;
    for (const venta of ventas) {
        if (venta.ciudad.trim().toLowerCase() === buscada) {
            total += valorVenta(venta);
        }
    }
    return total;
}

function totalVendidoM(ventas) {
    return ventas.reduce((acum, venta) => acum + valorVenta(venta), 0);
}

function unidadesVendidasM(ventas) {
    return ventas.reduce((acum, venta) => acum + venta.cantidad, 0);
}

function ventasPorCiudadM(ventas, ciudad) {
    const buscada = ciudad.trim().toLowerCase();
    return ventas
        .filter((venta) => venta.ciudad.trim().toLowerCase() === buscada)
        .reduce((acum, venta) => acum + valorVenta(venta), 0);
}

function normalizarCiudad(ciudad) {
    return ciudad.trim().toLowerCase().split(/\s+/).map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(" ");
}

function totalPorCiudad(ventas) {
    const totales = {};
    for (const venta of ventas) {
        const ciudad = normalizarCiudad(venta.ciudad);
        if (totales[ciudad] === undefined) {
            totales[ciudad] = 0;
        }
        totales[ciudad] += valorVenta(venta);
    }
    return totales;
}

function unidadesPorProducto(ventas) {
    const unidades = {};
    for (const venta of ventas) {
        if (unidades[venta.producto] === undefined) {
            unidades[venta.producto] = 0;
        }
        unidades[venta.producto] += venta.cantidad;
    }
    return unidades;
}

function topProductosPorValor(ventas, k) {
    const valores = {};
    for (const venta of ventas) {
        if (valores[venta.producto] === undefined) {
            valores[venta.producto] = 0;
        }
        valores[venta.producto] += valorVenta(venta);
    }
    const lista = Object.entries(valores).map(([producto, valor]) => ({ producto, valor }));
    const ordenada = [...lista].sort((a, b) => b.valor - a.valor);
    return ordenada.slice(0, k);
}

function ventasDelDia(ventas, fecha) {
    const buscada = fecha.trim();
    return ventas.filter((venta) => venta.fecha === buscada);
}

module.exports = {
    valorVenta,
    totalVendido,
    unidadesVendidas,
    ventaMayor,
    ticketPromedio,
    ventasPorCiudad,
    totalVendidoM,
    unidadesVendidasM,
    ventasPorCiudadM,
    totalPorCiudad,
    unidadesPorProducto,
    topProductosPorValor,
    ventasDelDia
};