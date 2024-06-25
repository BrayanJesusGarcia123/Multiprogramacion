const btnAgregar = document.getElementById("btnAgregar");
const btnLeer = document.getElementById("btnLeer");
const btnCambiar = document.getElementById("btnCambiar");
const btnMulti = document.getElementById("btnMulti");
const contenedorCampos = document.getElementById("contenedorCampos");
const contenedorMulti = document.getElementById("contenedorMulti");
const alerta = document.getElementById("alerta");
const tabla = document.getElementById("tabla");
let matrizDatos = [];
let nuevaMatrizDatos;

btnAgregar.addEventListener("click", function agregar() {
  const divCampos = document.createElement("div");

  for (let i = 1; i <= 3; i++) {
    const inputCampo = document.createElement("input");
    inputCampo.type = "text";
    inputCampo.name = `campo${i}`;
    let input = "";
    switch (i) {
      case 1: input = "ID de Proceso"; break;
      case 2: input = "Tiempo de CPU"; break;
      case 3: input = "Tiempo de E/S"; break;
    }
    inputCampo.placeholder = input;
    divCampos.appendChild(inputCampo);
  }

  contenedorCampos.appendChild(divCampos);
});

btnLeer.addEventListener("click", function leer() {
  const camposTexto = document.querySelectorAll("input[type=text]");
  let filas = camposTexto.length / 3;
  let col = 0;
  let j = 0;
  let valido = true;

  matrizDatos = [];

  for (let i = 0; i < filas; i++) {
    const idProceso = camposTexto[col].value;
    const tiempoCPU = camposTexto[col + 1].value;
    const tiempoIO = camposTexto[col + 2].value;

    // Validar entradas
    if (isNaN(tiempoCPU) || isNaN(tiempoIO) || tiempoCPU < 2) {
      alerta.innerHTML = "El tiempo de CPU debe ser un número mayor o igual a 2 y el tiempo de E/S debe ser un número.";
      valido = false;
      break;
    }

    matrizDatos[i] = [idProceso, parseInt(tiempoCPU), parseInt(tiempoIO)];
    col += 3;
  }

  if (valido) {
    alerta.innerHTML = "";
    crearTabla(matrizDatos);
    nuevaMatrizDatos = generarNuevaMatriz(matrizDatos);
    console.log(nuevaMatrizDatos);
  }
});

btnCambiar.addEventListener("click", function cambiar() {
  nuevaMatrizDatos = generarNuevaMatriz(matrizDatos);
  multiprogramacion();
});

function crearTabla(matriz) {
  let tablaHTML = '<table class="table table-bordered"><thead><tr><th>ID</th><th>Tiempo de CPU</th><th>Tiempo de E/S</th></tr></thead><tbody>';
  for (let i = 0; i < matriz.length; i++) {
    tablaHTML += '<tr><td>' + matriz[i][0] + '</td><td>' + matriz[i][1] + '</td><td>' + matriz[i][2] + '</td></tr>';
  }
  tablaHTML += '</tbody></table>';
  tabla.innerHTML = tablaHTML;
}

btnMulti.addEventListener("click", multiprogramacion);

function multiprogramacion() {
  contenedorMulti.innerHTML = ''; // Limpiar el contenido anterior
  const nuevoParrafo = document.createElement("div");
  const matrizDiagrama = generarMatrizMultiprogramacion(nuevaMatrizDatos);
  tablaMultiprogramacion(matrizDiagrama);
  const textoParrafo = document.createTextNode(porcentajeUsoMultiprogramacion(matrizDiagrama) + "% es el porcentaje de tiempo de uso");
  nuevoParrafo.appendChild(textoParrafo);
  contenedorMulti.appendChild(nuevoParrafo);
}

function tablaMultiprogramacion(matriz) {
  let tablaHTML = '<table class="table table-bordered" style="width: 100%"><thead><tr><th>ID</th>'; // Encabezado de la tabla con la columna de ID

  // Recorrer cada fila de la matriz para determinar la longitud máxima
  let maxLength = 0;
  for (let i = 0; i < matriz.length; i++) {
    if (matriz[i].length > maxLength) {
      maxLength = matriz[i].length;
    }
  }

  // Agregar números de celda del 1 al número máximo de columnas encontradas
  for (let i = 1; i <= maxLength; i++) {
    tablaHTML += '<th>' + i + '</th>';
  }
  tablaHTML += '</tr></thead><tbody>';

  // Agregar filas y celdas de la tabla
  for (let i = 0; i < matriz.length; i++) {
    tablaHTML += '<tr id="multi-row-' + i + '"><td>' + matriz[i][0] + '</td>'; // Mostrar el ID de proceso en la primera celda

    // Recorrer cada elemento de la fila y agregar una celda para cada uno
    for (let j = 0; j < maxLength; j++) {
      let valorCelda = j < matriz[i].length ? matriz[i][j] : ''; // Obtener el valor de la matriz si existe, o dejar vacío si no
      tablaHTML += '<td id="cell-' + i + '-' + j + '" style="width: 10px; height: 10px;"></td>'; // Reducir el tamaño de los cuadros
    }

    tablaHTML += '</tr>';
  }

  tablaHTML += '</tbody></table>';
  contenedorMulti.innerHTML = tablaHTML;

  // Animación de pintura de cuadros uno por uno
  let filaActual = 0;
  let celdaActual = 0;

  const intervalId = setInterval(() => {
    if (filaActual < matriz.length) {
      const celda = document.getElementById('cell-' + filaActual + '-' + celdaActual);
      if (celda) {
        celda.style.backgroundColor = getColor(matriz[filaActual][celdaActual]); // Asignar el color de fondo
        celdaActual++; // Mover a la siguiente celda
        if (celdaActual >= matriz[filaActual].length) { // Si llegamos al final de la fila, pasar a la siguiente fila
          filaActual++;
          celdaActual = 0;
        }
      }
    } else {
      clearInterval(intervalId); // Detener la animación cuando se hayan pintado todas las celdas
    }
  }, 1000); // Intervalo de tiempo en milisegundos (ajustable)
}

