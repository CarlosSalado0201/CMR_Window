import { Component } from '@angular/core';

@Component({
  selector: 'app-historial-reportes',
  templateUrl: './historial-reportes.component.html',
  styleUrls: ['./historial-reportes.component.css']
})
export class HistorialReportesComponent {

  weekDays = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  monthNames = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  daysInMonth: number[] = [];

  // Simulación de fechas con reportes
  reportDays = [3, 7, 10, 15, 22, 29];

  constructor() {
    this.loadCalendar();
  }

  loadCalendar() {
    this.daysInMonth = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysCount = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const start = (firstDay === 0 ? 6 : firstDay - 1);

    for (let i = 0; i < start; i++) {
      this.daysInMonth.push(0);
    }

    for (let d = 1; d <= daysCount; d++) {
      this.daysInMonth.push(d);
    }
  }

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.loadCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.loadCalendar();
  }

  hasReports(day: number): boolean {
    return this.reportDays.includes(day);
  }

  selectDate(day: number) {
    alert(`Mostrar reportes del día: ${day}/${this.currentMonth + 1}/${this.currentYear}`);
  }
}
