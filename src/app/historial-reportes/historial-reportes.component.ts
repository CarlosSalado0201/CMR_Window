import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ServiciosService } from 'src/app/Servicios/servicios.service';

type HistorialItem = {
  tipoItem: 'REPORTE' | 'CARTA';
  id?: number;
  referencia?: string;
  usuario?: string;
  tipoCarta?: string;
  fechaCreacion?: string;
  urlPdf?: string;
};

type TabFiltro = 'TODOS' | 'REPORTES' | 'CARTAS';

@Component({
  selector: 'app-historial-reportes',
  templateUrl: './historial-reportes.component.html',
  styleUrls: ['./historial-reportes.component.css']
})
export class HistorialReportesComponent implements OnInit {

  // ===== Calendario =====
  currentYear: number = 0;
  currentMonth: number = 0;
  daysInMonth: number[] = [];

  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  monthNames: string[] = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  showMiniCalendar = false;

  // ===== Selección =====
  selectedDateISO: string = '';     // YYYY-MM-DD
  selectedDateLabel: string = '';   // DD/MM/YYYY

  // ===== Historial =====
  loading = false;
  errorMsg = '';

  tab: TabFiltro = 'TODOS';

  historial: HistorialItem[] = [];
  reportes: HistorialItem[] = [];
  cartas: HistorialItem[] = [];

  // ✅ Para pintar texto dentro del día (mapa por día)
  itemsPorDia: Record<string, HistorialItem[]> = {}; // key: YYYY-MM-DD

  // ✅ Modal / Panel del día
  showDayPanel = false;
  panelItems: HistorialItem[] = [];
  panelFechaLabel = '';

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.currentMonth = hoy.getMonth();
    this.currentYear = hoy.getFullYear();
    this.generateCalendar();

