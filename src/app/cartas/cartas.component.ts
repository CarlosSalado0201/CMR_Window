import {
  Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, OnInit
} from '@angular/core';
import { ServiciosService } from '../Servicios/servicios.service';
import { CartaPayload } from '../Models/ModalCartaComponent';
import { Cliente } from '../Models/Cliente';

// ✅ Si ya tienes un modelo Usuario, úsalo:
// import { Usuario } from '../Models/Usuario';
type Usuario = { nombre: string; cargo: string };

type TipoCarta = 'entrega' | 'garantia' | 'conjunto';
type RolFirma = 'entrega' | 'recibe';

@Component({
  selector: 'app-cartas',
  templateUrl: './cartas.component.html',
  styleUrls: ['./cartas.component.css']
})
export class CartasComponent implements OnInit, AfterViewInit, OnDestroy {

  formularioVisible: TipoCarta | null = null;

  respuesta1 = '';
  respuesta2 = '';
  respuesta3 = '';
  respuesta4 = '';

  // ✅ quién entrega / quién recibe
  quienEntrega = '';
  cargoEntrega = '';
  quienRecibe = '';
  cargoRecibe = '';

  // ✅ usuario actual
  usuarioActual: Usuario | null = null;

  // ✅ clientes
  clientesDisponibles: Cliente[] = [];
  clientesSeleccionados: Cliente[] = [];
  clientesSeleccionadosIds: number[] = [];

  // Modal
  mostrarModal = false;

  // ✅ SIEMPRE carpeta "Cartas" (id = 2)
  idCarpetaSeleccionada = 2;

  // ✅ Para mostrar el panel de "Último PDF"
  urlPdf: string | null = null;

  // ✅ canvases de firma
  @ViewChild('canvasEntrega', { static: false }) canvasEntregaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasRecibe', { static: false }) canvasRecibeRef!: ElementRef<HTMLCanvasElement>;

  private ctxEntrega: CanvasRenderingContext2D | null = null;
  private ctxRecibe: CanvasRenderingContext2D | null = null;

  private dibujandoEntrega = false;
  private dibujandoRecibe = false;

  private unsubs: Array<() => void> = [];

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    // ✅ cargar clientes desde que entra a la pantalla
    this.cargarClientes();

