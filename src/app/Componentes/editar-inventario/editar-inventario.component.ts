import { Component } from '@angular/core';
import { Categoria } from 'src/app/Models/Categorias';
import { Equipo } from 'src/app/Models/Equipos';
import { Materiales } from 'src/app/Models/Materiales';
import { Modelos } from 'src/app/Models/Modelos';
import { ServiciosService } from 'src/app/Servicios/servicios.service';

@Component({
  selector: 'app-editar-inventario',
  templateUrl: './editar-inventario.component.html',
  styleUrls: ['./editar-inventario.component.css']
})
export class EditarInventarioComponent {
entidadActiva: 'categoria' | 'equipo' | 'materiales' | 'modelo' | '' = '';

  categorias: Categoria[] = [];
  nuevaCategoria: Categoria = { id: 0, nombre: '' };
  editandoCategoria: Categoria | null = null;
  filtroCategorias: string = '';

  equipos: Equipo[] = [];
   materiales: Materiales[] = [];
nuevoMaterial: Materiales = {id: 0,  nombre: '',  unidad: '',  cantidad: 0,  precioUnitario: 0,  modelo: {    id: 0,     nombre: '',     capacidad: '',     categoria: { id: 0, nombre: '' } }};
 editandoMaterial: Materiales | null = null;
  filtroMateriales: string = '';
  mostrarPanelAgregarMaterial: boolean = false;
  mostrarErrorNuevoMaterial: boolean = false;
  mostrarErrorEditarMaterial: boolean = false;
  mostrarPanelAgregarCategoria = false;
  mostrarPanelAgregarEquipo = false;

  mostrarErrorNuevaCategoria = false;
  mostrarErrorEditarCategoria = false;
  mostrarErrorNuevoEquipo = false;
  mostrarErrorEditarEquipo = false;
  constructor(private servicios: ServiciosService) {}
modelos: Modelos[] = [];
filtroModelos: string = '';
mostrarPanelAgregarModelo = false;
mostrarErrorNuevoModelo = false;
nuevoModelo = { nombre: '', categoriaId: 0 };
editandoModelo: Modelos | null = null;
mostrarErrorEditarModelo = false;

activarEntidad(entidad: 'categoria' | 'equipo' | 'materiales' | 'modelo') {
  this.entidadActiva = entidad;
  this.cerrarPanelesAgregar();

  if (entidad === 'categoria') {
    this.cargarCategorias();
  } else if (entidad === 'equipo') {
    this.cargarEquipos(); // si tienes esta función
  } else if (entidad === 'materiales') {
    this.cargarMateriales(); // si tienes esta función
  } else if (entidad === 'modelo') {
    this.cargarCategorias(); // modelos dependen de categorías
    this.cargarModelos();
  }
}
 cerrarPanelesAgregar() {
    this.mostrarPanelAgregarCategoria = false;
    this.mostrarPanelAgregarEquipo = false;
    this.mostrarPanelAgregarMaterial = false;

    this.mostrarErrorNuevaCategoria = false;
    this.mostrarErrorNuevoEquipo = false;
    this.mostrarErrorNuevoMaterial = false;

    this.nuevaCategoria = { id: 0, nombre: '' };
    
this.nuevoMaterial = {
  id: 0,
  nombre: '',
  unidad: '',
  cantidad: 0,
  precioUnitario: 0,
  modelo: { id: 0, nombre: '', capacidad: '', categoria: { id: 0, nombre: '' } }
};
}
cargarCategorias() {
    this.servicios.obtenerCategorias().subscribe(data => {
      this.categorias = data;
     });
  
}

agregarCategoria() {
  if (!this.nuevaCategoria.nombre.trim()) {
    alert('El nombre es obligatorio');
    return;
  }

  // Solo enviamos el nombre para que el backend genere el ID autoincrementable
  const categoriaPayload = { nombre: this.nuevaCategoria.nombre.trim() };

  this.servicios.guardarCategoria(categoriaPayload).subscribe(res => {
    if (res === 'nombreYaExiste') {
      alert('Ya existe una categoría con ese nombre');
    } else if (res === null) {
      alert('Error al agregar categoría');
    } else {
      alert('Categoría agregada');
      this.nuevaCategoria = { id: 0, nombre: '' };
      this.mostrarPanelAgregarCategoria = false;
      this.cargarCategorias();
    }
  });
}

