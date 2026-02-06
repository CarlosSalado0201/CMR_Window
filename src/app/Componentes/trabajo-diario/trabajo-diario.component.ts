import { Component, OnInit } from '@angular/core';
import { categoria } from 'src/app/models/categorias';
import { equipoConCantidad } from 'src/app/models/equipoConCantidad';
import { equipo } from 'src/app/models/equipos';
import { materiales } from 'src/app/models/materiales';
import { serviciosService } from 'src/app/servicios/servicios.service';
import { costosAdicionales } from 'src/app/models/costosAdicionales';
import { modelos } from 'src/app/models/modelos';

@Component({
  selector: 'app-trabajo-diario',
  templateUrl: './trabajo-diario.component.html',
  styleUrls: ['./trabajo-diario.component.css']
})
export class TrabajoDiarioComponent implements OnInit {

  // ==============================================
  // VARIABLES GENERALES
  // ==============================================
  fechaInicio: string = '';
  fechaFin: string = '';
  diasDeTrabajo: number = 0;
  hoy: string = new Date().toISOString().split('T')[0];
  valorTotalTrabajo: number | null = null;

  // ==============================================
  // VARIABLES COMPARTIDAS
  // ==============================================
  categorias: categoria[] = [];
  modelos: modelos[] = [];

  // ==============================================
  // VARIABLES PARA EQUIPOS
  // ==============================================
  equiposFiltrados: equipoConCantidad[] = [];
  equiposFiltradosBusqueda: equipoConCantidad[] = [];
  listaEquiposSeleccionados: equipoConCantidad[] = [];
  equiposSeleccionadosTemporal: equipoConCantidad[] = [];
  
  categoriaSeleccionada: categoria | null = null;
  modeloSeleccionado: modelos | null = null;
  modelosFiltradosPorCategoria: modelos[] = [];
  
  mostrarEquipos: boolean = false;
  textoBusqueda: string = '';
  porcentajeGeneralEquipos: number = 0;

  // ==============================================
  // VARIABLES PARA MATERIALES
  // ==============================================
  categoriasMateriales: categoria[] = []; // Variable separada para materiales
  categoriaSeleccionadaMateriales: categoria | null = null;
  modeloSeleccionadoMateriales: modelos | null = null;
  modelosFiltradosMateriales: modelos[] = [];
  materiales: any[] = [];
  materialesFiltrados: any[] = [];
  textoBusquedaMateriales: string = '';
  materialesSeleccionadosTemporal: materiales[] = [];
  listaMaterialesSeleccionados: (materiales & { cantidad: number; porcentaje: number; precioFinal: number })[] = [];
  
  porcentajeGeneralMateriales: number = 0;
  cantidadEquipos: number = 1;
  metrosInstalacion: number = 1;

  // ==============================================
  // VARIABLES PARA MANO DE OBRA
  // ==============================================
  manosDeObra = [
    { nombre: 'Impuestos federales', precio: 134.55 },
    { nombre: 'Renta de oficina', precio: 150 },
    { nombre: 'Celulares / Telefonos', precio: 44 },
    { nombre: 'Herramientas', precio: 55.5},
    { nombre: 'Mantenimiento de autos', precio: 32.50 },
    { nombre: 'Verificación de autos ', precio: 40.0 },
    { nombre: 'Seguro de autos', precio: 40.000 },
    { nombre: 'Servicio de oficina (Agua/Basura)', precio: 13.3 },
    { nombre: 'Servicio de internet', precio: 44 },
    { nombre: 'Servicio de luz ', precio: 12.92 },
    { nombre: 'Servicio de contador ', precio: 166.666 },
    { nombre: 'Impuestos de la empresa ', precio: 542.16 }
  ];

  manosDeObraSeleccionadasNombres: string[] = [];
  manosDeObraSeleccionadas: any[] = [];
  mostrarMO: boolean = false;
  resumenManoDeObra: any = null;
  porcentajeManoObra: number = 0;
  valorManoObra: number | null = null;

