import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() currentPage: string = 'Página Inicial';
  @Input() userName: string = 'Admin PMERJ';
  @Input() userRole: string = 'ADMINISTRADOR';

  constructor(private router: Router) {}

  logout() {
    // Implementar lógica de logout
    this.router.navigate(['/login']);
  }
}
