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
  pdfLink: string = '';

  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private dibujando = false;
  firmaFile: File | null = null;

  @ViewChild('canvasSupervisor', { static: false }) canvasSupervisor!: ElementRef<HTMLCanvasElement>;
  dibujandoSupervisor = false;
  firmaSupervisor: string | null = null;
  firmaSupervisorFile: File | null = null;

  titulo = '';
  descripcionTrabajo = '';
  imagenes: File[] = [];
  imagenesLecturas: File[] = [];
  lecturas = '';
  observaciones = '';
  autorizacion = '';
  nombreSupervisor = '';

  usuarioActual: Usuario | null = null;
  usuariosDisponibles: Usuario[] = [];
  trabajadoresSeleccionados: Usuario[] = [];
  trabajadoresSeleccionadosIds: number[] = [];
  clientesDisponibles: Cliente[] = [];
  clientesSeleccionados: Cliente[] = [];
  clientesSeleccionadosIds: number[] = [];

  tiposOperacion: any[] = [];
  tipoOperacionSeleccionadaId: number | null = null;
  actividadesDisponibles: any[] = [];
  actividadesSeleccionadas: any[] = [];
  actividadesSeleccionadasIds: number[] = [];

  mostrarVerificacion = false;
  verificado = false;

  constructor(
    private serviciosService: ServiciosService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.cargarUsuariosDisponibles();
    this.cargarClientes();
    this.cargarTiposOperacion();
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#000';
  }

  // ===================== FIRMA ENCARGADO =====================
  iniciarDibujo(event: MouseEvent | TouchEvent) {
    this.dibujando = true;
    const pos = this.obtenerPosicion(event, this.canvas.nativeElement);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  dibujar(event: MouseEvent | TouchEvent) {
    if (!this.dibujando) return;
    const pos = this.obtenerPosicion(event, this.canvas.nativeElement);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  detenerDibujo() {
    this.dibujando = false;
  }

  limpiarFirma() {
    const canvas = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.firmaFile = null;
  }

  // ===================== FIRMA ENCARGADO =====================
async guardarFirma() {
  return new Promise<void>((resolve, reject) => {
    this.canvas.nativeElement.toBlob(blob => {
      if (blob) {
        this.firmaFile = new File([blob], 'firma.png', { type: 'image/png' });
        alert('✅ Firma del encargado guardada con éxito');
        this.verificado = !!this.firmaFile && !!this.firmaSupervisorFile; // desbloquea si ambas firmas listas
        resolve();
      } else {
        alert('❌ Error al generar la firma del encargado.');
        reject('Error al generar la firma del encargado.');
      }
    });
  });
}

async guardarFirmaSupervisor() {
  return new Promise<void>((resolve, reject) => {
    const canvas = this.canvasSupervisor.nativeElement;
    this.firmaSupervisor = canvas.toDataURL('image/png');

    canvas.toBlob(blob => {
      if (blob) {
        this.firmaSupervisorFile = new File([blob], 'firma_supervisor.png', { type: 'image/png' });
        alert('✅ Firma del supervisor guardada con éxito');
        this.verificado = !!this.firmaFile && !!this.firmaSupervisorFile; // desbloquea si ambas firmas listas
        resolve();
      } else {
        alert('❌ Error al generar la firma del supervisor');
        reject('Error al generar la firma del supervisor');
      }
    });
  });
}

  private obtenerPosicion(event: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;

    if ((event as MouseEvent).clientX !== undefined) {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    } else if ((event as TouchEvent).touches?.length) {
      clientX = (event as TouchEvent).touches[0].clientX;
      clientY = (event as TouchEvent).touches[0].clientY;
    }

    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // ===================== FIRMA SUPERVISOR =====================
  iniciarDibujoSupervisor(event: MouseEvent | TouchEvent) {
    this.dibujandoSupervisor = true;
    const ctx = this.canvasSupervisor.nativeElement.getContext('2d')!;
    const pos = this.obtenerPosicion(event, this.canvasSupervisor.nativeElement);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  dibujarSupervisor(event: MouseEvent | TouchEvent) {
    if (!this.dibujandoSupervisor) return;
    const ctx = this.canvasSupervisor.nativeElement.getContext('2d')!;
    const pos = this.obtenerPosicion(event, this.canvasSupervisor.nativeElement);
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
    this.firmaSupervisor = null;
    this.firmaSupervisorFile = null;
  }

// ===================== FIRMA SUPERVISOR =====================



  // ===================== USUARIOS =====================
  obtenerUsuarioActual() {
    this.serviciosService.obtenerUsuarioActual().subscribe({
      next: (data: Usuario) => this.usuarioActual = data,
      error: err => console.error(err)
    });
  }

  cargarUsuariosDisponibles() {
    this.serviciosService.obtenerUsuarios().subscribe({
      next: (data: any[]) => this.usuariosDisponibles = data,
      error: err => console.error(err)
    });
  }

  get usuariosDisponiblesFiltrados(): any[] {
    return this.usuariosDisponibles
      .filter(u => u.rolesIds?.includes(2))
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

  // ===================== CLIENTES =====================
  cargarClientes() {
    this.serviciosService.obtenerClientes().subscribe({
      next: (data: Cliente[]) => this.clientesDisponibles = data,
      error: err => console.error(err)
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

  // ===================== OPERACIONES =====================
  cargarTiposOperacion() {
    this.serviciosService.obtenerTiposOperacion().subscribe({
      next: tipos => this.tiposOperacion = tipos,
      error: err => console.error(err)
    });
  }

  cargarActividades() {
    if (!this.tipoOperacionSeleccionadaId) return;
    this.serviciosService.obtenerActividadesPorTipo(this.tipoOperacionSeleccionadaId).subscribe({
      next: data => this.actividadesDisponibles = data || [],
      error: err => console.error(err)
    });
  }

  agregarActividadesSeleccionadas() {
    this.actividadesSeleccionadasIds.forEach(id => {
      const actividad = this.actividadesDisponibles.find(a => a.idActividad === id);
      if (actividad && !this.actividadesSeleccionadas.some(a => a.idActividad === id)) {
        this.actividadesSeleccionadas.push(actividad);
      }
    });
    this.actividadesSeleccionadasIds = [];
  }

  eliminarActividad(index: number) {
    this.actividadesSeleccionadas.splice(index, 1);
  }

  // ===================== REPORTES =====================
  async generarReporte() {
  try {
    // ===================== GUARDAR FIRMAS =====================
    await this.guardarFirma();           // Firma del encargado
    await this.guardarFirmaSupervisor(); // Firma del supervisor

    // ===================== VALIDACIÓN =====================
    if (!this.descripcionTrabajo || !this.usuarioActual || !this.nombreSupervisor 
        || !this.firmaFile || !this.firmaSupervisorFile) {
      alert('⚠️ Complete todos los campos requeridos y firme correctamente.');
      return;
    }

    // ===================== PREPARAR DATOS =====================
    const encargado = {
      nombre: this.usuarioActual.nombre,
      cargo: this.usuarioActual.cargo
    };

    const trabajadores = this.trabajadoresSeleccionados.map(t => ({
      nombre: t.nombre,
      cargo: t.cargo
    }));

    const cliente = this.clientesDisponibles[0];
    if (!cliente) {
      alert('⚠️ Seleccione al menos un cliente.');
      return;
    }

    const actividadesIds = this.actividadesSeleccionadas.map(a => a.idActividad);

    // ===================== GENERAR REPORTE =====================
    this.serviciosService.generarReporte(
      encargado,
      trabajadores,
      cliente,
      this.descripcionTrabajo,
      this.imagenes,
      this.firmaFile,
      actividadesIds,
      this.nombreSupervisor,
      this.firmaSupervisorFile,
      this.imagenesLecturas,
      cliente.direccion,
      this.lecturas,
      this.observaciones
    ).subscribe({
      next: res => {
        this.urlPdf = res.urlPdf;
        this.pdfLink = res.urlPdf;

        setTimeout(() => {
          if (confirm('Reporte generado. ¿Abrir PDF?')) {
            window.open(this.urlPdf!, '_blank');
          }
          this.limpiarFormulario();
        }, 50);
      },
      error: err => {
        console.error(err);
        alert('❌ Ocurrió un error al generar el reporte.');
      }
    });

  } catch (e) {
    console.error(e);
    alert('❌ No se pudo guardar alguna firma.');
  }
}


  // ===================== LOGOUT =====================
  logout() {
    document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }

  // ===================== IMÁGENES =====================
onImagenesSeleccionadas(event: any) {
  const files = event.target.files as FileList;
  if (files && files.length) {
    this.imagenes = Array.from(files).slice(0, 10);
  }
}

onLecturasSeleccionadas(event: any) {
  const files = event.target.files as FileList;
  if (files && files.length) {
    this.imagenesLecturas = Array.from(files).slice(0, 10);
  }
}

  // ===================== VERIFICACIÓN =====================
  abrirVerificacion() {
    this.mostrarVerificacion = true;
  }

  cerrarVerificacion() {
    this.mostrarVerificacion = false;
  }

  aprobarVerificacion() {
    alert("Verificación aprobada");
    this.cerrarVerificacion();
  }

  // ===================== COPIAR ENLACE =====================
  copiarEnlace(elemento: HTMLInputElement) {
    navigator.clipboard.writeText(elemento.value)
      .then(() => alert("📋 Enlace copiado."))
      .catch(() => alert("❌ No se pudo copiar."));
  }

  // ===================== LIMPIAR FORMULARIO =====================
  limpiarFormulario() {
    this.imagenes = [];
    this.imagenesLecturas = [];
    this.descripcionTrabajo = '';
    this.lecturas = '';
    this.observaciones = '';
    this.actividadesSeleccionadas = [];
    this.trabajadoresSeleccionados = [];
    this.clientesSeleccionados = [];
    this.firmaFile = null;
    this.firmaSupervisorFile = null;
    this.firmaSupervisor = null;
  }
}