  cancelarAgregarCategoria() {
    this.mostrarPanelAgregarCategoria = false;
    this.mostrarErrorNuevaCategoria = false;
    this.nuevaCategoria = { id: 0, nombre: '' };
  }

  seleccionarParaEditarCategoria(categoria: Categoria) {
    this.editandoCategoria = { ...categoria };
    this.mostrarErrorEditarCategoria = false;
  }

  editarCategoria() {
    this.mostrarErrorEditarCategoria = false;

    if (!this.editandoCategoria) return;

    if (!this.editandoCategoria.nombre.trim()) {
      this.mostrarErrorEditarCategoria = true;
      return;
    }

    this.servicios.editarCategoria(this.editandoCategoria).subscribe(res => {
      if (res) {
        alert('Categoría editada');
        this.editandoCategoria = null;
        this.cargarCategorias();
      } else {
        alert('Error al editar categoría');
      }
    });
  }

  eliminarCategoria(id: number) {
    if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;
    this.servicios.eliminarCategoria(id).subscribe(() => {
      alert('Categoría eliminada');
      this.cargarCategorias();
    });
  }

  cancelarEdicionCategoria() {
    this.editandoCategoria = null;
    this.mostrarErrorEditarCategoria = false;
  }

  isEditandoCategoria(categoria: Categoria): boolean {
    return this.editandoCategoria !== null && this.editandoCategoria.id === categoria.id;
  }
   get categoriasFiltradas(): Categoria[] {
    if (!this.filtroCategorias.trim()) return this.categorias;
    return this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(this.filtroCategorias.toLowerCase())
    );
  }
//////////////////////Equipos
cargarModelos() {
  this.servicios.getModelos().subscribe(data => this.modelos = data);
}

agregarModelo() {
  this.mostrarErrorNuevoModelo = false;

  if (!this.nuevoModelo.nombre.trim() || !this.nuevoModelo.categoriaId) {
    this.mostrarErrorNuevoModelo = true;
    return;
  }

  this.servicios.agregarModelo(this.nuevoModelo).subscribe(res => {
    if (res === 'nombreYaExiste') {
      alert('Ya existe un modelo con ese nombre');
    } else if (res === null) {
      alert('Error al guardar modelo');
    } else {
      alert('Modelo guardado con éxito');
      this.nuevoModelo = { nombre: '', categoriaId: 0 };
      this.mostrarPanelAgregarModelo = false;
      this.cargarModelos();
    }
  });
}

eliminarModelo(id: number) {
  if (!confirm('¿Seguro que quieres eliminar este modelo?')) return;
  this.servicios.eliminarModelo(id).subscribe(() => {
    alert('Modelo eliminado');
    this.cargarModelos();
  });
}

get modelosFiltrados(): Modelos[] {
  if (!this.filtroModelos.trim()) return this.modelos;
  return this.modelos.filter(m =>
    m.nombre.toLowerCase().includes(this.filtroModelos.toLowerCase())
  );
}
seleccionarParaEditarModelo(modelo: Modelos) {
  this.editandoModelo = { ...modelo };
  this.mostrarErrorEditarModelo = false;
}
editarModelo() {
  this.mostrarErrorEditarModelo = false;

  if (!this.editandoModelo) return;

  if (!this.editandoModelo.nombre.trim()) {
    this.mostrarErrorEditarModelo = true;
    alert('El nombre es obligatorio');
    return;
  }

  if (!this.editandoModelo.categoria || this.editandoModelo.categoria.id === 0) {
    this.mostrarErrorEditarModelo = true;
    alert('La categoría es obligatoria');
    return;
  }

  const payload: Modelos = {
    id: this.editandoModelo.id,
    nombre: this.editandoModelo.nombre,
    capacidad: this.editandoModelo.capacidad,
    categoria: this.editandoModelo.categoria  // ← categoría completa
  };

  this.servicios.editarModelo(payload).subscribe(res => {
    if (res) {
      alert('Modelo editado correctamente');
      this.editandoModelo = null;
      this.cargarModelos();
    } else {
      alert('Error al editar modelo');
    }
  });
}