  // ==============================================
  // VARIABLES PARA COSTOS ADICIONALES
  // ==============================================
  costosAdicionales: costosAdicionales = {
    numeroTrabajadores: 1,
    sueldoPorTrabajador: 425.97,
    imssPorTrabajador: 134.5,
    ubicacion: 'ciudad',
    distancia: '500',
    gasolinaPorDia: 50,
    tagsPorDia: 30,
    viaticosPorDia: 100,
  };
  resumenCostosAdicionales: any = null;

  constructor(private servicios: serviciosService) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarModelos();
  }

  // ==============================================
  // MÉTODOS GENERALES
  // ==============================================
  cargarCategorias() {
    this.servicios.obtenerCategorias().subscribe({
      next: data => this.categorias = data,
      error: err => {
        console.error('Error cargando categorías:', err);
        this.categorias = [];
      }
    });
  }

  cargarModelos() {
    this.servicios.getModelos().subscribe(data => {
      this.modelos = data;
    });
  }

  calcularDias() {
    if (this.fechaInicio && this.fechaFin) {
      const inicio = new Date(this.fechaInicio);
      const fin = new Date(this.fechaFin);
      const diferencia = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      this.diasDeTrabajo = diferencia > 0 ? diferencia : 1;
    } else {
      this.diasDeTrabajo = 1;
    }
  }

  actualizarDias() {
    this.calcularDias();
    this.guardarManosDeObra();
    this.guardarCostosAdicionales();
    this.calcularManoObra();
    this.calcularValorTotalTrabajo();
  }

  // ==============================================
  // MÉTODOS PARA EQUIPOS
  // ==============================================
  abrirModalEquipos() {
    if (this.categorias.length === 0) {
      this.cargarCategorias();
    }
    this.mostrarEquipos = true;
    this.equiposSeleccionadosTemporal = [];
    this.categoriaSeleccionada = null;
    this.modeloSeleccionado = null;
    this.textoBusqueda = '';
    this.equiposFiltrados = [];
    this.equiposFiltradosBusqueda = [];
  }

  seleccionarCategoria(categoria: any) {
    this.categoriaSeleccionada = categoria;
    
    this.modeloSeleccionado = null;
    this.modelosFiltradosPorCategoria = this.modelos.filter(
      m => m.categoria && m.categoria.id === categoria.id
    );
  }

  seleccionarModelo(modelo: modelos) {
    this.modeloSeleccionado = modelo;
    this.textoBusqueda = '';
    
    this.servicios.obtenerEquipos().subscribe(equipos => {
      this.equiposFiltrados = equipos.filter(e => e.modelo.id === modelo.id).map(e => ({ ...e, cantidad: 1, porcentaje: 0 }));
      this.equiposFiltradosBusqueda = [...this.equiposFiltrados];
    });
  }

  filtrarBusqueda() {
    const texto = this.textoBusqueda.toLowerCase().trim();
    if (!texto) {
      this.equiposFiltradosBusqueda = [...this.equiposFiltrados];
    } else {
      this.equiposFiltradosBusqueda = this.equiposFiltrados.filter(e =>
        e.marca.toLowerCase().includes(texto) ||
        e.modelo.nombre.toLowerCase().includes(texto)
      );
    }
  }

  toggleSeleccionEquipo(equipo: equipoConCantidad) {
    const index = this.equiposSeleccionadosTemporal.findIndex(e => e.id === equipo.id);
    if (index >= 0) {
      this.equiposSeleccionadosTemporal.splice(index, 1);
    } else {
      this.equiposSeleccionadosTemporal.push(equipo);
    }
  }

  agregarEquiposSeleccionados() {
    this.equiposSeleccionadosTemporal.forEach(e => {
      const porcentaje = this.porcentajeGeneralEquipos ?? 0;
      const existente = this.listaEquiposSeleccionados.find(eq => eq.id === e.id);

      if (existente) {
        const nuevaCantidad = (existente.cantidad ?? 1) + (e.cantidad ?? 1);
        existente.cantidad = nuevaCantidad;
        existente.porcentaje = porcentaje;
        existente.precioFinal = existente.precio * nuevaCantidad * (1 + porcentaje / 100);
      } else {
        const cantidad = e.cantidad ?? 1;
        const precioFinal = e.precio * cantidad * (1 + porcentaje / 100);
        this.listaEquiposSeleccionados.push({
          ...e,
          cantidad,
          porcentaje,
          precioFinal
        });
      }
    });

    this.equiposSeleccionadosTemporal = [];
    this.porcentajeGeneralEquipos = 0;
    this.mostrarEquipos = false;
    this.textoBusqueda = '';
    this.calcularValorTotalTrabajo();
  }

 
  eliminarEquipo(index: number) {
    this.listaEquiposSeleccionados.splice(index, 1);
    this.calcularValorTotalTrabajo();
  }

  // ==============================================
  // MÉTODOS PARA MATERIALES
  // ==============================================
  abrirModalMateriales() {
    this.categoriaSeleccionadaMateriales = null;
    this.modeloSeleccionadoMateriales = null;
    this.modelosFiltradosMateriales = [];
    this.materiales = [];
    this.materialesFiltrados = [];
    this.textoBusquedaMateriales = '';
    this.materialesSeleccionadosTemporal = [];
    
    // Cargar categorías específicamente para materiales
    this.servicios.obtenerCategorias().subscribe({
      next: (data) => {
        this.categoriasMateriales = data;
      },
      error: (err) => {
        console.error('Error cargando categorías para materiales:', err);
        this.categoriasMateriales = [];
      }
    });
  }

  filtrarMateriales() {
    const texto = this.textoBusquedaMateriales.toLowerCase().trim();
    if (!texto) {
      this.materialesFiltrados = [...this.materiales];
    } else {
      this.materialesFiltrados = this.materiales.filter(m =>
        m.nombre.toLowerCase().includes(texto)
      );
    }
  }

  toggleSeleccionMaterial(material: any) {
    const index = this.materialesSeleccionadosTemporal.findIndex(m => m.id === material.id);
    if (index >= 0) {
      this.materialesSeleccionadosTemporal.splice(index, 1);
    } else {
      // Asegurar que tiene una cantidad válida antes de agregar
      if (!material.cantidadSeleccionada || material.cantidadSeleccionada <= 0) {
        material.cantidadSeleccionada = 1;
      }
      this.materialesSeleccionadosTemporal.push(material);
    }
  }

  agregarMaterialesSeleccionados() {
    const porcentaje = this.porcentajeGeneralMateriales ?? 0;

    this.materialesSeleccionadosTemporal.forEach(m => {
      const cantidad = m.cantidadSeleccionada || 1;
      const existente = this.listaMaterialesSeleccionados.find(mat => mat.id === m.id);

      if (existente) {
        const nuevaCantidad = (existente.cantidad ?? 1) + cantidad;
        existente.cantidad = nuevaCantidad;
        existente.porcentaje = porcentaje;
        existente.precioFinal = (existente.precioUnitario ?? 0) * nuevaCantidad * (1 + porcentaje / 100);
      } else {
        const precioFinal = (m.precioUnitario ?? 0) * cantidad * (1 + porcentaje / 100);

        this.listaMaterialesSeleccionados.push({
          ...m,
          cantidad,
          porcentaje,
          precioFinal
        });
      }
    });

    // Limpiar después de agregar
    this.materialesSeleccionadosTemporal = [];
    this.porcentajeGeneralMateriales = 0;
    this.textoBusquedaMateriales = '';
    
    // Calcular el total actualizado
    this.calcularValorTotalTrabajo();
  }

  aplicarInstalacion() {
    this.materialesFiltrados.forEach(material => {
      const basePiezasPorMetro = material.cantidad ?? 1;
      material.cantidadSeleccionada = basePiezasPorMetro * this.cantidadEquipos * this.metrosInstalacion;
    });
  }

  

  // ==============================================
  // MÉTODOS PARA MANO DE OBRA
  // ==============================================
  seleccionarTodoMO() {
    this.manosDeObraSeleccionadasNombres = this.manosDeObra.map(mo => mo.nombre);
  }

  deseleccionarTodoMO() {
    this.manosDeObraSeleccionadasNombres = [];
  }

  onChangeManoDeObra(event: any) {
    const nombre = event.target.value;
    if (event.target.checked) {
      if (!this.manosDeObraSeleccionadasNombres.includes(nombre)) {
        this.manosDeObraSeleccionadasNombres.push(nombre);
      }
    } else {
      const i = this.manosDeObraSeleccionadasNombres.indexOf(nombre);
      if (i >= 0) this.manosDeObraSeleccionadasNombres.splice(i, 1);
    }
  }

  guardarManosDeObra() {
    const dias = this.diasDeTrabajo > 0 ? this.diasDeTrabajo : 1;

    this.manosDeObraSeleccionadas = this.manosDeObra
      .filter(mo => this.manosDeObraSeleccionadasNombres.includes(mo.nombre))
      .map(mo => ({
        ...mo,
        total: mo.precio * dias
      }));

    const sumaManoDeObraPorDia = this.manosDeObraSeleccionadas.reduce((total, mo) => total + mo.total, 0);

    this.resumenManoDeObra = {
      total: sumaManoDeObraPorDia,
      dias
    };

    this.mostrarMO = false;
  }

  calcularManoObra() {
    const dias = this.diasDeTrabajo > 0 ? this.diasDeTrabajo : 1;

    const sumaManoObra = this.manosDeObra
      .filter(mo => this.manosDeObraSeleccionadasNombres.includes(mo.nombre))
      .reduce((total, mo) => total + mo.precio, 0);

    const costosAdicionalesTotales = this.resumenCostosAdicionales
      ? this.resumenCostosAdicionales.sueldoTotal / dias
        + this.resumenCostosAdicionales.imssTotal / dias
        + (this.calcularCostoUbicacion() || 0)
      : 0;

    const totalBase = sumaManoObra + costosAdicionalesTotales;
    const totalConPorcentaje = totalBase * (1 + this.porcentajeManoObra / 100);

    this.valorManoObra = totalConPorcentaje * dias;
  }

  // ==============================================
  // MÉTODOS PARA COSTOS ADICIONALES
  // ==============================================
  asignarValoresPorDefecto() {
    if (this.costosAdicionales.ubicacion === 'ciudad') {
      this.costosAdicionales.gasolinaPorDia = 50;
      this.costosAdicionales.tagsPorDia = 30;
      this.costosAdicionales.viaticosPorDia = 100;
    } else if (this.costosAdicionales.ubicacion === 'fuera') {
      switch(this.costosAdicionales.distancia) {
        case '500':
          this.costosAdicionales.gasolinaPorDia = 60;
          this.costosAdicionales.tagsPorDia = 40;
          this.costosAdicionales.viaticosPorDia = 120;
          break;
        case '1000':
          this.costosAdicionales.gasolinaPorDia = 80;
          this.costosAdicionales.tagsPorDia = 60;
          this.costosAdicionales.viaticosPorDia = 140;
          break;
        case '1500':
          this.costosAdicionales.gasolinaPorDia = 100;
          this.costosAdicionales.tagsPorDia = 80;
          this.costosAdicionales.viaticosPorDia = 160;
          break;
        default:
          this.costosAdicionales.gasolinaPorDia = 50;
          this.costosAdicionales.tagsPorDia = 30;
          this.costosAdicionales.viaticosPorDia = 100;
      }
    }
  }

  guardarCostosAdicionales() {
    const dias = this.diasDeTrabajo > 0 ? this.diasDeTrabajo : 1;

    this.resumenCostosAdicionales = {
      trabajadores: this.costosAdicionales.numeroTrabajadores,
      sueldoTotal: this.costosAdicionales.sueldoPorTrabajador * this.costosAdicionales.numeroTrabajadores * dias,
      imssTotal: this.costosAdicionales.imssPorTrabajador * this.costosAdicionales.numeroTrabajadores * dias,
      gasolina: (this.costosAdicionales.gasolinaPorDia ?? 0) * dias,
      tags: (this.costosAdicionales.tagsPorDia ?? 0) * dias,
      viaticos: (this.costosAdicionales.viaticosPorDia ?? 0) * this.costosAdicionales.numeroTrabajadores * dias,
      dias
    };
  }

  calcularCostoUbicacion() {
    let costo = 0;
    if (this.costosAdicionales.ubicacion === 'fuera') {
      switch (this.costosAdicionales.distancia) {
        case '500':
          costo = 100;
          break;
        case '1000':
          costo = 200;
          break;
        case '1500':
          costo = 300;
          break;
      }
    }
    return costo;
  }

  // ==============================================
  // MÉTODOS PARA CÁLCULOS FINALES
  // ==============================================
  calcularValorTotalTrabajo() {
    const totalMO = this.valorManoObra ?? 0;
    const totalEquipos = this.listaEquiposSeleccionados.reduce((total, eq) => total + (eq.precioFinal ?? 0), 0);
    const totalMateriales = this.listaMaterialesSeleccionados.reduce((total, mat) => total + (mat.precioFinal ?? 0), 0);

    this.valorTotalTrabajo = totalMO + totalEquipos + totalMateriales;
  }

  limpiarResumen() {
    // Limpiar listas
    this.listaEquiposSeleccionados = [];
    this.listaMaterialesSeleccionados = [];
    this.manosDeObraSeleccionadas = [];
    this.manosDeObraSeleccionadasNombres = [];

    // Limpiar resumenes
    this.resumenCostosAdicionales = null;
    this.resumenManoDeObra = null;

    // Resetear costos adicionales
    this.costosAdicionales = {
      numeroTrabajadores: 1,
      sueldoPorTrabajador: 425.97,
      imssPorTrabajador: 134.5,
      ubicacion: 'ciudad',
      distancia: '500',
      gasolinaPorDia: 50,
      tagsPorDia: 30,
      viaticosPorDia: 100,
    };

    // Limpiar cálculos
    this.porcentajeManoObra = 0;
    this.valorManoObra = null;
    this.valorTotalTrabajo = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.diasDeTrabajo = 0;
  }
