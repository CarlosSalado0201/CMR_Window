// ============================================
// historial-reportes.component.ts (FRONT COMPLETO)
// - Une historial de REPORTES + CARTAS por día
// - Soporta MUCHOS CLIENTES por item (clientesIds, clientesNombres)
// - Soporta muchos usuarios (usuario viene en reportes)
// - Normaliza fechas raras (array [yyyy,mm,dd,hh,mm,ss,nanos]) a ISO
// - ✅ FALLBACK: si backend NO manda clientesNombres, se resuelve por ID (api/clientes)
// ============================================
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ServiciosService } from 'src/app/Servicios/servicios.service';

type HistorialItem = {
  tipoItem: 'REPORTE' | 'CARTA';
  id?: number;
  referencia?: string;

  // REPORTES
  usuario?: string;

  // CARTAS
  tipoCarta?: string;

  // FECHA / URL
  fechaCreacion?: string;
  urlPdf?: string;

  // ✅ VARIOS CLIENTES
  clientesIds?: number[];
  clientesNombres?: string[];
};

type TabFiltro = 'TODOS' | 'REPORTES' | 'CARTAS';

@Component({
  selector: 'app-historial-reportes',
  templateUrl: './historial-reportes.component.html',
  styleUrls: ['./historial-reportes.component.css']
})
export class HistorialReportesComponent implements OnInit {

  currentYear = 0;
  currentMonth = 0;
  daysInMonth: number[] = [];

  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  monthNames: string[] = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  showMiniCalendar = false;

  selectedDateISO = '';
  selectedDateLabel = '';

  loading = false;
  errorMsg = '';

  tab: TabFiltro = 'TODOS';

  historial: HistorialItem[] = [];
  reportes: HistorialItem[] = [];
  cartas: HistorialItem[] = [];

  // Mapa de items precargados por día
  itemsPorDia: Record<string, HistorialItem[]> = {};

  // Panel día
  showDayPanel = false;
  panelItems: HistorialItem[] = [];
  panelFechaLabel = '';

  // ✅ Mapa idCliente -> nombre (para fallback)
  private clientesMap: Record<number, string> = {};

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    // ✅ Cargar mapa de clientes para resolver nombres si backend no los manda
    this.cargarMapaClientes();

    const hoy = new Date();
    this.currentMonth = hoy.getMonth();
    this.currentYear = hoy.getFullYear();
    this.generateCalendar();

