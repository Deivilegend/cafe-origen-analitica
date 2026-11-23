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

function nuevoContador() {
    return { visitas: 0, comparaciones: 0 };
}

function totalVendidoI(ventas, contador) {
    let total = 0;
    for (const venta of ventas) {
        contador.visitas++;
        total += valorVenta(venta);
    }
    return total;
}

function ventaMayorI(ventas, contador) {
    let mayor = null;
    for (const venta of ventas) {
        contador.visitas++;
        if (mayor === null) {
            mayor = venta;
        } else {
            contador.comparaciones++;
            if (valorVenta(venta) > valorVenta(mayor)) {
                mayor = venta;
            }
        }
    }
    return mayor;
}

function totalPorCiudadI(ventas, contador) {
    const totales = {};
    for (const venta of ventas) {
        contador.visitas++;
        const ciudad = normalizarCiudad(venta.ciudad);
        contador.comparaciones++;
        if (totales[ciudad] === undefined) {
            totales[ciudad] = 0;
        }
        totales[ciudad] += valorVenta(venta);
    }
    return totales;
}

function primeraVenta(ventas) {
    if (ventas.length === 0) {
        return null;
    }
    return ventas[0];
}

function primeraVentaI(ventas, contador) {
    if (ventas.length === 0) {
        return null;
    }
    contador.visitas++;
    return ventas[0];
}

function clientesRecurrentes(ventas) {
    const compras = {};
    for (const venta of ventas) {
        if (compras[venta.cliente] === undefined) {
            compras[venta.cliente] = 0;
        }
        compras[venta.cliente]++;
    }
    const recurrentes = [];
    for (const cliente of Object.keys(compras)) {
        if (compras[cliente] > 1) {
            recurrentes.push(cliente);
        }
    }
    return recurrentes;
}

// Solo referencia para pruebas y mediciones. El motor usa totalCiudadUnaPasada.
function totalCiudadCadena(ventas, ciudad) {
    const buscada = normalizarCiudad(ciudad);
    return ventas
        .map((venta) => ({ ...venta, ciudad: normalizarCiudad(venta.ciudad) }))
        .filter((venta) => venta.ciudad === buscada)
        .map((venta) => valorVenta(venta))
        .reduce((acum, valor) => acum + valor, 0);
}

function claveCiudad(texto) {
    return texto.trim().toLowerCase().replace(/\s+/g, " ");
}

function totalCiudadUnaPasada(ventas, ciudad) {
    const buscada = claveCiudad(ciudad);
    let total = 0;
    for (const venta of ventas) {
        if (claveCiudad(venta.ciudad) === buscada) {
            total += valorVenta(venta);
        }
    }
    return total;
}

function clientesRecurrentesSet(ventas) {
    const vistos = new Set();
    const recurrentes = new Set();
    for (const venta of ventas) {
        if (vistos.has(venta.cliente)) {
            recurrentes.add(venta.cliente);
        } else {
            vistos.add(venta.cliente);
        }
    }
    const resultado = [];
    for (const cliente of vistos) {
        if (recurrentes.has(cliente)) {
            resultado.push(cliente);
        }
    }
    return resultado;
}

function comprasPorCliente(ventas) {
    const compras = new Map();
    for (const venta of ventas) {
        if (!compras.has(venta.cliente)) {
            compras.set(venta.cliente, 0);
        }
        compras.set(venta.cliente, compras.get(venta.cliente) + 1);
    }
    return compras;
}

function clientesRecurrentesMap(ventas) {
    const recurrentes = [];
    for (const [cliente, cantidad] of comprasPorCliente(ventas)) {
        if (cantidad > 1) {
            recurrentes.push(cliente);
        }
    }
    return recurrentes;
}

function comboRegalo(catalogo, valor) {
    const combos = [];
    for (let i = 0; i < catalogo.length; i++) {
        for (let j = i + 1; j < catalogo.length; j++) {
            if (catalogo[i].precio + catalogo[j].precio === valor) {
                combos.push({
                    primero: catalogo[i].producto,
                    segundo: catalogo[j].producto,
                    total: catalogo[i].precio + catalogo[j].precio,
                });
            }
        }
    }
    return combos;
}

