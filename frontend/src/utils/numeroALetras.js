const UNIDADES = [
    '',
    'un',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciseis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
    'veinte',
]

const DECENAS = [
    '',
    '',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
]

const CENTENAS = [
    '',
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
]

const convertirGrupo = (numero) => {
    if (numero === 0) return ''
    if (numero === 100) return 'cien'

    const centena = Math.floor(numero / 100)
    const resto = numero % 100
    let letras = CENTENAS[centena]

    if (resto > 0 && letras) letras += ' '

    if (resto > 0 && resto <= 20) {
        letras += UNIDADES[resto]
    } else if (resto > 20) {
        const decena = Math.floor(resto / 10)
        const unidad = resto % 10
        letras += DECENAS[decena]

        if (unidad > 0) {
            if (decena === 2) {
                const unidadTexto = unidad === 1 ? 'un' : UNIDADES[unidad]
                letras = letras.slice(0, -1) + `i${unidadTexto}`
            } else {
                letras += ` y ${UNIDADES[unidad]}`
            }
        }
    }

    return letras
}

const convertirEntero = (numero) => {
    if (numero === 0) return 'cero'

    const millones = Math.floor(numero / 1000000)
    const miles = Math.floor((numero % 1000000) / 1000)
    const resto = numero % 1000
    const partes = []

    if (millones > 0) {
        partes.push(
            millones === 1
                ? 'un millon'
                : `${convertirGrupo(millones)} millones`
        )
    }

    if (miles > 0) {
        partes.push(
            miles === 1
                ? 'mil'
                : `${convertirGrupo(miles)} mil`
        )
    }

    if (resto > 0) {
        partes.push(convertirGrupo(resto))
    }

    return partes.join(' ')
}

export const montoALetras = (monto) => {
    const numero = Number(monto)

    if (!Number.isFinite(numero) || numero < 0) {
        throw new Error('El monto debe ser un número válido mayor o igual a cero')
    }

    if (numero > 999999999.99) {
        throw new Error('El monto excede el límite soportado')
    }

    const montoRedondeado = Math.round(numero * 100) / 100
    const parteEntera = Math.floor(montoRedondeado)
    const centavos = Math.round((montoRedondeado - parteEntera) * 100)
    const palabraLempira = parteEntera === 1 ? 'LEMPIRA' : 'LEMPIRAS'

    return `${convertirEntero(parteEntera)} ${palabraLempira} CON ${String(centavos).padStart(2, '0')}/100`.toUpperCase()
}