    // ✅ por defecto hoy
    this.selectDate(hoy.getDate(), false);
    this.precargarMes(); // ✅ esto llena los cuadritos con "Reporte 123"
  }

  // ============================
  // Calendario
  // ============================
  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.daysInMonth = [];
    for (let i = 0; i < firstDay; i++) this.daysInMonth.push(0);
    for (let i = 1; i <= totalDays; i++) this.daysInMonth.push(i);
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.generateCalendar();
    this.precargarMes(); // ✅ refrescar items del mes
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.generateCalendar();
    this.precargarMes(); // ✅ refrescar items del mes
  }

  prevYear() {
    this.currentYear--;
    this.generateCalendar();
    this.precargarMes();
  }

  nextYear() {
    this.currentYear++;
    this.generateCalendar();
    this.precargarMes();
  }

  toggleMiniCalendar() { this.showMiniCalendar = !this.showMiniCalendar; }

  selectMonth(monthIndex: number) {
    this.currentMonth = monthIndex;
    this.showMiniCalendar = false;
    this.generateCalendar();
    this.precargarMes();
  }

  // ============================
  // Selección de fecha
  // ============================
  selectDate(day: number, abrirPanel = true) {
    if (day === 0) return;

    const mm = String(this.currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    this.selectedDateISO = `${this.currentYear}-${mm}-${dd}`;
    this.selectedDateLabel = `${dd}/${mm}/${this.currentYear}`;

    // cargar historial solo para panel/lateral si quieres
    this.cargarHistorial(this.selectedDateISO, abrirPanel);
  }

  isSelectedDay(day: number): boolean {
    if (day === 0 || !this.selectedDateISO) return false;
    const dd = String(day).padStart(2, '0');
    const mm = String(this.currentMonth + 1).padStart(2, '0');
    return this.selectedDateISO === `${this.currentYear}-${mm}-${dd}`;
  }

  // ============================
  // ✅ Precargar mes completo para que se vean los textos dentro de cada día
  // ============================
  precargarMes() {
    this.itemsPorDia = {};

    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const requests = [];

    for (let day = 1; day <= totalDays; day++) {
      const mm = String(this.currentMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const fechaISO = `${this.currentYear}-${mm}-${dd}`;

      requests.push(
        forkJoin({
          reportes: this.serviciosService.obtenerHistorialReportesPorDia(fechaISO),
          cartas: this.serviciosService.obtenerHistorialCartasPorDia(fechaISO),
        })
      );
    }

    // ⚠️ Esto es pesado si tu mes tiene muuuchos días y muchos docs.
    // Si notas lento, lo optimizamos con un endpoint "historial-mes" en backend.
    // Por ahora funciona.
    let day = 1;

    // Procesar en cadena simple (sin saturar)
    const procesarDia = () => {
      if (day > totalDays) return;

      const mm = String(this.currentMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const fechaISO = `${this.currentYear}-${mm}-${dd}`;

      forkJoin({
        reportes: this.serviciosService.obtenerHistorialReportesPorDia(fechaISO),
        cartas: this.serviciosService.obtenerHistorialCartasPorDia(fechaISO),
      }).subscribe({
        next: ({ reportes, cartas }) => {
          const rep = (reportes || []).map((x: any) => ({
            tipoItem: 'REPORTE',
            id: x.id ?? x.idReporte ?? x.reporteId,
            referencia: x.referencia || (x.id ? `Reporte ${x.id}` : ''),
            usuario: x.usuario,
            fechaCreacion: x.fechaCreacion ?? x.fecha,
            urlPdf: x.urlPdf ?? x.url
          })) as HistorialItem[];

          const car = (cartas || []).map((x: any) => ({
            tipoItem: 'CARTA',
            id: x.id ?? x.idCarta ?? x.cartaId,
            referencia: x.referencia || (x.id ? `Carta ${x.id}` : ''),
            tipoCarta: x.tipo ?? x.tipoCarta,
            fechaCreacion: x.fechaCreacion ?? x.fecha,
            urlPdf: x.urlPdf ?? x.url
          })) as HistorialItem[];

          const items = [...rep, ...car].sort((a, b) => {
            const ta = this.parseDate(a.fechaCreacion);
            const tb = this.parseDate(b.fechaCreacion);
            return (tb ?? 0) - (ta ?? 0);
          });

          if (items.length > 0) {
            this.itemsPorDia[fechaISO] = items;
          }
          day++;
          procesarDia();
        },
        error: () => {
          // si falla un día, lo saltamos
          day++;
          procesarDia();
        }
      });
    };

    procesarDia();
  }

  // ============================
  // ✅ Cargar historial de un día (para el panel)
  // ============================
  cargarHistorial(fechaISO: string, abrirPanel: boolean) {
    this.loading = true;
    this.errorMsg = '';

    forkJoin({
      reportes: this.serviciosService.obtenerHistorialReportesPorDia(fechaISO),
      cartas: this.serviciosService.obtenerHistorialCartasPorDia(fechaISO)
    }).subscribe({
      next: ({ reportes, cartas }) => {

        this.reportes = (reportes || []).map((x: any) => ({
          tipoItem: 'REPORTE',
          id: x.id ?? x.idReporte ?? x.reporteId,
          referencia: x.referencia || (x.id ? `Reporte ${x.id}` : ''),
          usuario: x.usuario,
          fechaCreacion: x.fechaCreacion ?? x.fecha,
          urlPdf: x.urlPdf ?? x.url
        }));

        this.cartas = (cartas || []).map((x: any) => ({
          tipoItem: 'CARTA',
          id: x.id ?? x.idCarta ?? x.cartaId,
          referencia: x.referencia || (x.id ? `Carta ${x.id}` : ''),
          tipoCarta: x.tipo ?? x.tipoCarta,
          fechaCreacion: x.fechaCreacion ?? x.fecha,
          urlPdf: x.urlPdf ?? x.url
        }));

        this.historial = [...this.reportes, ...this.cartas].sort((a, b) => {
          const ta = this.parseDate(a.fechaCreacion);
          const tb = this.parseDate(b.fechaCreacion);
          return (tb ?? 0) - (ta ?? 0);
        });

        // ✅ cachea para mostrar dentro del cuadro
        if (this.historial.length > 0) this.itemsPorDia[fechaISO] = this.historial;
        else delete this.itemsPorDia[fechaISO];

        this.loading = false;

        if (abrirPanel) {
          this.abrirPanelDia(fechaISO, this.selectedDateLabel);
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;

        if (err?.status === 404) {
          this.errorMsg = 'El historial aún no está disponible en backend (404).';
          return;
        }
        if (err?.status === 401 || err?.status === 403) {
          this.errorMsg = 'No autenticado. Inicia sesión para ver el historial.';
          return;
        }
        this.errorMsg = 'Error al cargar historial.';
      }
    });
  }

  // ============================
  // ✅ Modal/panel
  // ============================
  abrirPanelDia(fechaISO: string, label: string) {
    this.panelFechaLabel = label;
    this.panelItems = this.itemsPorDia[fechaISO] || this.historial || [];
    this.showDayPanel = true;

    // bloquear scroll de fondo
    document.body.style.overflow = 'hidden';
  }

  cerrarPanel() {
    this.showDayPanel = false;
    this.panelItems = [];
    document.body.style.overflow = 'auto';
  }

  // ============================
  // Mostrar dentro del cuadro (máx 2)
  // ============================
  getItemsDelDia(day: number): HistorialItem[] {
    if (day === 0) return [];
    const mm = String(this.currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const fechaISO = `${this.currentYear}-${mm}-${dd}`;
    return this.itemsPorDia[fechaISO] || [];
  }

  // ============================
  // Acciones
  // ============================
  abrirPdf(item: HistorialItem) {
    if (!item.urlPdf) {
      alert('Este documento no tiene URL de PDF.');
      return;
    }
    window.open(item.urlPdf, '_blank');
  }

  copiarUrl(url?: string) {
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => alert('📋 Enlace copiado.'))
      .catch(() => alert('❌ No se pudo copiar.'));
  }

  trackByKey(index: number, item: HistorialItem) {
    return `${item.tipoItem}-${item.id ?? index}`;
  }

  private parseDate(v?: string): number | null {
    if (!v) return null;
    const t = Date.parse(v);
    if (!Number.isNaN(t)) return t;

    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(v);
    if (m) {
      const dd = Number(m[1]), mm = Number(m[2]) - 1, yyyy = Number(m[3]);
      return new Date(yyyy, mm, dd).getTime();
    }
    return null;
  }
}
