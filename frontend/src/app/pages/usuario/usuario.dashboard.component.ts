import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NadaOporService } from '../../services/nada-opor.service';
import { AnexosService } from '../../services/anexos.service';
import { PalestraService } from '../../services/palestra.service';

const STATUS = ['RECEBIDA','EM_ANALISE','PENDENTE','APROVADA','RECUSADA','FINALIZADA','CANCELADA'] as const;
type StatusAE = typeof STATUS[number];

@Component({
  selector: 'app-usuario-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.dashboard.component.html'
})
export class UsuarioDashboardComponent {
  private fb = inject(FormBuilder);
  private aeSrv = inject(NadaOporService);
  private plSrv = inject(PalestraService);
  private anexosSrv = inject(AnexosService);

  // UI state
  tab: 'AE' | 'PL' = 'AE';
  abrirFormAE = false;
  abrirFormPL = false;
  carregandoLista = false;
  erroLista = '';
  msg = '';
  erro = '';

  // Listas do usuário
  meusAE: any[] = [];
  minhasPL: any[] = [];

  // Detalhe/Anexos AE
  protocoloAberto: string | null = null;   // AE detalhado
  detalheAE: any = null;
  anexos: any[] = [];
  uploading: Record<string, boolean> = {};
  arquivosSelecionados: Record<string, File | null> = {};

  // ---- Form Novo Nada Opor ----
  formAE = this.fb.group({
    titulo: ['', Validators.required],
    descricao: [''],
    tipo_evento: [''],
    endereco: ['', Validators.required],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    cep: [''],
    data_inicio: ['', Validators.required],
    data_fim: ['', Validators.required],
    publico_estimado: [null],
    observacoes: ['']
  });

  // ---- Form Nova Palestra/Representante ----
  formPL = this.fb.group({
    organizacao: [''],
    endereco: ['', Validators.required],
    bairro: ['', Validators.required],
    cidade: ['', Validators.required],
    estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    cep: [''],
    temas: ['', Validators.required],
    publico_alvo: [''],
    qtd_pessoas: [null],
    data_sugerida: ['', Validators.required],
    observacoes: ['']
  });

  // Documentos sugeridos (Nada Opor)
  tipoDocsObrig = [
    { key: 'oficio_nada_opor',       label: 'Ofício solicitando Nada Opor', obrig: true },
    { key: 'requerimento_pm',        label: 'Requerimento padrão da PM', obrig: true },
    { key: 'identidade_cpf',         label: 'Identidade e CPF do responsável', obrig: true },
    { key: 'comprovante_residencia', label: 'Comprovante de residência', obrig: true },
    { key: 'programacao_evento',     label: 'Programação do evento', obrig: true },
  ];
  tipoDocsCond = [
    { key: 'protocolo_prefeitura',        label: 'Protocolo da Prefeitura' },
    { key: 'protocolo_defesa_civil',      label: 'Protocolo da Defesa Civil' },
    { key: 'protocolo_policia_civil',     label: 'Protocolo da Polícia Civil' },
    { key: 'protocolo_bombeiros',         label: 'Protocolo do Corpo de Bombeiros' },
    { key: 'protocolo_transito',          label: 'Protocolo da Secretaria de Trânsito' },
    { key: 'protocolo_infancia_conselho', label: 'Vara da Infância / Conselho Tutelar (comunicado)' },
  ];

  ngOnInit() {
    this.refreshListas();
  }

  // Métodos para contadores dos cards
  getEmAnaliseCount(): number {
    return this.meusAE?.filter(ae => ae.status === 'EM_ANALISE')?.length || 0;
  }

  getAprovadasCount(): number {
    return this.meusAE?.filter(ae => ae.status === 'APROVADA')?.length || 0;
  }