function getColor(valor) {
  if (valor === 1) {
    return 'orange';
  } else if (valor === 0) {
    return 'blue';
  } else if (valor === '-') {
    return 'gray';
  } else if (valor === 'a0') {
    return 'blue';
  }
  return 'white'; // Por defecto
}

function generarMatrizMultiprogramacion(matriz) {
  const matrizMultiprogramacion = [];
  for (let i = 0; i < matriz.length; i++) {
    let fila = [];
    if (i === 0) {
      for (let j = 0; j < matriz[i].length; j++) {
        fila[j] = matriz[i][j];
      }
    } else {
      let k = 0;
      for (let j = 0; j < matriz[i].length;) {
        if (matrizMultiprogramacion[i - 1][k] === undefined) {
          fila[k] = matriz[i][j];
          j++;
        } else if (matriz[i][j] === 1 && matrizMultiprogramacion[i - 1][k] === 1) {
          fila[k] = '-';
        } else if (matriz[i][j] === 1 && matrizMultiprogramacion[i - 1][k] === '-') {
          fila[k] = '-';
        } else if (matriz[i][j] === 1 && matrizMultiprogramacion[i - 1][k] === 0) {
          fila[k] = 1;
          j++;
        } else if (matriz[i][j] === 0 && matrizMultiprogramacion[i - 1][k] === 0) {
          fila[k] = 0;
          j++;
        } else if (matriz[i][j] === 0 && matrizMultiprogramacion[i - 1][k] === 'a0') {
          fila[k] = 'a0';
          j++;
        } else if (matriz[i][j] === 1 && matrizMultiprogramacion[i - 1][k] === 'a0') {
          fila[k] = '-';
        } else if (matriz[i][j] === 0 && matrizMultiprogramacion[i - 1][k] === 1) {
          fila[k] = 'a0';
          j++;
        } else if (matriz[i][j] === 0 && matrizMultiprogramacion[i - 1][k] === '-') {
          fila[k] = 'a0';
          j++;
        }
        k++;
      }
    }
    matrizMultiprogramacion[i] = fila;
  }
  return matrizMultiprogramacion;
}

function porcentajeUsoMultiprogramacion(matriz) {
  let tCPUtime = 0;
  let tRealTime = 0;
  for (let i = 0; i < matriz.length; i++) {
    for (let j = 0; j < matriz[i].length; j++) {
      if (matriz[i][j] === 1) {
        tCPUtime++;
      }
      tRealTime++;
    }
  }
  let tiempoUso = (tCPUtime / tRealTime) * 100;
  return tiempoUso.toFixed(2);
}

function mezclar(array) {
  for (let i = array.length - 2; i > 1; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    if (j !== 0 && j !== (array.length - 1)) {
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  return array;
}

function generarNuevaMatriz(matriz) {
  let nuevaMatriz = [];
  for (let i = 0; i < matriz.length; i++) {
    let arreglo = [];
    let tCPU = matriz[i][1];
    let tIO = matriz[i][2];
    if (tCPU < 2) {
      alerta.innerHTML = "El tiempo de CPU debe ser mayor o igual a 2";
      return [];
    }
    alerta.innerHTML = "";
    arreglo[0] = 1;
    arreglo[tCPU + tIO - 1] = 1;
    if (tCPU === 2) {
      for (let j = 1; j < arreglo.length - 1; j++) {
        arreglo[j] = 0;
      }
    } else {
      let contador = 1;
      for (let j = 1; j <= tCPU - 2; j++) {
        arreglo[j] = 1;
        contador++;
      }
      for (let j = 0; j < tIO; j++) {
        arreglo[contador + j] = 0;
      }
      arreglo = mezclar(arreglo);
    }
    nuevaMatriz.push(arreglo);
  }
  return nuevaMatriz;
}


