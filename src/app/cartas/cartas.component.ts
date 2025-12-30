import { Component } from '@angular/core';
import { ServiciosService } from '../Servicios/servicios.service';
import { CartaPayload } from '../Models/ModalCartaComponent';

@Component({
  selector: 'app-cartas',
  templateUrl: './cartas.component.html',
  styleUrls: ['./cartas.component.css']
})
export class CartasComponent {
  formularioVisible: 'entrega' | 'garantia' | 'conjunto' | null = null;
  respuesta1 = '';
  respuesta2 = '';
  respuesta3 = '';
  respuesta4 = '';

  // Modal
  mostrarModal = false;

  // ✅ SIEMPRE carpeta "Cartas" (id = 2)
  idCarpetaSeleccionada = 2;

  constructor(private serviciosService: ServiciosService) {}

  mostrarFormulario(tipo: 'entrega' | 'garantia' | 'conjunto') {
    this.formularioVisible = tipo;
    this.respuesta1 = '';
    this.respuesta2 = '';
    this.respuesta3 = '';
    this.respuesta4 = '';
  }

  // Método llamado al generar la carta desde el modal
  onGenerarCarta(payload: CartaPayload) {
    // ✅ Forzar carpeta 2 aunque el modal mande otra
    payload.idCarpeta = 2;

    this.serviciosService.generarCarta(payload).subscribe({
      next: (urlPdf) => {
        if (urlPdf) window.open(urlPdf, '_blank');
        else console.error('No se recibió URL del PDF');
      },
      error: (err) => console.error('Error al generar carta:', err)
    });

    this.mostrarModal = false;
  }

  // Guardar desde el formulario actual
  guardar(tipo: 'entrega' | 'garantia' | 'conjunto') {
    // ✅ Forzar carpeta 2 siempre
    const payload: CartaPayload = { tipo, idCarpeta: 2 };

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
      next: (urlPdf) => {
        if (urlPdf) window.open(urlPdf, '_blank');
      },
      error: (err) => console.error('Error al generar carta:', err)
    });

    this.formularioVisible = null;
  }

  logout() {
    document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }
}
