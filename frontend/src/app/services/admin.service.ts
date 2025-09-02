import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = (window?.__env?.API_BASE as string) || 'http://localhost:4000/api';

  listarAutorizacoes(filtros?: Record<string, any>) {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && k !== 'tipo') params = params.set(k, String(v));
      });
    }
    return this.http.get<any[]>(`${this.base}/admin/eventos/autorizacao`, { params });
  }

  alterarStatusAutorizacao(
    protocolo: string,
    status: 'EM_ANALISE'|'PENDENTE'|'APROVADA'|'RECUSADA'|'FINALIZADA'|'CANCELADA',
    pendencia_obs?: string
  ) {
    return this.http.patch<{ ok: true; status: string; pendencia_obs: string | null }>(
      `${this.base}/admin/eventos/autorizacao/${encodeURIComponent(protocolo)}/status`,
      { status, pendencia_obs }
    );
  }

  // Listagem de Palestras (admin)
  listarPalestras(filtros?: Record<string, any>) {
    let params = new HttpParams();
    if (filtros) {
      Object.entries(filtros).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && k !== 'tipo') params = params.set(k, String(v));
      });
    }
    return this.http.get<any[]>(`${this.base}/admin/palestras`, { params });
  }

  // Alteração de status de Palestra (admin)
  alterarStatusPalestra(
    protocolo: string,
    status: 'EM_ANALISE'|'PENDENTE'|'APROVADA'|'RECUSADA'|'FINALIZADA'|'CANCELADA'
  ) {
    return this.http.patch<{ ok: true; status: string }>(
      `${this.base}/admin/palestras/${encodeURIComponent(protocolo)}/status`,
      { status }
    );
  }

  // ⇩ detalhe de uma autorização pelo protocolo (usa a rota "cidadão")
  obterAutorizacao(protocolo: string) {
    return this.http.get<any>(`${this.base}/eventos/autorizacao/${encodeURIComponent(protocolo)}`);
  }
  atualizarPendencia(protocolo: string, pendente: boolean, obs?: string) {
    return this.http.patch<{ ok: true; pendente: boolean }>(
      `${this.base}/admin/eventos/autorizacao/${encodeURIComponent(protocolo)}/pendencia`,
      { pendente, obs }
    );
  }
}