    this.selectDate(hoy.getDate(), false);
    this.precargarMes();
  }

  // ==========================
  // ✅ Clientes map (fallback)
  // ==========================
  private cargarMapaClientes() {
    // Debe existir serviciosService.obtenerClientes()
    this.serviciosService.obtenerClientes().subscribe({
      next: (clientes: any[]) => {
        const map: Record<number, string> = {};
        (clientes || []).forEach(c => {
          if (typeof c?.id === 'number') {
            const nombre = String(c?.nombre ?? '').trim();
            if (nombre) map[c.id] = nombre;
          }
        });
        this.clientesMap = map;
      },
      error: () => {
        this.clientesMap = {};
      }
    });
  }

  private nombresDesdeIds(ids: number[]): string[] {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    return ids
      .map(id => this.clientesMap[id])
      .filter(n => typeof n === 'string' && n.trim().length > 0);
  }

  // ==========================
  // Calendar helpers
  // ==========================
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
    this.precargarMes();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.generateCalendar();
    this.precargarMes();
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

  selectDate(day: number, abrirPanel = true) {
    if (day === 0) return;

    const mm = String(this.currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    this.selectedDateISO = `${this.currentYear}-${mm}-${dd}`;
    this.selectedDateLabel = `${dd}/${mm}/${this.currentYear}`;

    this.cargarHistorial(this.selectedDateISO, abrirPanel);
  }

  isSelectedDay(day: number): boolean {
    if (day === 0 || !this.selectedDateISO) return false;
    const dd = String(day).padStart(2, '0');
    const mm = String(this.currentMonth + 1).padStart(2, '0');
    return this.selectedDateISO === `${this.currentYear}-${mm}-${dd}`;
  }

  // ==========================
  // ✅ Precargar mes (marcar días con docs)
  // ==========================
  precargarMes() {
    this.itemsPorDia = {};

    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    let day = 1;

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
          const rep = (reportes || []).map((x: any) => this.mapReporte(x)) as HistorialItem[];
          const car = (cartas || []).map((x: any) => this.mapCarta(x)) as HistorialItem[];

          const items = [...rep, ...car].sort((a, b) => {
            const ta = this.parseDate(a.fechaCreacion);
            const tb = this.parseDate(b.fechaCreacion);
            return (tb ?? 0) - (ta ?? 0);
          });

          if (items.length > 0) this.itemsPorDia[fechaISO] = items;
          else delete this.itemsPorDia[fechaISO];

          day++;
          procesarDia();
        },
        error: () => { day++; procesarDia(); }
      });
    };

    procesarDia();
  }

  // ==========================
  // ✅ Cargar historial de un día (panel)
  // ==========================
  cargarHistorial(fechaISO: string, abrirPanel: boolean) {
    this.loading = true;
    this.errorMsg = '';

    forkJoin({
      reportes: this.serviciosService.obtenerHistorialReportesPorDia(fechaISO),
      cartas: this.serviciosService.obtenerHistorialCartasPorDia(fechaISO)
    }).subscribe({
      next: ({ reportes, cartas }) => {
        this.reportes = (reportes || []).map((x: any) => this.mapReporte(x));
        this.cartas = (cartas || []).map((x: any) => this.mapCarta(x));

        this.historial = [...this.reportes, ...this.cartas].sort((a, b) => {
          const ta = this.parseDate(a.fechaCreacion);
          const tb = this.parseDate(b.fechaCreacion);
          return (tb ?? 0) - (ta ?? 0);
        });

        if (this.historial.length > 0) this.itemsPorDia[fechaISO] = this.historial;
        else delete this.itemsPorDia[fechaISO];

        this.loading = false;
        if (abrirPanel) this.abrirPanelDia(fechaISO, this.selectedDateLabel);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;

        if (err?.status === 404) { this.errorMsg = 'El historial aún no está disponible en backend (404).'; return; }
        if (err?.status === 401 || err?.status === 403) { this.errorMsg = 'No autenticado. Inicia sesión para ver el historial.'; return; }
        this.errorMsg = 'Error al cargar historial.';
      }
    });
  }

  // ==========================
  // ✅ Mappers (con fallback por ID)
  // ==========================
  private mapReporte(x: any): HistorialItem {
    const ids = Array.isArray(x?.clientesIds) ? x.clientesIds : [];
    const nombresBackend = Array.isArray(x?.clientesNombres) ? x.clientesNombres : [];

    // ✅ fallback si backend no manda nombres
    const nombres = nombresBackend.length ? nombresBackend : this.nombresDesdeIds(ids);

    return {
      tipoItem: 'REPORTE',
      id: x.id ?? x.idReporte ?? x.reporteId,
      referencia: x.referencia || (x.id ? `Reporte ${x.id}` : ''),
      usuario: x.usuario,
      fechaCreacion: this.normalizarFecha(x.fechaCreacion ?? x.fecha),
      urlPdf: x.urlPdf ?? x.url,
      clientesIds: ids,
      clientesNombres: nombres,
    };
  }

  private mapCarta(x: any): HistorialItem {
    const ids = Array.isArray(x?.clientesIds) ? x.clientesIds : [];
    const nombresBackend = Array.isArray(x?.clientesNombres) ? x.clientesNombres : [];

    const nombres = nombresBackend.length ? nombresBackend : this.nombresDesdeIds(ids);

    return {
      tipoItem: 'CARTA',
      id: x.id ?? x.idCarta ?? x.cartaId,
      referencia: x.referencia || (x.id ? `Carta ${x.id}` : ''),
      tipoCarta: x.tipo ?? x.tipoCarta,
      fechaCreacion: this.normalizarFecha(x.fechaCreacion ?? x.fecha),
      urlPdf: x.urlPdf ?? x.url,
      clientesIds: ids,
      clientesNombres: nombres,
    };
  }

  // ==========================
  // Panel UI
  // ==========================
  abrirPanelDia(fechaISO: string, label: string) {
    this.panelFechaLabel = label;

    const base = this.itemsPorDia[fechaISO] || this.historial || [];
    this.panelItems = this.aplicarFiltroTab(base);

    this.showDayPanel = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarPanel() {
    this.showDayPanel = false;
    this.panelItems = [];
    document.body.style.overflow = 'auto';
  }

  onTabChange(next: TabFiltro) {
    this.tab = next;

    if (this.showDayPanel && this.selectedDateISO) {
      const base = this.itemsPorDia[this.selectedDateISO] || this.historial || [];
      this.panelItems = this.aplicarFiltroTab(base);
    }
  }

  private aplicarFiltroTab(items: HistorialItem[]): HistorialItem[] {
    if (this.tab === 'TODOS') return items;
    if (this.tab === 'REPORTES') return (items || []).filter(i => i.tipoItem === 'REPORTE');
    return (items || []).filter(i => i.tipoItem === 'CARTA');
  }

  getItemsDelDia(day: number): HistorialItem[] {
    if (day === 0) return [];
    const mm = String(this.currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const fechaISO = `${this.currentYear}-${mm}-${dd}`;
    return this.itemsPorDia[fechaISO] || [];
  }

  abrirPdf(item: HistorialItem) {
    if (!item.urlPdf) { alert('Este documento no tiene URL de PDF.'); return; }
    window.open(item.urlPdf, '_blank');
  }

  copiarUrl(url?: string) {
    if (!url) return;
    navigator.clipboard.writeText(url)
      .then(() => alert('Enlace copiado.'))
      .catch(() => alert('No se pudo copiar.'));
  }

  trackByKey(index: number, item: HistorialItem) {
    return `${item.tipoItem}-${item.id ?? index}`;
  }

  // ✅ Mostrar clientes en UI (con fallback adicional)
  formatClientes(item: HistorialItem): string {
    const n = item?.clientesNombres ?? [];
    if (n.length) return n.join(', ');

    const ids = item?.clientesIds ?? [];
    const fallback = this.nombresDesdeIds(ids);
    return fallback.length ? fallback.join(', ') : '';
  }

  // ✅ Conteo por usuario (reportes)
  getConteoReportesPorUsuario(items: HistorialItem[]): Record<string, number> {
    const map: Record<string, number> = {};
    (items || [])
      .filter(i => i.tipoItem === 'REPORTE')
      .forEach(i => {
        const u = (i.usuario || 'SIN_USUARIO').trim();
        map[u] = (map[u] || 0) + 1;
      });
    return map;
  }

  // ==========================
  // Fechas: soporta string ISO / dd/mm/yyyy / array [yyyy,mm,dd,hh,mm,ss,nanos]
  // ==========================
  private normalizarFecha(v: any): string | undefined {
    if (v == null) return undefined;
    if (typeof v === 'string') return v;

    if (Array.isArray(v) && v.length >= 3) {
      const [yyyy, m, dd, hh = 0, mm = 0, ss = 0] = v;
      const month = Number(m) - 1;
      const d = new Date(Number(yyyy), month, Number(dd), Number(hh), Number(mm), Number(ss));
      return d.toISOString();
    }

    return String(v);
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
