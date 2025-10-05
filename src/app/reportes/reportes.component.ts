import { Component, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiciosService } from 'src/app/Servicios/servicios.service';
import { AuthService } from '../Servicios/auth.service';
import { Usuario } from 'src/app/Models/Usuario';

import { Cliente } from 'src/app/Models/Cliente';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
  
})
export class ReportesComponent implements AfterViewInit, OnInit {
  
  urlPdf: string | null = null;

  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private dibujando = false;

  // Supervisor signature canvas
@ViewChild('canvasSupervisor', { static: false }) canvasSupervisor!: ElementRef<HTMLCanvasElement>;

// Dibujar firma supervisor
dibujandoSupervisor = false;

// Guardado/previsualización de la firma del supervisor
firmaSupervisorDataUrl: string | null = null; // base64 para previsualizar / comprobar
firmaSupervisorFile: File | null = null;      // File si quieres enviar al backend

  // ===== FORM =====
  titulo = '';
  descripcionTrabajo = '';
  imagenes: File[] = [];
  firmaFile: File | null = null;

  // ===== USUARIO ACTUAL =====
  usuarioActual: Usuario | null = null;

  // ===== TRABAJADORES =====
  usuariosDisponibles: Usuario[] = [];
  trabajadoresSeleccionados: Usuario[] = [];
  trabajadoresSeleccionadosIds: number[] = [];

  // ===== CLIENTES =====
  clientesDisponibles: Cliente[] = [];
  clientesSeleccionados: Cliente[] = [];
  clientesSeleccionadosIds: number[] = [];

  constructor(
    private serviciosService: ServiciosService,
    private auth: AuthService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.obtenerUsuarioActual();
  this.cargarUsuariosDisponibles();
  this.cargarClientes();
    this.cargarTiposOperacion(); // ⚠️ asegúrate de llamarlo
  // ... tu código existente
}


  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#000';
  }

  // ===== FIRMA =====
  iniciarDibujo(event: MouseEvent | TouchEvent) {
    this.dibujando = true;
    const pos = this.obtenerPosicion(event);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  dibujar(event: MouseEvent | TouchEvent) {
    if (!this.dibujando) return;
    const pos = this.obtenerPosicion(event);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  detenerDibujo() {
    this.dibujando = false;
  }

  private obtenerPosicion(event: MouseEvent | TouchEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    let x = 0, y = 0;

    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    }

    return { x, y };
  }

  limpiarFirma() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.firmaFile = null;
  }
  firmaPreviewUrl: string | null = null;
guardarFirma(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.canvas.nativeElement.toBlob(blob => {
      if (blob) {
        this.firmaFile = new File([blob], 'firma.png', { type: 'image/png' });
        alert('✅ Firma guardada correctamente.');
        resolve();
      } else {
        alert('❌ No se pudo generar la firma.');
        reject('No se pudo generar la firma 2.');
      }
    });
  });
}

  // ===== IMÁGENES =====
  onImagenesSeleccionadas(event: any) {
    this.imagenes = Array.from(event.target.files);
  }

  // ===== USUARIO ACTUAL =====
// ===== USUARIO ACTUAL =====
obtenerUsuarioActual() {
  this.serviciosService.obtenerUsuarioActual().subscribe({
    next: (data: Usuario) => this.usuarioActual = data,
    error: err => console.error('Error al obtener usuario actual', err)
  });
}
 
// Cargar usuarios disponibles para selección
cargarUsuariosDisponibles() {
  this.serviciosService.obtenerUsuarios().subscribe({
    next: (data: any[]) => {
      this.usuariosDisponibles = data.map(u => ({
        ...u,
        roles: Array.isArray(u.roles) ? u.roles : Array.from(u.roles),
        rolesIds: Array.isArray(u.rolesIds) ? u.rolesIds : Array.from(u.rolesIds || [])
      }));
    },
    error: err => console.error('Error al cargar usuarios', err)
  });
}

// Filtrar usuarios disponibles (solo técnicos y distinto al usuario actual)
get usuariosDisponiblesFiltrados(): any[] {
  if (!this.usuariosDisponibles) return [];

  return this.usuariosDisponibles
    .filter(u => u.rolesIds?.includes(2))       // solo técnicos por ID
    .filter(u => !this.usuarioActual || u.id !== this.usuarioActual.id);
}

