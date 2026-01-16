import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './Servicios/auth.service'; // Ajusta la ruta
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

constructor(private auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
  this.http.get('/api/check-session', { withCredentials: true }).subscribe({
    next: () => this.router.navigate(['/inicio']),
    error: () => {} // permanece en login
  });
}

}
