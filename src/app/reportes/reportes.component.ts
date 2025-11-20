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

  // ===================== VARIABLES =====================
  urlPdf: string | null = null;

  // Firma encargado
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private dibujando = false;
  firmaFile: File | null = null;

  // Firma supervisor
  @ViewChild('canvasSupervisor', { static: false }) canvasSupervisor!: ElementRef<HTMLCanvasElement>;
  dibujandoSupervisor = false;
  firmaSupervisor: string | null = null;
  firmaSupervisorFile: File | null = null;

  // Formulario
  titulo = '';
  descripcionTrabajo = '';
  imagenes: File[] = [];
  lecturas = '';
  observaciones = '';
  autorizacion = '';
  nombreSupervisor = '';

  // Usuarios y clientes
  usuarioActual: Usuario | null = null;
  usuariosDisponibles: Usuario[] = [];
  trabajadoresSeleccionados: Usuario[] = [];
  trabajadoresSeleccionadosIds: number[] = [];
  clientesDisponibles: Cliente[] = [];
  clientesSeleccionados: Cliente[] = [];
  clientesSeleccionadosIds: number[] = [];

  // Actividades y operaciones
  tiposOperacion: any[] = [];
  tipoOperacionSeleccionadaId: number | null = null;
  actividadesDisponibles: any[] = [];
  actividadesSeleccionadas: any[] = [];
  actividadesSeleccionadasIds: number[] = [];

  // Verificación y control
  mostrarVerificacion = false;
  verificado = false;

  menuOpen = false;

  constructor(
    private serviciosService: ServiciosService,
    private auth: AuthService,
    private router: Router
  ) {}

  // ===================== CICLO DE VIDA =====================
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

  // ===================== MENU =====================
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
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

  guardarFirma(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.canvas.nativeElement.toBlob(blob => {
        if (blob) {
          this.firmaFile = new File([blob], 'firma.png', { type: 'image/png' });
          alert('✅ Firma guardada correctamente.');
          resolve();
        } else {
          alert('❌ No se pudo generar la firma.');
          reject('Error al generar la firma.');
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
    } else if ((event as TouchEvent).touches && (event as TouchEvent).touches.length > 0) {
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

  guardarFirmaSupervisor() {
    const canvas = this.canvasSupervisor.nativeElement;
    this.firmaSupervisor = canvas.toDataURL('image/png');
    canvas.toBlob(blob => {
      if (blob) this.firmaSupervisorFile = new File([blob], 'firma_supervisor.png', { type: 'image/png' });
      alert('✅ Firma del supervisor guardada correctamente.');
    }, 'image/png');
  }

  // ===================== USUARIO ACTUAL =====================
  obtenerUsuarioActual() {
    this.serviciosService.obtenerUsuarioActual().subscribe({
      next: (data: Usuario) => this.usuarioActual = data,
      error: err => console.error('Error al obtener usuario actual', err)
    });
  }

  // ===================== TRABAJADORES =====================
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

  // ===================== OPERACIONES Y ACTIVIDADES =====================
  cargarTiposOperacion() {
    this.serviciosService.obtenerTiposOperacion().subscribe({
      next: tipos => this.tiposOperacion = tipos,
      error: err => console.error('Error al cargar tipos de operación:', err)
    });
  }

  cargarActividades() {
    if (!this.tipoOperacionSeleccionadaId) return;
    this.serviciosService.obtenerActividadesPorTipo(this.tipoOperacionSeleccionadaId).subscribe({
      next: data => this.actividadesDisponibles = data || [],
      error: err => {
        console.error('Error al cargar actividades:', err);
        alert('❌ Error al conectar con el servidor.');
        this.actividadesDisponibles = [];
      }
    });
  }

  agregarActividadesSeleccionadas() {
    this.actividadesSeleccionadasIds.forEach(id => {
      const actividad = this.actividadesDisponibles.find(a => a.idActividad === id);
      if (actividad && !this.actividadesSeleccionadas.includes(actividad)) {
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
    if (!this.descripcionTrabajo || !this.usuarioActual || !this.nombreSupervisor || !this.firmaSupervisor) {
      alert('⚠️ Complete todos los campos requeridos antes de generar el reporte.');
      return;
    }

    const encargado = { nombre: this.usuarioActual.nombre, cargo: this.usuarioActual.cargo };
    const trabajadores = this.trabajadoresSeleccionados.map(t => ({ nombre: t.nombre, cargo: t.cargo }));
    const cliente = this.clientesSeleccionados[0];

    if (!cliente) { alert('⚠️ Seleccione al menos un cliente.'); return; }

    try {
      await this.guardarFirma();

      const actividadesIds = this.actividadesSeleccionadas.map(a => a.idActividad);

      this.serviciosService
        .generarReporte(encargado, trabajadores, cliente, this.descripcionTrabajo, this.imagenes, this.firmaFile, actividadesIds, this.nombreSupervisor, this.firmaSupervisorFile)
        .subscribe({
          next: res => {
            this.urlPdf = res.urlPdf;
            setTimeout(() => {
              if (confirm('✅ Reporte generado correctamente. ¿Desea abrir el PDF?')) {
                window.open(this.urlPdf!, '_blank');
              }
              this.limpiarFormulario();
            }, 0);
          },
          error: err => {
            console.error('Error al generar reporte:', err);
            alert('❌ Ocurrió un error al generar el reporte.');
          }
        });

    } catch (error) {
      alert('❌ No se pudo guardar la firma: ' + error);
    }
  }

  private limpiarFormulario() {
    this.titulo = '';
    this.descripcionTrabajo = '';
    this.limpiarFirma();
    this.clientesSeleccionados = [];
    this.trabajadoresSeleccionados = [];
    this.nombreSupervisor = '';
    this.actividadesSeleccionadas = [];
    this.verificado = false;
    this.firmaSupervisor = null;
    this.firmaSupervisorFile = null;
  }

  // ===================== VERIFICACIÓN =====================
  abrirVerificacion() { this.mostrarVerificacion = true; }
  cerrarVerificacion() { this.mostrarVerificacion = false; }

  aprobarVerificacion() {
    if (!this.nombreSupervisor || !this.firmaSupervisor) {
      alert('Por favor ingrese nombre y firma del supervisor.');
      return;
    }
    this.verificado = true;
    this.mostrarVerificacion = false;
    alert('✅ Verificación aprobada.');
  }

  // ===================== UTILIDADES =====================
  onImagenesSeleccionadas(event: any) { this.imagenes = Array.from(event.target.files); }

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
  imagenesLecturas: File[] = [];

onImagenesLecturas(event: any) {
  this.imagenesLecturas = Array.from(event.target.files);
}
aprobarVerificacion() {
  this.verificado = true;
  this.cerrarVerificacion();
}


}
