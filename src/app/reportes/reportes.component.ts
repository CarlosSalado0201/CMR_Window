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
  ubicacion: string = '';

  urlPdf: string | null = null;
  pdfLink: string = '';

  fechaInicio: string = '';
  fechaFin: string = '';

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
  tipoEquipo = '';

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

  idCarpeta: number | null = null;
  carpetaSeleccionada: string = 'Seleccionar carpeta';
  mostrarListaCarpetas: boolean = false;
  vistaActual: 'form' | 'verificacion' = 'form';

  mostrarVerificacion = false;
  verificado = false;

  carpetas: any[] = [];

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
    this.cargarCarpetas();
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

  async guardarFirma() {
    if (!this.canvas) {
      alert('⚠️ Canvas del encargado no está listo.');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      this.canvas.nativeElement.toBlob(blob => {
        if (blob) {
          this.firmaFile = new File([blob], 'firma.png', { type: 'image/png' });
          alert('✅ Firma del encargado guardada con éxito');
          this.verificado = !!this.firmaFile && !!this.firmaSupervisorFile;
          resolve();
        } else {
          alert('❌ Error al generar la firma del encargado.');
          reject('Error al generar la firma del encargado.');
        }
      });
    });
  }

  // ===================== FIRMA SUPERVISOR =====================
  async guardarFirmaSupervisor(): Promise<void> {
    if (!this.canvasSupervisor) {
      alert('⚠️ Canvas del supervisor no está listo.');
      return;
    }

    const canvas = this.canvasSupervisor.nativeElement;
    this.firmaSupervisor = canvas.toDataURL('image/png');

    return new Promise<void>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          this.firmaSupervisorFile = new File([blob], 'firma_supervisor.png', { type: 'image/png' });
          alert('✅ Firma del supervisor guardada con éxito');
          this.verificado = true;
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

    let clientX = 0;
    let clientY = 0;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

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

  // ===================== USUARIOS =====================
  obtenerUsuarioActual() {
    this.serviciosService.obtenerUsuarioActual().subscribe({
      next: (data: Usuario) => (this.usuarioActual = data),
      error: err => console.error(err)
    });
  }

  cargarUsuariosDisponibles() {
    this.serviciosService.obtenerUsuarios().subscribe({
      next: (data: any[]) => (this.usuariosDisponibles = data),
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
      next: (data: Cliente[]) => (this.clientesDisponibles = data),
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
      next: tipos => (this.tiposOperacion = tipos),
      error: err => console.error(err)
    });
  }

  cargarActividades() {
    if (!this.tipoOperacionSeleccionadaId) return;
    this.serviciosService.obtenerActividadesPorTipo(this.tipoOperacionSeleccionadaId).subscribe({
      next: data => (this.actividadesDisponibles = data || []),
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
      await this.guardarFirma();
      await this.guardarFirmaSupervisor();

      if (
        !this.descripcionTrabajo ||
        !this.usuarioActual ||
        !this.nombreSupervisor ||
        !this.firmaFile ||
        !this.firmaSupervisorFile
      ) {
        alert('⚠️ Complete todos los campos requeridos y firme correctamente.');
        return;
      }

      if (this.actividadesSeleccionadas.length === 0) {
        alert('⚠️ Debe seleccionar al menos una actividad.');
        return;
      }

      if (!this.fechaInicio) {
        alert('Debe seleccionar la fecha de inicio.');
        return;
      }

      if (!this.idCarpeta) {
        alert('⚠️ Seleccione una carpeta.');
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

      // ✅ CLAVE: enviar IDs, NO Cliente[]
      const clientesIds: number[] = (this.clientesSeleccionados || [])
        .map(c => c?.id)
        .filter((id): id is number => typeof id === 'number');

      if (clientesIds.length === 0) {
        alert('⚠️ Seleccione al menos un cliente.');
        return;
      }

      const actividadesIds = this.actividadesSeleccionadas.map(a => a.idActividad);

      // ===================== GENERAR REPORTE =====================
      this.serviciosService
        .generarReporte(
          encargado,
          trabajadores,
          clientesIds, // ✅ number[]
          this.descripcionTrabajo,
          this.tipoEquipo,
          this.imagenes,
          this.firmaFile,
          actividadesIds,
          this.nombreSupervisor,
          this.firmaSupervisorFile,
          this.imagenesLecturas,
          this.ubicacion,
          this.lecturas,
          this.observaciones,
          this.formatearFecha(this.fechaInicio),
          this.formatearFecha(this.fechaFin),
          this.idCarpeta
        )
        .subscribe({
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
    document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
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

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollBarWidth + 'px';
  }

  cerrarVerificacion() {
    this.mostrarVerificacion = false;
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0';
  }

  copiarEnlace(elemento: HTMLInputElement) {
    navigator.clipboard.writeText(elemento.value).catch(() => alert('❌ No se pudo copiar.'));
  }

  siguienteVerificacion() {
    if (!this.descripcionTrabajo || !this.ubicacion || !this.tipoEquipo) {
      alert('⚠️ Complete todos los campos requeridos antes de continuar.');
      return;
    }

    if (this.actividadesSeleccionadas.length === 0) {
      alert('⚠️ Debe seleccionar al menos una actividad.');
      return;
    }

    if (this.clientesSeleccionados.length === 0) {
      alert('⚠️ Seleccione al menos un cliente.');
      return;
    }

    if (!this.idCarpeta) {
      alert('⚠️ Seleccione una carpeta.');
      return;
    }

    this.vistaActual = 'verificacion';
  }

  volverFormulario() {
    this.vistaActual = 'form';
  }

  aprobarVerificacion() {
    if (!this.nombreSupervisor.trim() || !this.firmaSupervisorFile) {
      alert('⚠️ Debe ingresar el nombre del supervisor y firmar.');
      return;
    }

    this.verificado = true;
    alert('✅ Verificación aprobada. Ahora puede generar el PDF.');
  }

  get enVerificacion(): boolean {
    return this.vistaActual === 'verificacion';
  }

  // ===================== LIMPIAR FORMULARIO =====================
  limpiarFormulario() {
    this.ubicacion = '';
    this.tipoEquipo = '';
    this.descripcionTrabajo = '';
    this.lecturas = '';
    this.observaciones = '';
    this.nombreSupervisor = '';

    this.clientesSeleccionados = [];
    this.clientesSeleccionadosIds = [];

    this.trabajadoresSeleccionados = [];
    this.trabajadoresSeleccionadosIds = [];

    this.actividadesSeleccionadas = [];
    this.actividadesSeleccionadasIds = [];
    this.tipoOperacionSeleccionadaId = null;

    this.imagenes = [];
    this.imagenesLecturas = [];
    this.verificado = false;

    this.limpiarFirma();
    this.limpiarFirmaSupervisor();

    this.mostrarVerificacion = false;

    // opcional: reset carpeta
    // this.idCarpeta = null;
    // this.carpetaSeleccionada = 'Seleccionar carpeta';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [yyyy, mm, dd] = fecha.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  // ====== CARPETAS ======
  cargarCarpetas() {
    this.serviciosService.obtenerCarpetas().subscribe({
      next: data => (this.carpetas = data),
      error: () => console.error('Error al cargar carpetas')
    });
  }

  toggleCarpetas() {
    this.mostrarListaCarpetas = !this.mostrarListaCarpetas;
  }

  seleccionarCarpeta(carpeta: any) {
    this.idCarpeta = carpeta.idCarpeta;
    this.carpetaSeleccionada = carpeta.nombre;
    this.mostrarListaCarpetas = false;
  }
}