agregarTrabajadoresSeleccionados() {
  this.trabajadoresSeleccionadosIds.forEach(id => {
    const trabajador = this.usuariosDisponiblesFiltrados.find(u => u.id === id);
    if (trabajador && !this.trabajadoresSeleccionados.some(t => t.id === id)) {
      this.trabajadoresSeleccionados.push(trabajador);
    }
  });
  this.trabajadoresSeleccionadosIds = [];
}


  eliminarTrabajador(index: number) {
    this.trabajadoresSeleccionados.splice(index, 1);
  }

  // ===== CLIENTES =====
  cargarClientes() {
    this.serviciosService.obtenerClientes().subscribe({
      next: (data: Cliente[]) => this.clientesDisponibles = data,
      error: err => console.error('Error al cargar clientes', err)
    });
  }

  agregarClientesSeleccionados() {
    this.clientesSeleccionadosIds.forEach(id => {
      const cliente = this.clientesDisponibles.find(c => c.id === id);
      if (cliente && !this.clientesSeleccionados.some(c => c.id === id)) {
        this.clientesSeleccionados.push(cliente);
      }
    });
    this.clientesSeleccionadosIds = [];
  }

  eliminarCliente(index: number) {
    this.clientesSeleccionados.splice(index, 1);
  }
// ===== REPORTE =====
async generarReporte() {
  // Validaciones
  if (!this.descripcionTrabajo) {
    alert('⚠️ Por favor ingresa la descripción del trabajo.');
    return;
  }

  if (!this.usuarioActual) {
    alert('⚠️ No se pudo identificar al encargado.');
    return;
  }

  if (!this.nombreSupervisor || !this.firmaSupervisor) {
    alert('⚠️ Por favor ingresa el nombre y la firma del supervisor.');
    return;
  }

  // Datos del encargado
  const encargado = {
    nombre: this.usuarioActual.nombre || 'Sin nombre',
    cargo: this.usuarioActual.cargo || 'Encargado'
  };

  // Datos de los trabajadores
  const trabajadores = this.trabajadoresSeleccionados.map(t => ({
    nombre: t.nombre || 'Sin nombre',
    cargo: t.cargo || 'Trabajador'
  }));

  // Datos del cliente
  const cliente = this.clientesSeleccionados[0];
  if (!cliente) {
    alert('⚠️ Por favor selecciona un cliente.');
    return;
  }

  try {
    // Guardar las firmas
    await this.guardarFirma();            // Firma del encargado

    // Actividades seleccionadas
    const actividadesIds = this.actividadesSeleccionadas?.length > 0
      ? this.actividadesSeleccionadas.map(a => a.idActividad)
      : [];

    console.log("🧾 Actividades seleccionadas a enviar:", actividadesIds);

    
    // Enviar al servicio
    this.serviciosService
      .generarReporte(encargado, trabajadores, cliente, this.descripcionTrabajo, this.imagenes, this.firmaFile, actividadesIds, this.nombreSupervisor,this.firmaSupervisorFile )
      .subscribe({
        next: res => {
          this.urlPdf = res.urlPdf;
          setTimeout(() => {
            if (confirm(`✅ Reporte generado correctamente.\n¿Deseas abrir el PDF?`)) {
              window.open(this.urlPdf!, '_blank');
            }
            this.limpiarFormulario();
          }, 0);
        },
        error: err => {
          console.error('❌ Error al generar el reporte:', err);
          alert('❌ Ocurrió un error al generar el reporte.');
        }
      });

  } catch (error) {
    alert('❌ No se pudo guardar la firma: ' + error);
  }
}



// Agregar actividades seleccionadas del select
agregarActividadesSeleccionadas() {
  this.actividadesSeleccionadasIds.forEach(id => {
    const actividad = this.actividadesDisponibles.find(a => a.idActividad === id);
    if (actividad && !this.actividadesSeleccionadas.includes(actividad)) {
      this.actividadesSeleccionadas.push(actividad);
    }
  });
  // Limpiar selección del select
  this.actividadesSeleccionadasIds = [];
}


private limpiarFormulario() {
  this.titulo = '';
  this.descripcionTrabajo = '';
  this.limpiarFirma();
  this.clientesSeleccionados = [];
  this.trabajadoresSeleccionados = [];
  this.nombreSupervisor = '';
  this.actividadesSeleccionadas = [];
  // Bloquear nuevamente el botón de "Generar reporte"
  this.verificado = false;

  // También puedes limpiar la firma del supervisor si la tienes guardada
  this.firmaSupervisor = null;

  // Si usas algún campo visual (como el canvas de firma), puedes limpiarlo aquí también
  // this.limpiarFirmaSupervisor(); // (si tienes esta función)
}

  // ===== UTILIDADES =====
  cerrarLayer() { this.urlPdf = null; }

  copiarEnlace(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    alert('Enlace copiado al portapapeles ✅');
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => console.error('Error al cerrar sesión')
    });
  }
  // ==========================================================
