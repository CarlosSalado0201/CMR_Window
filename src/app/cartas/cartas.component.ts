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

  // ✅ Para mostrar el panel de "Último PDF"
  urlPdf: string | null = null;

  constructor(private serviciosService: ServiciosService) {}

  mostrarFormulario(tipo: 'entrega' | 'garantia' | 'conjunto') {
    this.formularioVisible = tipo;
    this.respuesta1 = '';
    this.respuesta2 = '';
    this.respuesta3 = '';
    this.respuesta4 = '';
  }

  // ✅ Limpia URL, la guarda en el componente y abre pestaña (evita popup bloqueado)
  private abrirPdf(urlPdf: string | null, newTab?: Window | null) {
    const url = (urlPdf ?? '').trim().replace(/^"|"$/g, '');
    console.log('URL PDF backend:', url);

    // ✅ Guardar para mostrar el layer
    this.urlPdf = url || null;

    if (!url) {
      console.error('Backend regresó URL vacío o null');
      if (newTab) newTab.close();
      return;
    }

    if (newTab) {
      newTab.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  }

  copiarEnlace(input: HTMLInputElement) {
    const texto = (input.value ?? '').trim();
    if (!texto) return;

    navigator.clipboard.writeText(texto)
      .then(() => alert('✅ Enlace copiado'))
      .catch(() => {
        // fallback por si el navegador bloquea clipboard
        input.select();
        document.execCommand('copy');
        alert('✅ Enlace copiado');
      });
  }

  // Método llamado al generar la carta desde el modal
  onGenerarCarta(payload: CartaPayload) {
    // ✅ Forzar carpeta 2 aunque el modal mande otra
    payload.idCarpeta = 2;

    // ✅ abrir tab antes para que el navegador no lo bloquee
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

  // Guardar desde el formulario actual
  guardar(tipo: 'entrega' | 'garantia' | 'conjunto') {
    // ✅ abrir tab antes para que el navegador no lo bloquee
    const newTab = window.open('', '_blank');

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
