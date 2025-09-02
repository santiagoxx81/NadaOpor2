import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare const window: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private base = (window?.__env?.API_BASE as string) || 'http://localhost:4000/api';

  login(body: { email: string; senha: string }) {
    return this.http.post<{ token: string; usuario: any }>(
      `${this.base}/auth/login`, body
    );
  }

  cadastrar(body: any) {
    return this.http.post(`${this.base}/auth/cadastrar`, body);
  }

  salvarToken(token: string) {
    localStorage.setItem('token', token);
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // <- limpa usuário junto
  }
}
