import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { HeaderComponent } from '../../components/header/header.component';
import { PalestraService } from '../../services/palestra.service';
import { AnexosService } from '../../services/anexos.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './admin.dashboard.component.html',
  styleUrls: ['./admin.dashboard.component.css']
})
export class AdminDashboardComponent {
  private fb = inject(FormBuilder);
  private adminSrv = inject(AdminService);
  private palestraSrv = inject(PalestraService);
  private anexosSrv = inject(AnexosService);

  carregando = false;
  erro = '';
  msg = '';

  registros: any[] = [];

  // Detalhe
  detalhe: any | null = null;
  detalheOrigem: 'AE' | 'PL' | '' = '';
  carregandoDetalhe = false;
  anexos: any[] = [];

  filtros = this.fb.group({
    tipo: [''],
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
        error: (e: any) => { this.erro = e?.error?.erro || 'Falha ao carregar palestras'; this.carregando = false; }
      });
      return;
    }

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

  verDetalhe(row: any) {
    this.detalhe = null;
    this.anexos = [];
    this.carregandoDetalhe = true;
    this.detalheOrigem = row?.origem || 'AE';

    if (this.detalheOrigem === 'AE') {
      this.adminSrv.obterAutorizacao(row.protocolo).subscribe({
        next: (d: any) => {
          this.detalhe = d;
          this.carregarAnexos(row.protocolo);
          this.carregandoDetalhe = false;
        },
        error: () => { this.erro = 'Falha ao carregar detalhes'; this.carregandoDetalhe = false; }
      });
    } else {
      this.palestraSrv.obterPalestraPorProtocolo(row.protocolo).subscribe({
        next: (d: any) => { this.detalhe = d; this.carregandoDetalhe = false; },
        error: () => { this.erro = 'Falha ao carregar detalhes'; this.carregandoDetalhe = false; }
      });
    }
  }

  private carregarAnexos(protocolo: string) {
    this.anexosSrv.listar(protocolo).subscribe({
      next: (ax: any[]) => this.anexos = ax || [],
      error: () => this.anexos = []
    });
  }

  baixarAnexo(a: any) {
    this.anexosSrv.download(a.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = a.nome_original || 'anexo';
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  fecharDetalhe() { this.detalhe = null; this.anexos = []; this.detalheOrigem = ''; }

  atualizarStatus(protocolo: string, novoStatus: string) {
    if (!confirm(`Alterar status para ${novoStatus}?`)) return;
    this.adminSrv.alterarStatusAutorizacao(protocolo as any, novoStatus as any).subscribe({
      next: () => { this.msg = 'Status atualizado!'; this.buscar(); },
      error: (e: any) => this.erro = e?.error?.erro || 'Falha ao atualizar status'
    });
  }

  sair() { console.log('Saindo...'); }
}
