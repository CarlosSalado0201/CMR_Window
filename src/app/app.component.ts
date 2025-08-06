import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private router: Router) {}

  irInicio() {
  console.log('Click en logo!');
  this.router.navigate(['/']);
}


  abrirCalculadora() {
    this.router.navigate(['calculadora']);
  }
}