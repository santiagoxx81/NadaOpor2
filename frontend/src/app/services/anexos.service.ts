import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class AnexosService {
  private http = inject(HttpClient);
  private base = (window?.__env?.API_BASE as string) || 'http://localhost:4000/api';

  listar(protocoloAE: string) {
    return this.http.get<any[]>(`${this.base}/eventos/autorizacao/${protocoloAE}/anexos`);
  }

  upload(protocoloAE: string, arquivo: File, tipo_documento: string) {
    const fd = new FormData();
    fd.append('arquivo', arquivo);
    fd.append('tipo_documento', tipo_documento);
    return this.http.post<{ ok: true }>(`${this.base}/eventos/autorizacao/${protocoloAE}/anexos`, fd);
  }

  download(id: number) {
    return this.http.get(`${this.base}/eventos/autorizacao/anexos/${id}/download`, { responseType: 'blob' });
  }

  excluir(id: number) {
    return this.http.delete<{ ok: true }>(`${this.base}/eventos/autorizacao/anexos/${id}`);
  }
}