cancelarEdicionModelo() {
  this.editandoModelo = null;
  this.mostrarErrorEditarModelo = false;
}

isEditandoModelo(modelo: Modelos): boolean {
  return this.editandoModelo !== null && this.editandoModelo.id === modelo.id;
}
nuevoEquipo = { marca: '', precio: 0, modeloId: 0 };
editandoEquipo: Equipo | null = null;
filtroEquipos: string = '';

// Cargar equipos
cargarEquipos() {
  this.servicios.obtenerEquipos().subscribe(data => this.equipos = data);
}

// Agregar equipo
agregarEquipo() {
  this.mostrarErrorNuevoEquipo = false;

  if (!this.nuevoEquipo.marca.trim() || !this.nuevoEquipo.precio || !this.nuevoEquipo.modeloId) {
    this.mostrarErrorNuevoEquipo = true;
    return;
  }

  const equipoParaEnviar = {
    marca: this.nuevoEquipo.marca,
    precio: this.nuevoEquipo.precio,
    modelo: { id: this.nuevoEquipo.modeloId }
  };

  this.servicios.guardarEquipo(equipoParaEnviar).subscribe(res => {
    if (res === 'nombreYaExiste') {
      alert('Ya existe un equipo con esa marca');
    } else if (res === null) {
      alert('Error al guardar equipo');
    } else {
      alert('Equipo guardado con éxito');
      this.nuevoEquipo = { marca: '', precio: 0, modeloId: 0 };
      this.mostrarPanelAgregarEquipo = false;
      this.cargarEquipos();
    }
  });
}

// Eliminar equipo
eliminarEquipo(id: number) {
  if (!confirm('¿Seguro que quieres eliminar este equipo?')) return;
  this.servicios.eliminarEquipo(id).subscribe(() => {
    alert('Equipo eliminado');
    this.cargarEquipos();
  });
}

// Filtrar por marca
get equiposFiltrados(): Equipo[] {
  if (!this.filtroEquipos.trim()) return this.equipos;
  return this.equipos.filter(e =>
    e.marca.toLowerCase().includes(this.filtroEquipos.toLowerCase())
  );
}

// Seleccionar para editar
seleccionarParaEditarEquipo(equipo: Equipo) {
  this.editandoEquipo = {
    id: equipo.id,
    marca: equipo.marca,
    precio: equipo.precio,
    modelo: { ...equipo.modelo }
  };
  this.mostrarErrorEditarEquipo = false;
}

// Editar equipo
editarEquipo() {
  if (!this.editandoEquipo) return;

  this.mostrarErrorEditarEquipo = false;

  if (!this.editandoEquipo.marca.trim() || !this.editandoEquipo.precio || !this.editandoEquipo.modelo?.id) {
    this.mostrarErrorEditarEquipo = true;
    return;
  }

  this.servicios.editarEquipo(this.editandoEquipo).subscribe(success => {
    if (success) {
      alert('Equipo editado correctamente');
      this.editandoEquipo = null;
      this.cargarEquipos();
    } else {
      alert('Error al editar equipo');
    }
  });
}

cancelarEdicionEquipo() {
  this.editandoEquipo = null;
  this.mostrarErrorEditarEquipo = false;
}

isEditandoEquipo(equipo: Equipo): boolean {
  return this.editandoEquipo !== null && this.editandoEquipo.id === equipo.id;
}