// 🔸 VARIABLES NUEVAS
// ==========================================================
tiposOperacion: any[] = [];
tipoOperacionSeleccionadaId: number | null = null;
actividadesDisponibles: any[] = [];
actividadesSeleccionadasIds: number[] = [];
actividadesSeleccionadas: any[] = [];

// ==========================================================
// 🔸 CARGAR TIPOS DE OPERACIÓN AL INICIAR
// ==========================================================


// ==========================================================
// 🔸 MÉTODOS
// ==========================================================
cargarTiposOperacion() {
  this.serviciosService.obtenerTiposOperacion().subscribe({
    next: (tipos) => (this.tiposOperacion = tipos),
    error: (err) => console.error('Error al cargar tipos de operación:', err)
  });
}

cargarActividades() {
  if (!this.tipoOperacionSeleccionadaId) return;

  this.serviciosService.obtenerActividadesPorTipo(this.tipoOperacionSeleccionadaId).subscribe({
    next: data => {
      this.actividadesDisponibles = data || [];
      if (this.actividadesDisponibles.length === 0) {
        alert('⚠️ No hay actividades registradas para este tipo de operación.');
      }
    },
    error: err => {
      console.error('Error al cargar actividades:', err);
      alert('❌ Error al conectar con el servidor. Verifique si la base de datos está disponible.');
      this.actividadesDisponibles = [];
    }
  });
}


// Eliminar actividad seleccionada
eliminarActividad(index: number) {
  if (index > -1) {
    this.actividadesSeleccionadas.splice(index, 1);
  }
}

mostrarVerificacion = false;
verificado = false;
nombreSupervisor = '';
firmaSupervisor: string | null = null;

abrirVerificacion() {
  this.mostrarVerificacion = true;
}

cerrarVerificacion() {
  this.mostrarVerificacion = false;
}

aprobarVerificacion() {
  if (!this.nombreSupervisor || !this.firmaSupervisor) {
    alert('Por favor ingrese el nombre y la firma del supervisor.');
    return;
  }

  this.verificado = true;
  this.mostrarVerificacion = false;
  alert('✅ Verificación aprobada. Ya puede generar el reporte.');
}

iniciarDibujoSupervisor(event: MouseEvent | TouchEvent) {
  this.dibujandoSupervisor = true;
  const ctx = this.canvasSupervisor.nativeElement.getContext('2d')!;
  const pos = this.obtenerPosicionSupervisor(event);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

dibujarSupervisor(event: MouseEvent | TouchEvent) {
  if (!this.dibujandoSupervisor) return;
  const ctx = this.canvasSupervisor.nativeElement.getContext('2d')!;
  const pos = this.obtenerPosicionSupervisor(event);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

detenerDibujoSupervisor() {
  this.dibujandoSupervisor = false;
}

limpiarFirmaSupervisor() {
  const canvas = this.canvasSupervisor.nativeElement;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  this.firmaSupervisorDataUrl = null;
  this.firmaSupervisorFile = null;
}

guardarFirmaSupervisor() {
  const canvas = this.canvasSupervisor.nativeElement;

  // Previsualización
  this.firmaSupervisor = canvas.toDataURL('image/png');

  // Crear File
  canvas.toBlob(blob => {
    if (blob) {
      this.firmaSupervisorFile = new File([blob], 'firma_supervisor.png', { type: 'image/png' });
      alert('✅ Firma del supervisor guardada correctamente.');
    } else {
      alert('❌ No se pudo generar la firma del supervisor. 1');
    }
  }, 'image/png');
}

private obtenerPosicionSupervisor(event: MouseEvent | TouchEvent) {
  const canvas = this.canvasSupervisor.nativeElement;
  const rect = canvas.getBoundingClientRect();
  let clientX = 0, clientY = 0;

  if ((event as MouseEvent).clientX !== undefined) {
    clientX = (event as MouseEvent).clientX;
    clientY = (event as MouseEvent).clientY;
  } else if ((event as TouchEvent).touches && (event as TouchEvent).touches.length > 0) {
    clientX = (event as TouchEvent).touches[0].clientX;
    clientY = (event as TouchEvent).touches[0].clientY;
  }

  return { x: clientX - rect.left, y: clientY - rect.top };
}

}
