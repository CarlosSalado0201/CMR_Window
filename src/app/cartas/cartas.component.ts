import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServiciosService } from '../Servicios/servicios.service';
import { CartaPayload } from '../Models/ModalCartaComponent';

type TipoCarta = 'entrega' | 'garantia' | 'conjunto';
type RolFirma = 'entrega' | 'recibe';

@Component({
  selector: 'app-cartas',
  templateUrl: './cartas.component.html',
  styleUrls: ['./cartas.component.css']
})
export class CartasComponent implements AfterViewInit, OnDestroy {
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

  // para limpiar event listeners en destroy
  private unsubs: Array<() => void> = [];

  constructor(private serviciosService: ServiciosService) {}

  ngAfterViewInit(): void {
    // Los canvas solo existen cuando se muestra el formulario,
    // así que inicializamos en cada cambio de formulario también.
    // Pero si el template ya está visible al cargar, esto ayuda.
    this.tryInitCanvases();
  }

  ngOnDestroy(): void {
    this.unsubs.forEach(fn => fn());
    this.unsubs = [];
  }

  mostrarFormulario(tipo: TipoCarta) {
    this.formularioVisible = tipo;

    // Limpia respuestas
    this.respuesta1 = '';
    this.respuesta2 = '';
    this.respuesta3 = '';
    this.respuesta4 = '';

    // ✅ IMPORTANTE: esperar al render del DOM para que existan los canvas
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
  // Firmas: helpers
  // ===============================
  limpiarFirma(rol: RolFirma) {
    const canvas = rol === 'entrega' ? this.canvasEntregaRef?.nativeElement : this.canvasRecibeRef?.nativeElement;
    const ctx = rol === 'entrega' ? this.ctxEntrega : this.ctxRecibe;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // opcional: fondo blanco para que no salga transparente
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private firmaComoBase64(rol: RolFirma): string | null {
    const canvas = rol === 'entrega' ? this.canvasEntregaRef?.nativeElement : this.canvasRecibeRef?.nativeElement;
    if (!canvas) return null;

    // si está vacío (solo blanco), de todas formas manda; si quieres validar vacío, se puede comparar pixels
    return canvas.toDataURL('image/png'); // "data:image/png;base64,...."
  }

  private aplicarFirmas(payload: CartaPayload) {
    payload.quienEntrega = this.quienEntrega;
    payload.cargoEntrega = this.cargoEntrega;
    payload.quienRecibe  = this.quienRecibe;
    payload.cargoRecibe  = this.cargoRecibe;

    payload.firmaEntrega = this.firmaComoBase64('entrega');
    payload.firmaRecibe  = this.firmaComoBase64('recibe');
  }

  // ===============================
  // Canvas init + drawing
  // ===============================
  private tryInitCanvases() {
    // si el form no está visible, no hay canvas
    if (!this.formularioVisible) return;

    const cEnt = this.canvasEntregaRef?.nativeElement;
    const cRec = this.canvasRecibeRef?.nativeElement;
    if (!cEnt || !cRec) return;

    // limpiar listeners previos para no duplicar
    this.unsubs.forEach(fn => fn());
    this.unsubs = [];

    this.ctxEntrega = this.prepararCanvas(cEnt);
    this.ctxRecibe = this.prepararCanvas(cRec);

    this.hookDibujo(cEnt, 'entrega');
    this.hookDibujo(cRec, 'recibe');

    // blanco de inicio (para evitar PDF con transparencia)
    this.limpiarFirma('entrega');
    this.limpiarFirma('recibe');
  }

  private prepararCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Ajuste a tamaño real del elemento (HiDPI)
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // estilo del trazo
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';

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
        clientX = ev.clientX;
        clientY = ev.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const start = (ev: MouseEvent | TouchEvent) => {
      ev.preventDefault();
      const ctx = getCtx();
      const pos = getPos(ev);
      if (!ctx || !pos) return;

      setDibujando(true);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const move = (ev: MouseEvent | TouchEvent) => {
      if (!isDibujando()) return;
      ev.preventDefault();

      const ctx = getCtx();
      const pos = getPos(ev);
      if (!ctx || !pos) return;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const end = (ev: MouseEvent | TouchEvent) => {
      if (!isDibujando()) return;
      ev.preventDefault();
      setDibujando(false);
    };

    // Mouse
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    // Touch
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: false });

    // Guardar unsubscribers
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
    payload.idCarpeta = 2;
    this.aplicarFirmas(payload);

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
    const newTab = window.open('', '_blank');

    const payload: CartaPayload = { tipo, idCarpeta: 2 };
    this.aplicarFirmas(payload);

    if (tipo === 'entrega') {
      payload.preguntasEntrega = [
        'Por medio del presente se hace la entrega recepción de los trabajos realizado en:',
        'HACEMOS ENTREGA AL DEPARTAMENTO DE MANTENIMIENTO Y NOS RECIBEN EN CONFORMIDAD A LAS CONDICIONES ESTABLECIDAS POR AMBAS PARTES.'
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
        'HACEMOS ENTREGA AL DEPARTAMENTO DE MANTENIMIENTO Y NOS RECIBEN EN CONFORMIDAD A LAS CONDICIONES ESTABLECIDAS POR AMBAS PARTES.'
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
