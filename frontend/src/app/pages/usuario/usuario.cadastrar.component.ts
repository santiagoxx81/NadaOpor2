import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuario-cadastrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent, RouterModule],
  templateUrl: './usuario.cadastrar.component.html',
  styleUrls: ['./usuario.cadastrar.component.css']
})
export class UsuarioCadastrarComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  erro = '';
  ok = '';

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    documento: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]]
  });

  senhasNaoConferem(): boolean {
    const v = this.form.value as any;
    return !!v?.senha && !!v?.confirmarSenha && v?.senha !== v?.confirmarSenha;
  }

  submit() {
    if (this.form.invalid || this.senhasNaoConferem()) return;
    this.loading = true;
    this.erro = '';
    this.ok = '';

    const { nome, email, telefone, documento, senha } = this.form.value as any;
    this.auth.cadastrar({ nome, email, telefone, documento, senha }).subscribe({
      next: () => {
        this.loading = false;
        this.ok = 'Usuário cadastrado com sucesso!';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: e => {
        this.loading = false;
        this.erro = e?.error?.erro || 'Falha ao cadastrar';
      }
    });
  }
}
