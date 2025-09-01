import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  erro = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.erro = '';

    this.auth.login(this.form.value as any).subscribe({
      next: res => {
        // guarda credenciais
        this.auth.salvarToken(res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        // decide rota por perfil
        const tipo = res.usuario?.tipo_usuario;
        const destino = (tipo === 'ADMIN') ? '/admin/dashboard' : '/usuario/dashboard';

        this.loading = false;
        this.router.navigateByUrl(destino);
      },
      error: e => {
        this.loading = false;
        this.erro = e?.error?.erro || 'Falha no login';
      }
    });
  }
}
