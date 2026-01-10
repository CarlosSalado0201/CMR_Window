import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ServiciosService } from 'src/app/Servicios/servicios.service';

type HistorialItem = {
  tipoItem: 'REPORTE' | 'CARTA';
  id?: number;
  referencia?: string;
  usuario?: string;
  tipoCarta?: string;      // entrega/garantia/conjunto
  fechaCreacion?: string;  // ISO o texto
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
  selectedDay: number | null = null;

  // ===== Historial panel =====
  loading = false;
  errorMsg = '';
  tab: TabFiltro = 'TODOS';

  historial: HistorialItem[] = [];
  reportes: HistorialItem[] = [];
  cartas: HistorialItem[] = [];

  // ✅ Cache para pintar items dentro del calendario
  private cachePorDia = new Map<string, HistorialItem[]>();
  private requestsEnCurso = new Set<string>();

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.currentMonth = hoy.getMonth();
    this.currentYear = hoy.getFullYear();
    this.generateCalendar();

    // ✅ por defecto hoy
    this.selectDate(hoy.getDate());

    // ✅ precargar mes para mostrar texto en cuadritos
    this.prefetchMonth();
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
    this.prefetchMonth();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
    this.generateCalendar();
    this.prefetchMonth();
  }

  prevYear() { this.currentYear--; this.generateCalendar(); this.prefetchMonth(); }
  nextYear() { this.currentYear++; this.generateCalendar(); this.prefetchMonth(); }

  toggleMiniCalendar() { this.showMiniCalendar = !this.showMiniCalendar; }

  selectMonth(monthIndex: number) {
    this.currentMonth = monthIndex;
    this.showMiniCalendar = false;
    this.generateCalendar();
    this.prefetchMonth();
  }

  // ============================
  // Selección de fecha
  // ============================
  selectDate(day: number) {
    if (day === 0) return;

    this.selectedDay = day;

    const mm = String(this.currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    this.selectedDateISO = `${this.currentYear}-${mm}-${dd}`;
    this.selectedDateLabel = `${dd}/${mm}/${this.currentYear}`;

    // ✅ si ya está cacheado, úsalo directo
    const cached = this.cachePorDia.get(this.selectedDateISO);
    if (cached) {
      this.setHistorialDesdeItems(cached);
      return;
    }

    // ✅ si no, lo carga
    this.cargarHistorial(this.selectedDateISO);
  }

  isSelectedDay(day: number): boolean {
    return day !== 0 && this.selectedDay === day;
  }

  // ============================
  // ✅ Cargar Reportes + Cartas y combinar
  // ============================
  cargarHistorial(fechaISO: string) {
    this.loading = true;
    this.errorMsg = '';

    this.historial = [];
    this.reportes = [];
    this.cartas = [];

    forkJoin({
      reportes: this.serviciosService.obtenerHistorialReportesPorDia(fechaISO).pipe(
        catchError(() => of([]))
      ),
      cartas: this.serviciosService.obtenerHistorialCartasPorDia(fechaISO).pipe(
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ reportes, cartas }) => {

        this.reportes = (reportes || []).map((x: any) => ({
          tipoItem: 'REPORTE',
          id: x.id ?? x.idReporte ?? x.reporteId,
          referencia: x.referencia,
          usuario: x.usuario,
          fechaCreacion: x.fechaCreacion ?? x.fecha,
          urlPdf: x.urlPdf ?? x.url
        }));

        this.cartas = (cartas || []).map((x: any) => ({
          tipoItem: 'CARTA',
          id: x.id ?? x.idCarta ?? x.cartaId,
          referencia: x.referencia,
          tipoCarta: x.tipo ?? x.tipoCarta,
          fechaCreacion: x.fechaCreacion ?? x.fecha,
          urlPdf: x.urlPdf ?? x.url
        }));

        // ✅ Combinar
        this.historial = [...this.reportes, ...this.cartas];

        // ✅ Ordenar por fechaCreacion desc si existe
        this.historial.sort((a, b) => {
          const ta = this.parseDate(a.fechaCreacion);
          const tb = this.parseDate(b.fechaCreacion);
          return (tb ?? 0) - (ta ?? 0);
        });

        // ✅ guardar en cache para pintar en el cuadro
        this.cachePorDia.set(fechaISO, this.historial);

        // ✅ si no hay nada, no es “error”, solo vacío
        if (this.historial.length === 0) this.errorMsg = '';
      },
      error: (err) => {
        console.error(err);
        if (err?.status === 401 || err?.status === 403) {
          this.errorMsg = 'No autenticado. Inicia sesión para ver el historial.';
          return;
        }
        this.errorMsg = 'Error al cargar historial.';
      }
    });
  }

  private setHistorialDesdeItems(items: HistorialItem[]) {
    this.historial = items;
    this.reportes = items.filter(x => x.tipoItem === 'REPORTE');
    this.cartas = items.filter(x => x.tipoItem === 'CARTA');
  }

  // ============================
  // ✅ Prefetch del mes (para mostrar texto en los cuadritos)
  // ============================
  private prefetchMonth() {
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const iso = this.toISO(this.currentYear, this.currentMonth, d);

      if (this.cachePorDia.has(iso) || this.requestsEnCurso.has(iso)) continue;

      this.requestsEnCurso.add(iso);

      forkJoin({
        reportes: this.serviciosService.obtenerHistorialReportesPorDia(iso).pipe(catchError(() => of([]))),
        cartas: this.serviciosService.obtenerHistorialCartasPorDia(iso).pipe(catchError(() => of([]))),
      }).pipe(
        finalize(() => this.requestsEnCurso.delete(iso))
      ).subscribe(({ reportes, cartas }) => {

        const rep = (reportes || []).map((x: any) => ({
          tipoItem: 'REPORTE' as const,
          id: x.id ?? x.idReporte ?? x.reporteId,
          referencia: x.referencia,
          usuario: x.usuario,
          fechaCreacion: x.fechaCreacion ?? x.fecha,
          urlPdf: x.urlPdf ?? x.url
        }));

        const car = (cartas || []).map((x: any) => ({
          tipoItem: 'CARTA' as const,
          id: x.id ?? x.idCarta ?? x.cartaId,
          referencia: x.referencia,
          tipoCarta: x.tipo ?? x.tipoCarta,
          fechaCreacion: x.fechaCreacion ?? x.fecha,
          urlPdf: x.urlPdf ?? x.url
        }));

        const items = [...rep, ...car].sort((a, b) => {
          const ta = this.parseDate(a.fechaCreacion);
          const tb = this.parseDate(b.fechaCreacion);
          return (tb ?? 0) - (ta ?? 0);
        });

        this.cachePorDia.set(iso, items);
      });
    }
  }

  // ============================
  // ✅ Helpers para pintar en cuadrito
  // ============================
  getItemsForDay(day: number): HistorialItem[] {
    if (day === 0) return [];
    const iso = this.toISO(this.currentYear, this.currentMonth, day);
    return this.cachePorDia.get(iso) || [];
  }

  getItemsPreview(day: number): HistorialItem[] {
    return this.getItemsForDay(day).slice(0, 2);
  }

  getMoreCount(day: number): number {
    const total = this.getItemsForDay(day).length;
    return total > 2 ? total - 2 : 0;
  }

  // ============================
  // Tabs / filtros
  // ============================
  setTab(t: TabFiltro) { this.tab = t; }

  get itemsFiltrados(): HistorialItem[] {
    if (this.tab === 'REPORTES') return this.reportes;
    if (this.tab === 'CARTAS') return this.cartas;
    return this.historial;
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

  // ============================
  // Fecha helpers
  // ============================
  private toISO(year: number, monthIndex0: number, day: number): string {
    const mm = String(monthIndex0 + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  private parseDate(v?: string): number | null {
    if (!v) return null;
    const t = Date.parse(v);
    if (!Number.isNaN(t)) return t;

    // fallback: dd/MM/yyyy
    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(v);
    if (m) {
      const dd = Number(m[1]), mm = Number(m[2]) - 1, yyyy = Number(m[3]);
      return new Date(yyyy, mm, dd).getTime();
    }
    return null;
  }
}
