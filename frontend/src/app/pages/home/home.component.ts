import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  private navegarParaDashboardPorPerfil() {
    const raw = localStorage.getItem('usuario');
    let destino = '/usuario/dashboard';
    if (raw) {
      try {
        const usuario = JSON.parse(raw);
        const tipo = (usuario?.tipo_usuario || '').toString().toUpperCase();
        destino = tipo === 'ADMIN' ? '/admin/dashboard' : '/usuario/dashboard';
      } catch {}
    }
    this.router.navigate([destino]);
  }

  novaSolicitacao() {
    this.navegarParaDashboardPorPerfil();
  }

  minhasSolicitacoes() {
    this.navegarParaDashboardPorPerfil();
  }
}
