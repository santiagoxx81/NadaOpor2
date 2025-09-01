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
    tipo: [''], // AE (Nada Opor) | PL (Palestras/Eventos)
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

  private normalizarAE(row: any) {
    return {
      origem: 'AE',
      protocolo: row.protocolo,
      titulo: row.titulo,
      cidade: row.cidade,
      estado: row.estado,
      temas: undefined,
      status: row.status,
      criado_em: row.criado_em
    };
  }

  private normalizarPL(row: any) {
    return {
      origem: 'PL',
      protocolo: row.protocolo,
      titulo: row.organizacao || row.titulo || '(Sem título)',
      cidade: row.cidade,
      estado: row.estado,
      temas: row.temas,
      status: row.status,
      criado_em: row.criado_em
    };
  }

  buscar() {
    this.carregando = true;
    this.erro = '';

    const filtros = this.filtros.value as any;

    // Se escolher tipo específico, busca única
    if (filtros?.tipo === 'AE') {
      this.adminSrv.listarAutorizacoes(filtros).subscribe({
        next: (rows: any[]) => { this.registros = (rows || []).map(r => this.normalizarAE(r)); this.carregando = false; },
        error: (e: any) => { this.erro = e?.error?.erro || 'Falha ao carregar registros'; this.carregando = false; }
      });
      return;
    }

    if (filtros?.tipo === 'PL') {
      this.adminSrv.listarPalestras(filtros).subscribe({
        next: (rows: any[]) => { this.registros = (rows || []).map(r => this.normalizarPL(r)); this.carregando = false; },
        error: (e: any) => { this.erro = e?.error?.erro || 'Falha ao carregar registros'; this.carregando = false; }
      });
      return;
    }

    // Senão, carrega ambas e mescla
    let ae: any[] = [];
    let pl: any[] = [];

    this.adminSrv.listarAutorizacoes(filtros).subscribe({
      next: (rows: any[]) => {
        ae = (rows || []).map(r => this.normalizarAE(r));
        this.adminSrv.listarPalestras(filtros).subscribe({
          next: (rows2: any[]) => {
            pl = (rows2 || []).map(r => this.normalizarPL(r));
            this.registros = [...ae, ...pl]
              .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
            this.carregando = false;
          },
          error: (e: any) => { this.erro = e?.error?.erro || 'Falha ao carregar palestras'; this.carregando = false; }
        });
      },
      error: (e: any) => { this.erro = e?.error?.erro || 'Falha ao carregar autorizações'; this.carregando = false; }
    });
  }

  atualizarStatus(protocolo: string, novoStatus: string) {
    if (!confirm(`Alterar status para ${novoStatus}?`)) return;
    // Por padrão, atualiza em autorizações. Ajuste futuro: detectar origem
    this.adminSrv.alterarStatusAutorizacao(protocolo as any, novoStatus as any).subscribe({
      next: () => { this.msg = 'Status atualizado!'; this.buscar(); },
      error: (e: any) => this.erro = e?.error?.erro || 'Falha ao atualizar status'
    });
  }

  sair() { console.log('Saindo...'); }
}
