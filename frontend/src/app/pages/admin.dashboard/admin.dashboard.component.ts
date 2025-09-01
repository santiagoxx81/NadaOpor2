import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // para [(ngModel)]
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { AnexosService } from '../../services/anexos.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.dashboard.component.html',
})
export class AdminDashboardComponent {
  private fb = inject(FormBuilder);
  private admin = inject(AdminService);
  private router = inject(Router);
  private anexosSrv = inject(AnexosService);

  carregando = false;
  erro = '';
  registros: any[] = [];
  statusOptions: Array<
    | 'EM_ANALISE'
    | 'PENDENTE'
    | 'APROVADA'
    | 'RECUSADA'
    | 'FINALIZADA'
    | 'CANCELADA'
  > = [
    'EM_ANALISE',
    'PENDENTE',
    'APROVADA',
    'RECUSADA',
    'FINALIZADA',
    'CANCELADA',
  ];

  // detalhe inline
  selecionadoProtocolo: string | null = null;
  carregandoDetalhe = false;
  erroDetalhe = '';
  detalhe: any = null;
  anexos: any[] = [];

  filtros = this.fb.group({
    status: [''],
    cidade: [''],
    de: [''],
    ate: [''],
  });

  ngOnInit() {
    this.buscar();
  }

  buscar() {
    this.carregando = true;
    this.erro = '';

    this.admin.listarAutorizacoes(this.filtros.value as any).subscribe({
      next: (rows) => {
        // cria campo aux para select de status
        this.registros = rows.map((r: any) => ({
          ...r,
          _novoStatus: r.status,
          _pendenciaObs: r.pendencia_obs || '',
        }));

        this.carregando = false;

        // se o item selecionado saiu do filtro, fecha detalhe
        if (
          this.selecionadoProtocolo &&
          !this.registros.some((r) => r.protocolo === this.selecionadoProtocolo)
        ) {
          this.selecionadoProtocolo = null;
          this.detalhe = null;
          this.anexos = [];
        }
        this.registros = rows.map((r: any) => ({
          ...r,
          _novoStatus: r.status,
          _pendente: !!r.pendente, // novo
          _pendenteObs: r.pendente_obs || '', // novo
        }));
      },
      error: (e) => {
        this.erro = e?.error?.erro || 'Falha ao carregar';
        this.carregando = false;
      },
    });
  }

  alterarStatus(r: any) {
  if (!r?.protocolo || !r?._novoStatus) return;

  if (r._novoStatus === 'PENDENTE' && !String(r._pendenciaObs || '').trim()) {
    this.erro = 'Descreva a pendência antes de salvar o status PENDENTE.';
    return;
  }

  this.admin.alterarStatusAutorizacao(r.protocolo, r._novoStatus, r._pendenciaObs).subscribe({
    next: () => {
      const estavaAberto = this.selecionadoProtocolo === r.protocolo;
      this.buscar();
      if (estavaAberto) setTimeout(() => this.abrirDetalhe(r.protocolo, true), 0);
    },
    error: (e) => this.erro = e?.error?.erro || 'Erro ao alterar status'
  });
}


  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  abrirDetalhe(protocolo: string, manterAberto = false) {
    // toggle
    if (!manterAberto && this.selecionadoProtocolo === protocolo) {
      this.selecionadoProtocolo = null;
      this.detalhe = null;
      this.anexos = [];
      return;
    }

    this.selecionadoProtocolo = protocolo;
    this.carregandoDetalhe = true;
    this.erroDetalhe = '';
    this.detalhe = null;
    this.anexos = [];

    // detalhe do AE
    this.admin.obterAutorizacao(protocolo).subscribe({
      next: (det) => {
        this.detalhe = det;
        this.carregandoDetalhe = false;
      },
      error: (e) => {
        this.erroDetalhe = e?.error?.erro || 'Falha ao carregar detalhes';
        this.carregandoDetalhe = false;
      },
    });

    // anexos
    this.anexosSrv.listar(protocolo).subscribe({
      next: (rows) => (this.anexos = rows),
      error: () => (this.anexos = []),
    });
  }

  baixar(anexo: any) {
    this.anexosSrv.download(anexo.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = anexo.nome_original || 'anexo';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  salvarPendencia(r: any) {
    if (!r?.protocolo) return;
    this.admin
      .atualizarPendencia(r.protocolo, !!r._pendente, r._pendenteObs)
      .subscribe({
        next: () => this.buscar(),
        error: (e) =>
          (this.erro = e?.error?.erro || 'Erro ao salvar pendência'),
      });
  }
}