// Cargar materiales
cargarMateriales() {
  this.servicios.obtenerMateriales().subscribe(data => this.materiales = data);
}
agregarMaterial() {
  this.mostrarErrorNuevoMaterial = false;

  if (
    !(this.nuevoMaterial.nombre?.trim() ?? '') ||
    !(this.nuevoMaterial.unidad?.trim() ?? '') ||
    (this.nuevoMaterial.cantidad ?? 0) <= 0 ||
    (this.nuevoMaterial.precioUnitario ?? 0) <= 0 ||
    !this.nuevoMaterial.modelo?.id
  ) {
    this.mostrarErrorNuevoMaterial = true;
    return;
  }

  // ✅ Aquí va el material a enviar (sin id y con solo el modelo.id)
  const materialParaEnviar = {
    nombre: this.nuevoMaterial.nombre,
    unidad: this.nuevoMaterial.unidad,
    cantidad: this.nuevoMaterial.cantidad,
    precioUnitario: this.nuevoMaterial.precioUnitario,
    modelo: { id: this.nuevoMaterial.modelo.id }
  };

  this.servicios.guardarMaterial(materialParaEnviar).subscribe(res => {
    if (res === 'nombreYaExiste') {
      alert('Ya existe un material con ese nombre');
    } else if (res === null) {
      alert('Error al guardar material');
    } else {
      alert('Material guardado con éxito');
      this.nuevoMaterial = {
        id: 0,
        nombre: '',
        descripcion: '',
        unidad: '',
        cantidad: 0,
        precioUnitario: 0,
        modelo: { id: 0, nombre: '', capacidad: '', categoria: { id: 0, nombre: '' } }
      };
      this.mostrarPanelAgregarMaterial = false;
      this.cargarMateriales();
    }
  });
}


// Eliminar material
eliminarMaterial(id: number) {
  if (!confirm('¿Seguro que quieres eliminar este material?')) return;
  this.servicios.eliminarMaterial(id).subscribe(() => {
    alert('Material eliminado');
    this.cargarMateriales();
  });
}

// Filtrar por nombre o unidad
get materialesFiltrados(): Materiales[] {
  if (!this.filtroMateriales.trim()) return this.materiales;
  const filtro = this.filtroMateriales.toLowerCase();
  return this.materiales.filter(m =>
    m.nombre.toLowerCase().includes(filtro) || (m.unidad?.toLowerCase() ?? '').includes(filtro)
  );
}


// Seleccionar para editar material
seleccionarParaEditarMaterial(material: Materiales) {
  this.editandoMaterial = {
    id: material.id,
    nombre: material.nombre,
    descripcion: material.descripcion,
    unidad: material.unidad,
    cantidad: material.cantidad,
    precioUnitario: material.precioUnitario,
    modelo: { ...material.modelo }
  };
  this.mostrarErrorEditarMaterial = false;
}
editarMaterial() {
  if (!this.editandoMaterial) return;

  this.mostrarErrorEditarMaterial = false;

  if (
    !(this.editandoMaterial?.nombre?.trim()) ||
    !(this.editandoMaterial?.unidad?.trim()) ||
    (this.editandoMaterial?.cantidad ?? 0) <= 0 ||
    (this.editandoMaterial?.precioUnitario ?? 0) <= 0 ||
    !(this.editandoMaterial?.modelo?.id)
  ) {
    this.mostrarErrorEditarMaterial = true;
    return;
  }

  const materialParaEnviar = {
    id: this.editandoMaterial.id,
    nombre: this.editandoMaterial.nombre.trim(),
    descripcion: (this.editandoMaterial.descripcion ?? '').trim(),
    unidad: this.editandoMaterial.unidad.trim(),
    cantidad: this.editandoMaterial.cantidad,
    precioUnitario: this.editandoMaterial.precioUnitario,
    modelo: { id: this.editandoMaterial.modelo.id }
  };

  console.log('Editando material enviado:', materialParaEnviar);

  this.servicios.editarMaterial(materialParaEnviar).subscribe({
    next: (materialEditado) => {
      alert('Material editado correctamente');
      this.editandoMaterial = null;
      this.cargarMateriales();
    },
    error: (err) => {
      alert('Error al editar material: ' + (err.error || err.message || ''));
      console.error('Error detalle:', err);
    }
  });
}

// Cancelar edición material
cancelarEdicionMaterial() {
  this.editandoMaterial = null;
  this.mostrarErrorEditarMaterial = false;
}

// Método para saber si un material está en edición
isEditandoMaterial(material: Materiales): boolean {
  return this.editandoMaterial !== null && this.editandoMaterial.id === material.id;
}

}
