import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class NadaOporService {
  private http = inject(HttpClient);
  private base = (window?.__env?.API_BASE as string) || 'http://localhost:4000/api';

  criar(body: any) {
    return this.http.post<{ id: number; protocolo: string; status: string }>(
      `${this.base}/eventos/autorizacao`, body
    );
  }

  // lista SOMENTE do usuário autenticado
  listarMinhas() {
    return this.http.get<any[]>(`${this.base}/eventos/autorizacao`);
  }

  obter(protocolo: string) {
    return this.http.get<any>(`${this.base}/eventos/autorizacao/${encodeURIComponent(protocolo)}`);
  }
}
