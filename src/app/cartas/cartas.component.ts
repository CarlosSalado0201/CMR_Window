import { Component } from '@angular/core';

@Component({
  selector: 'app-cartas',
  templateUrl: './cartas.component.html',
  styleUrls: ['./cartas.component.css']
})
export class CartasComponent{
  formularioVisible: 'entrega' | 'garantia' | 'conjunto' | null = null;
  respuesta1 = '';
  respuesta2 = '';
  respuesta3 = '';
  respuesta4 = '';

  mostrarFormulario(tipo: 'entrega' | 'garantia' | 'conjunto') {
    this.formularioVisible = tipo;
    this.respuesta1 = '';
    this.respuesta2 = '';
    this.respuesta3 = '';
    this.respuesta4 = '';
  }

  guardar(tipo: string) {
    console.log('Tipo:', tipo);
    console.log('Respuesta 1:', this.respuesta1);
    console.log('Respuesta 2:', this.respuesta2);
    console.log('Respuesta 3:', this.respuesta3);
    console.log('Respuesta 4:', this.respuesta4);

    this.formularioVisible = null; // cerrar formulario
  }
    // ===================== LOGOUT =====================
  logout() {
    document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  }

}