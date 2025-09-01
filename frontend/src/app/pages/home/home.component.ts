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

  novaSolicitacao() {
    // Redireciona para o dashboard do usuário
    this.router.navigate(['/usuario/dashboard']);
  }

  minhasSolicitacoes() {
    // Redireciona para o dashboard do usuário
    this.router.navigate(['/usuario/dashboard']);
  }
}