    // ✅ cargar usuario actual (para autollenar quien entrega)
    this.obtenerUsuarioActual();
  }

  ngAfterViewInit(): void {
    this.tryInitCanvases();
  }

  ngOnDestroy(): void {
    this.unsubs.forEach(fn => fn());
    this.unsubs = [];
  }

  // ===============================
  // ✅ Usuario actual
  // ===============================
  obtenerUsuarioActual() {
    this.serviciosService.obtenerUsuarioActual().subscribe({
      next: (data: Usuario) => {
        this.usuarioActual = data;

        // ✅ autollenar quien entrega
        this.quienEntrega = data?.nombre ?? '';
        this.cargoEntrega = data?.cargo ?? '';
      },
      error: err => console.error('Error obtenerUsuarioActual:', err)
    });
  }

  private reponeQuienEntregaDesdeUsuario() {
    if (!this.usuarioActual) return;
    this.quienEntrega = this.usuarioActual.nombre ?? '';
    this.cargoEntrega = this.usuarioActual.cargo ?? '';
  }

  mostrarFormulario(tipo: TipoCarta) {
    this.formularioVisible = tipo;

    // Limpia respuestas
    this.respuesta1 = '';
    this.respuesta2 = '';
    this.respuesta3 = '';
    this.respuesta4 = '';

    // ✅ cada vez que abras formulario, repone el "quien entrega"
    this.reponeQuienEntregaDesdeUsuario();

    // ✅ Asegurar que clientes estén cargados
    if (!this.clientesDisponibles || this.clientesDisponibles.length === 0) {
      this.cargarClientes();
    }

    // ✅ esperar al render del DOM para canvas
    setTimeout(() => this.tryInitCanvases(), 0);
  }

  // ===============================
  // PDF: abrir y guardar URL
  // ===============================
  private abrirPdf(urlPdf: string | null, newTab?: Window | null) {
    const url = (urlPdf ?? '').trim().replace(/^"|"$/g, '');
    console.log('URL PDF backend:', url);

    this.urlPdf = url || null;

    if (!url) {
      console.error('Backend regresó URL vacío o null');
      if (newTab) newTab.close();
      return;
    }

    if (newTab) newTab.location.href = url;
    else window.open(url, '_blank');
  }

  copiarEnlace(input: HTMLInputElement) {
    const texto = (input.value ?? '').trim();
    if (!texto) return;

    navigator.clipboard.writeText(texto)
      .then(() => alert('✅ Enlace copiado'))
      .catch(() => {
        input.select();
        document.execCommand('copy');
        alert('✅ Enlace copiado');
      });
  }

  // ===============================
  // CLIENTES
  // ===============================
  cargarClientes() {
    this.serviciosService.obtenerClientes().subscribe({
      next: (data: Cliente[]) => this.clientesDisponibles = data ?? [],
      error: err => console.error('Error cargarClientes:', err)
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

  private validarClientes(): boolean {
    if (!this.clientesSeleccionados || this.clientesSeleccionados.length === 0) {
      alert('⚠️ Selecciona al menos un cliente');
      return false;
    }
    return true;
  }

  private aplicarClientes(payload: CartaPayload) {
    payload.clientesIds = (this.clientesSeleccionados || []).map(c => c.id);
  }

  // ===============================
  // Firmas: helpers
  // ===============================
limpiarFirma(rol: RolFirma) {
  const canvas = rol === 'entrega'
    ? this.canvasEntregaRef?.nativeElement
    : this.canvasRecibeRef?.nativeElement;

  const ctx = rol === 'entrega' ? this.ctxEntrega : this.ctxRecibe;
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Reaplica el transform correcto
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Limpieza en CSS pixels (porque hay transform)
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';
}


  // ✅ devuelve SOLO base64 (sin "data:image/png;base64,")
  private firmaComoBase64(rol: RolFirma): string | null {
    const canvas = rol === 'entrega'
      ? this.canvasEntregaRef?.nativeElement
      : this.canvasRecibeRef?.nativeElement;

    if (!canvas) return null;

    const dataUrl = canvas.toDataURL('image/png');
    const parts = dataUrl.split(',');
    return parts.length === 2 ? parts[1] : null;
  }

  private aplicarFirmas(payload: CartaPayload) {
    payload.quienEntrega = this.quienEntrega?.trim();
    payload.cargoEntrega = this.cargoEntrega?.trim();
    payload.quienRecibe  = this.quienRecibe?.trim();
    payload.cargoRecibe  = this.cargoRecibe?.trim();

    payload.firmaEntrega = this.firmaComoBase64('entrega');
    payload.firmaRecibe  = this.firmaComoBase64('recibe');
  }

  // ===============================
  // Canvas init + drawing
  // ===============================
  private tryInitCanvases() {
    if (!this.formularioVisible) return;

    const cEnt = this.canvasEntregaRef?.nativeElement;
    const cRec = this.canvasRecibeRef?.nativeElement;
    if (!cEnt || !cRec) return;

    // limpiar listeners previos
    this.unsubs.forEach(fn => fn());
    this.unsubs = [];

    this.ctxEntrega = this.prepararCanvas(cEnt);
    this.ctxRecibe = this.prepararCanvas(cRec);

    this.hookDibujo(cEnt, 'entrega');
    this.hookDibujo(cRec, 'recibe');

    this.limpiarFirma('entrega');
    this.limpiarFirma('recibe');
  }
private prepararCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Tamaño real (pixeles internos)
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  // Para dibujar usando coordenadas CSS (no internas)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Estilo de trazogetPos 
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000';

  // Fondo blanco (para que en PDF no salga transparente)
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, rect.width, rect.height);

  return ctx;
}


  private hookDibujo(canvas: HTMLCanvasElement, rol: RolFirma) {
    const getCtx = () => rol === 'entrega' ? this.ctxEntrega : this.ctxRecibe;

    const setDibujando = (v: boolean) => {
      if (rol === 'entrega') this.dibujandoEntrega = v;
      else this.dibujandoRecibe = v;
    };

    const isDibujando = () => rol === 'entrega' ? this.dibujandoEntrega : this.dibujandoRecibe;
const getPos = (ev: MouseEvent | TouchEvent) => {
  const rect = canvas.getBoundingClientRect();

  let clientX = 0;
  let clientY = 0;

  if (ev instanceof TouchEvent) {
    const t = ev.touches[0] || ev.changedTouches[0];
    if (!t) return null;
    clientX = t.clientX;
    clientY = t.clientY;
  } else {
    clientX = (ev as MouseEvent).clientX;
    clientY = (ev as MouseEvent).clientY;
  }

  // Coordenadas en CSS pixels
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  return { x, y };
};


    const start = (ev: any) => {
      ev.preventDefault();
      const ctx = getCtx();
      const pos = getPos(ev);
      if (!ctx || !pos) return;

      setDibujando(true);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const move = (ev: any) => {
      if (!isDibujando()) return;
      ev.preventDefault();

      const ctx = getCtx();
      const pos = getPos(ev);
      if (!ctx || !pos) return;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const end = (ev: any) => {
      if (!isDibujando()) return;
      ev.preventDefault();
      setDibujando(false);
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: false });

    this.unsubs.push(() => canvas.removeEventListener('mousedown', start));
    this.unsubs.push(() => canvas.removeEventListener('mousemove', move));
    this.unsubs.push(() => window.removeEventListener('mouseup', end));

    this.unsubs.push(() => canvas.removeEventListener('touchstart', start as any));
    this.unsubs.push(() => canvas.removeEventListener('touchmove', move as any));
    this.unsubs.push(() => window.removeEventListener('touchend', end as any));
  }

  // ===============================
  // Generar carta
  // ===============================
  onGenerarCarta(payload: CartaPayload) {
    if (!this.validarClientes()) return;

    payload.idCarpeta = 2;

    this.aplicarFirmas(payload);
    this.aplicarClientes(payload);

    const newTab = window.open('', '_blank');

    this.serviciosService.generarCarta(payload).subscribe({
      next: (urlPdf) => this.abrirPdf(urlPdf, newTab),
      error: (err) => {
        console.error('Error al generar carta:', err);
        if (newTab) newTab.close();
      }
    });

    this.mostrarModal = false;
  }

  guardar(tipo: TipoCarta) {
    if (!this.validarClientes()) return;

    // ✅ por seguridad, repone quien entrega antes de enviar
    this.reponeQuienEntregaDesdeUsuario();

    const newTab = window.open('', '_blank');
    const payload: CartaPayload = { tipo, idCarpeta: 2 };

    this.aplicarFirmas(payload);
    this.aplicarClientes(payload);

    if (tipo === 'entrega') {
      payload.preguntasEntrega = [
        'Por medio del presente se hace la entrega recepción de los trabajos realizado en:',
        'Hacemos entrega al departamento de mantenimiento y nos reciben en conformidad a las condiciones establecidas por ambas partes.'
      ];
      payload.respuestasEntrega = [this.respuesta1, this.respuesta2];

    } else if (tipo === 'garantia') {
      payload.preguntasGarantia = [
        'Por medio del presente hacemos constar que se realizó según el presupuesto',
        'Tendrán una garantía de 1 año, a partir del término del trabajo así mismo queda de manifiesto que los equipos deben tener su servicio de mantenimiento ya que es de vital importancia para que la garantía sea válida y solo en caso de que sufra impactos ajenos al trabajo realizado queda invalidada la garantía. En partes eléctricas no hay garantía.'
      ];
      payload.respuestasGarantia = [this.respuesta1, this.respuesta2];

    } else if (tipo === 'conjunto') {
      payload.preguntasEntrega = [
        'Por medio del presente se hace la entrega recepción de los trabajos realizado en:',
        'Hacemos entrega al departamento de mantenimiento y nos reciben en conformidad a las condiciones establecidas por ambas partes.'
      ];
      payload.respuestasEntrega = [this.respuesta1, this.respuesta2];

      payload.preguntasGarantia = [
        'Por medio del presente hacemos constar que se realizó según el presupuesto',
        'Tendrán una garantía de 1 año, a partir del término del trabajo así mismo queda de manifiesto que los equipos deben tener su servicio de mantenimiento ya que es de vital importancia para que la garantía sea válida y solo en caso de que sufra impactos ajenos al trabajo realizado queda invalidada la garantía. En partes eléctricas no hay garantía.'
      ];
      payload.respuestasGarantia = [this.respuesta3, this.respuesta4];
    }

    this.serviciosService.generarCarta(payload).subscribe({
      next: (urlPdf) => this.abrirPdf(urlPdf, newTab),
      error: (err) => {
        console.error('Error al generar carta:', err);
        if (newTab) newTab.close();
      }
    });

    this.formularioVisible = null;
  }

  logout() {
    document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  }
}
