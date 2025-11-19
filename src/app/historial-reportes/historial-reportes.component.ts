import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-historial-reportes',
  templateUrl: './historial-reportes.component.html',
  styleUrls: ['./historial-reportes.component.css']
})
export class HistorialReportesComponent implements OnInit {

  currentYear: number = 0;
  currentMonth: number = 0; // 0 = Enero
  daysInMonth: number[] = [];

  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  monthNames: string[] = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  // ===============================================================
  // 🔹 Reportes mock — NO se usarán por ahora, solo placeholder
  // ===============================================================
  private reportesMock: Record<string, boolean> = {};

  ngOnInit(): void {
    const hoy = new Date();
    this.currentMonth = hoy.getMonth();
    this.currentYear = hoy.getFullYear();
    this.generateCalendar();
  }

  // ============================
  // Generar calendario
  // ============================
  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    this.daysInMonth = [];

    // Espacios vacíos antes del día 1
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(0);
    }

    // Días reales
    for (let i = 1; i <= totalDays; i++) {
      this.daysInMonth.push(i);
    }
  }

  prevMonth() {
    this.currentMonth--;

    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    this.generateCalendar();
  }

  // ============================
  // Seleccionar fecha (solo consola)
  // ============================
  selectDate(day: number) {
    if (day === 0) return;
    const fullDate = `${this.currentYear}-${this.currentMonth + 1}-${day}`;
    console.log("Fecha seleccionada:", fullDate);
  }

  // ============================
  // Placeholder por si luego hay reportes
  // ============================
  hasReports(day: number): boolean {
    return false; // Por ahora siempre falso
  }
showMiniCalendar = false;

toggleMiniCalendar() {
  this.showMiniCalendar = !this.showMiniCalendar;
}

onMiniCalendarChange(event: any) {
  const [year, month] = event.target.value.split('-').map(Number);
  this.currentYear = year;
  this.currentMonth = month - 1;
  this.showMiniCalendar = false;
  this.generateCalendar(); // recalcula los días del mes
}

}
