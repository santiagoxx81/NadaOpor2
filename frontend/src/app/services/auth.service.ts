import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(body: { email: string; senha: string }) {
    return this.http.post<{ token: string; usuario: any }>(
      'http://localhost:4000/api/auth/login', body
    );
  }

  cadastrar(body: any) {
    return this.http.post('http://localhost:4000/api/auth/cadastrar', body);
  }

  salvarToken(token: string) {
    localStorage.setItem('token', token);
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario'); // <- limpa usuário junto
  }
}
