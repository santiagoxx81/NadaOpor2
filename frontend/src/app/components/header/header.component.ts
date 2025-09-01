import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() currentPage: string = 'Página Inicial';
  @Input() userName: string = 'Admin PMERJ';
  @Input() userRole: string = 'ADMINISTRADOR';

  isLoggedIn = false;
  contrast = false;
  fontLg = false;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.updateUserInfo();
    // Restaurar preferências
    this.contrast = localStorage.getItem('a11y_contrast') === '1';
    this.fontLg = localStorage.getItem('a11y_font_lg') === '1';
    this.applyA11y();
  }

  private applyA11y() {
    const html = document.documentElement;
    html.classList.toggle('contrast', this.contrast);
    html.classList.toggle('font-lg', this.fontLg);
  }

  toggleContrast() {
    this.contrast = !this.contrast;
    localStorage.setItem('a11y_contrast', this.contrast ? '1' : '0');
    this.applyA11y();
  }

  toggleFont() {
    this.fontLg = !this.fontLg;
    localStorage.setItem('a11y_font_lg', this.fontLg ? '1' : '0');
    this.applyA11y();
  }

  private updateUserInfo(): void {
    const token = localStorage.getItem('token');
    const usuarioRaw = localStorage.getItem('usuario');

    if (token && usuarioRaw) {
      this.isLoggedIn = true;
      try {
        const usuario: any = JSON.parse(usuarioRaw);
        const nome = usuario?.nome || usuario?.nome_completo || usuario?.nomeCompleto || usuario?.email || 'Usuário';
        const tipo = (usuario?.tipo_usuario || usuario?.tipo || '').toString().toUpperCase();
        const role = tipo === 'ADMIN' ? 'ADMINISTRADOR' : 'CIDADÃO';
        this.userName = nome;
        this.userRole = role;
      } catch {
        this.userName = 'Usuário';
        this.userRole = 'CIDADÃO';
      }
    } else {
      this.isLoggedIn = false;
      this.userName = 'Visitante';
      this.userRole = 'NÃO AUTENTICADO';
    }
  }

  goHome() { this.router.navigate(['/home']); }
  goLogin() { this.router.navigate(['/login']); }

  logout() {
    this.auth.sair();
    this.isLoggedIn = false;
    this.userName = 'Visitante';
    this.userRole = 'NÃO AUTENTICADO';
    this.router.navigate(['/login']);
  }
}