function comboRegaloMap(catalogo, valor) {
    const vistos = new Map();
    for (const item of catalogo) {
        const complemento = valor - item.precio;
        if (vistos.has(complemento)) {
            return {
                primero: vistos.get(complemento),
                segundo: item.producto,
                total: complemento + item.precio,
            };
        }
        if (!vistos.has(item.precio)) {
            vistos.set(item.precio, item.producto);
        }
    }
    return null;
}

function productoEstrellaPorCiudad(ventas) {
    const porCiudad = new Map();
    for (const venta of ventas) {
        const ciudad = normalizarCiudad(venta.ciudad);
        if (!porCiudad.has(ciudad)) {
            porCiudad.set(ciudad, new Map());
        }
        const conteo = porCiudad.get(ciudad);
        conteo.set(venta.producto, (conteo.get(venta.producto) || 0) + 1);
    }
    const resultado = {};
    for (const [ciudad, conteo] of porCiudad) {
        let mejor = null;
        let mejorCantidad = 0;
        for (const [producto, cantidad] of conteo) {
            if (cantidad > mejorCantidad) {
                mejor = producto;
                mejorCantidad = cantidad;
            }
        }
        resultado[ciudad] = { producto: mejor, apariciones: mejorCantidad };
    }
    return resultado;
}

function primerClienteUnico(ventas) {
    const compras = new Map();
    for (const venta of ventas) {
        compras.set(venta.cliente, (compras.get(venta.cliente) || 0) + 1);
    }
    for (const venta of ventas) {
        if (compras.get(venta.cliente) === 1) {
            return venta.cliente;
        }
    }
    return null;
}

function mejorSemanaBruta(dias, k) {
    if (!Number.isInteger(k) || k <= 0 || k > dias.length) {
        return null;
    }
    let mejorTotal = -Infinity;
    let mejorInicio = 0;
    for (let i = 0; i + k <= dias.length; i++) {
        let suma = 0;
        for (let j = i; j < i + k; j++) {
            suma += dias[j];
        }
        if (suma > mejorTotal) {
            mejorTotal = suma;
            mejorInicio = i;
        }
    }
    return { total: mejorTotal, inicio: mejorInicio + 1 };
}

function mejorSemana(dias, k) {
    if (!Number.isInteger(k) || k <= 0 || k > dias.length) {
        return null;
    }
    let suma = 0;
    for (let i = 0; i < k; i++) {
        suma += dias[i];
    }
    let mejorTotal = suma;
    let mejorInicio = 0;
    for (let i = k; i < dias.length; i++) {
        suma += dias[i] - dias[i - k];
        if (suma > mejorTotal) {
            mejorTotal = suma;
            mejorInicio = i - k + 1;
        }
    }
    return { total: mejorTotal, inicio: mejorInicio + 1 };
}

function parMasCercano(precios, presupuesto) {
    const ordenados = [...precios].sort((a, b) => a.precio - b.precio);
    let i = 0;
    let j = ordenados.length - 1;
    let mejor = null;
    while (i < j) {
        const suma = ordenados[i].precio + ordenados[j].precio;
        if (suma > presupuesto) {
            j--;
        } else {
            if (mejor === null || suma > mejor.total) {
                mejor = {
                    primero: ordenados[i].producto,
                    segundo: ordenados[j].producto,
                    total: suma,
                };
            }
            if (suma === presupuesto) {
                break;
            }
            i++;
        }
    }
    return mejor;
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
    ventasDelDia,
    nuevoContador,
    totalVendidoI,
    ventaMayorI,
    totalPorCiudadI,
    primeraVenta,
    primeraVentaI,
    clientesRecurrentes,
    totalCiudadCadena,
    totalCiudadUnaPasada,
    clientesRecurrentesSet,
    comprasPorCliente,
    clientesRecurrentesMap,
    comboRegalo,
    comboRegaloMap,
    productoEstrellaPorCiudad,
    primerClienteUnico,
    mejorSemana,
    mejorSemanaBruta,
    parMasCercano,
};