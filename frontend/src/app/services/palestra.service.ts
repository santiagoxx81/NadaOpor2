import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class PalestraService {
  private http = inject(HttpClient);
  private base = (window?.__env?.API_BASE as string) || 'http://localhost:4000/api';

  criar(body: any) {
    return this.http.post<{ id: number; protocolo: string; status: string }>(
      `${this.base}/palestras`, body
    );
  }

  listarMinhas() {
    return this.http.get<any[]>(`${this.base}/palestras`);
  }

  obterPalestraPorProtocolo(protocolo: string) {
    return this.http.get<any>(`${this.base}/palestras/${encodeURIComponent(protocolo)}`);
  }
}