  // ============== Listas ==============
  refreshListas() {
    this.carregandoLista = true;
    this.erroLista = '';
    // AE (Nada Opor)
    this.aeSrv.listarMinhas().subscribe({
      next: rows => { this.meusAE = rows || []; this.carregandoLista = false; },
      error: e => { this.erroLista = e?.error?.erro || 'Falha ao carregar suas solicitações'; this.carregandoLista = false; }
    });
    // Palestras
    this.plSrv.listarMinhas().subscribe({
      next: rows => { this.minhasPL = rows || []; },
      error: () => { /* silencioso */ }
    });
  }

  // ============== AE: criar + anexos ==============
  criarAE() {
    if (this.formAE.invalid) return;
    this.msg = ''; this.erro = '';
    this.aeSrv.criar(this.formAE.value).subscribe({
      next: r => {
        this.msg = `Nada Opor enviado! Protocolo: ${r.protocolo}`;
        this.abrirFormAE = false;
        // abre o detalhe do protocolo recém-criado para anexar
        this.abrirDetalheAE(r.protocolo);
        this.refreshListas();
        this.formAE.reset({});
      },
      error: e => this.erro = e?.error?.erro || 'Erro ao enviar Nada Opor'
    });
  }

  abrirDetalheAE(protocolo: string) {
    if (this.protocoloAberto === protocolo) {
      this.protocoloAberto = null;
      this.detalheAE = null;
      this.anexos = [];
      return;
    }
    this.protocoloAberto = protocolo;
    this.detalheAE = null; this.anexos = [];
    this.aeSrv.obter(protocolo).subscribe({
      next: det => {
        this.detalheAE = det;
        this.carregarAnexos();
      },
      error: e => { this.erro = e?.error?.erro || 'Falha ao abrir detalhes'; }
    });
  }

  get podeAnexar(): boolean {
    if (!this.detalheAE) return false;
    // pode anexar enquanto NÃO está em estados finais
    return !['APROVADA','RECUSADA','FINALIZADA','CANCELADA'].includes(this.detalheAE.status);
  }

  carregarAnexos() {
    if (!this.protocoloAberto) return;
    this.anexosSrv.listar(this.protocoloAberto).subscribe({
      next: rows => this.anexos = rows,
      error: () => this.anexos = []
    });
  }
  onEscolherArquivo(tipo: string, event: any) {
    const f: File | null = event?.target?.files?.[0] ?? null;
    this.arquivosSelecionados[tipo] = f;
  }
  enviarArquivo(tipo: string) {
    const f = this.arquivosSelecionados[tipo];
    if (!this.protocoloAberto || !f) return;
    if (f.size > 10 * 1024 * 1024) { alert('Arquivo acima de 10MB'); return; }
    const okExt = /\.(pdf|jpg|jpeg|png)$/i.test(f.name);
    if (!okExt) { alert('Somente PDF, JPG, PNG'); return; }

    this.uploading[tipo] = true;
    this.anexosSrv.upload(this.protocoloAberto, f, tipo).subscribe({
      next: () => {
        this.uploading[tipo] = false;
        this.arquivosSelecionados[tipo] = null;
        this.carregarAnexos();
      },
      error: e => {
        this.uploading[tipo] = false;
        alert(e?.error?.erro || 'Falha no upload');
      }
    });
  }
  baixar(anexo: any) {
    this.anexosSrv.download(anexo.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = anexo.nome_original || 'anexo';
      a.click(); URL.revokeObjectURL(url);
    });
  }
  excluir(anexo: any) {
    if (!confirm('Excluir este anexo?')) return;
    this.anexosSrv.excluir(anexo.id).subscribe({
      next: () => this.carregarAnexos(),
      error: e => alert(e?.error?.erro || 'Falha ao excluir')
    });
  }

  // ============== Palestra: criar ==============
  criarPL() {
    if (this.formPL.invalid) return;
    this.msg = ''; this.erro = '';
    this.plSrv.criar(this.formPL.value).subscribe({
      next: r => {
        this.msg = `Palestra solicitada! Protocolo: ${r.protocolo}`;
        this.abrirFormPL = false;
        this.refreshListas();
        this.formPL.reset({});
      },
      error: e => this.erro = e?.error?.erro || 'Erro ao solicitar Palestra'
    });
  }
}
