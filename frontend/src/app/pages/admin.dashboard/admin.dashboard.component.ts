import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './admin.dashboard.component.html'
})
export class AdminDashboardComponent {
  private fb = inject(FormBuilder);
  private adminSrv = inject(AdminService);

  // UI state
  carregando = false;
  erro = '';
  msg = '';

  // Lista de registros
  registros: any[] = [];

  // Filtros
  filtros = this.fb.group({
    status: [''],
    protocolo: [''],
    titulo: [''],
    cidade: [''],
    data_inicio: [''],
    data_fim: ['']
  });

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.carregando = true;
    this.erro = '';
    this.adminSrv.listarAutorizacoes(this.filtros.value as any).subscribe({
      next: (rows: any[]) => { this.registros = rows || []; this.carregando = false; },
      error: (e: any) => { this.erro = e?.error?.erro || 'Falha ao carregar registros'; this.carregando = false; }
    });
  }

  atualizarStatus(protocolo: string, novoStatus: string) {
    if (!confirm(`Alterar status para ${novoStatus}?`)) return;
    this.adminSrv.alterarStatusAutorizacao(protocolo as any, novoStatus as any).subscribe({
      next: () => { this.msg = 'Status atualizado!'; this.buscar(); },
      error: (e: any) => this.erro = e?.error?.erro || 'Falha ao atualizar status'
    });
  }

  sair() {
    // Implementar logout
    console.log('Saindo...');
  }
}