seleccionarModeloMateriales(modelo: modelos) {
  this.modeloSeleccionadoMateriales = modelo;
  this.textoBusquedaMateriales = '';

  this.servicios.getMaterialesPorModelo(modelo.id).subscribe(materiales => {
  this.materiales = materiales.map(m => ({
  ...m,
  cantidadSeleccionada: m.cantidad ?? 1,
  cantidadBase: m.cantidad ?? 1
}));
    this.materialesFiltrados = [...this.materiales];
  });
}
seleccionarCategoriaMateriales(categoria: categoria) {
  this.categoriaSeleccionadaMateriales = categoria;
  this.servicios.obtenerModelosPorCategoria(categoria).subscribe(modelos => {
    this.modelosFiltradosMateriales = modelos;
  });
}


  // Variables nuevas o a agregar
instalacionActiva: boolean = false;

// Método para toggle instalación
toggleInstalacion() {
  this.instalacionActiva = !this.instalacionActiva;

  if (this.instalacionActiva) {
    this.materialesFiltrados.forEach(mat => {
      const yaSeleccionado = this.materialesSeleccionadosTemporal.find(m => m.id === mat.id);

      if (!yaSeleccionado) {
        // Calcular cantidad usando cantidadBase, metros y equipos
        const baseCantidad = mat.cantidadBase ?? 1;
        mat.cantidadSeleccionada = baseCantidad * this.metrosInstalacion * this.cantidadEquipos;
        this.materialesSeleccionadosTemporal.push(mat);
      }
    });
  } else {
    // Al desactivar, eliminar los visibles
    this.materialesFiltrados.forEach(mat => {
      const index = this.materialesSeleccionadosTemporal.findIndex(m => m.id === mat.id);
      if (index !== -1) {
        this.materialesSeleccionadosTemporal.splice(index, 1);
        // También restaurar cantidadSeleccionada a base
        mat.cantidadSeleccionada = mat.cantidadBase ?? 1;
      }
    });
  }
}


actualizarCantidadesPorInstalacion() {
  if (!this.instalacionActiva) return;

  this.materialesFiltrados.forEach(mat => {
    mat.cantidadSeleccionada = (mat.cantidadBase ?? 1) * this.metrosInstalacion * this.cantidadEquipos;
  });

  // Actualizar cantidades en los materiales seleccionados temporalmente también
  this.materialesSeleccionadosTemporal.forEach(matSel => {
    const matFiltrado = this.materialesFiltrados.find(m => m.id === matSel.id);
    if (matFiltrado) {
      matSel.cantidadSeleccionada = matFiltrado.cantidadSeleccionada;
    }
  });
}

}