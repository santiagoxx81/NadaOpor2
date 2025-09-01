# Sistema de Design - Portal PMERJ

## Visão Geral

Este documento descreve o sistema de design implementado para o Portal PMERJ, um sistema moderno e consistente baseado em variáveis CSS (Design Tokens) com foco em performance e acessibilidade.

## Características Principais

### 🎨 Design Tokens
- **Variáveis CSS** para cores, tipografia, espaçamentos e sombras
- **Consistência visual** em todo o sistema
- **Fácil manutenção** e customização

### ⚡ Performance
- **Fontes do sistema** (`system-ui`) para carregamento rápido
- **CSS otimizado** sem dependências externas
- **Animações suaves** com transições CSS nativas

### ♿ Acessibilidade
- **Contraste adequado** entre cores
- **Focus visible** para navegação por teclado
- **Semântica HTML** apropriada

## Paleta de Cores

### Cores Primárias
```css
--primary-50: #eff6ff   /* Azul muito claro */
--primary-500: #3b82f6  /* Azul principal */
--primary-600: #2563eb  /* Azul hover */
--primary-700: #1d4ed8  /* Azul escuro */
```

### Cores Neutras
```css
--gray-50: #f9fafb      /* Fundo principal */
--gray-100: #f3f4f6     /* Fundo secundário */
--gray-500: #6b7280     /* Texto secundário */
--gray-900: #111827     /* Texto principal */
```

### Cores de Status
```css
--success-500: #22c55e  /* Verde - Aprovado */
--warning-500: #f59e0b  /* Amarelo - Pendente/Em análise */
--error-500: #ef4444    /* Vermelho - Erro/Recusado */
--info-500: #3b82f6     /* Azul - Informação */
```

## Tipografia

### Família de Fontes
```css
--font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Tamanhos
```css
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */
--font-size-3xl: 1.875rem  /* 30px */
--font-size-4xl: 2.25rem   /* 36px */
```

## Componentes

### Botões
```html
<!-- Botão primário -->
<button class="btn btn-primary">Ação Principal</button>

<!-- Botão secundário -->
<button class="btn btn-secondary">Ação Secundária</button>

<!-- Botão de sucesso -->
<button class="btn btn-success">Confirmar</button>

<!-- Botão de perigo -->
<button class="btn btn-danger">Excluir</button>

<!-- Tamanhos -->
<button class="btn btn-primary btn-sm">Pequeno</button>
<button class="btn btn-primary btn-lg">Grande</button>
```

### Cards
```html
<div class="card">
  <div class="card-header">
    <div class="card-icon">📋</div>
    <div class="card-content">
      <h3>Título do Card</h3>
      <div class="card-value">42</div>
      <p class="card-description">Descrição do card</p>
    </div>
  </div>
</div>
```

### Formulários
```html
<div class="form-group">
  <label class="form-label">Nome do Campo</label>
  <input type="text" class="form-input" placeholder="Digite aqui...">
</div>

<div class="form-group">
  <label class="form-label">Mensagem</label>
  <textarea class="form-textarea" placeholder="Digite sua mensagem..."></textarea>
</div>
```

### Tabelas
```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Cabeçalho 1</th>
        <th>Cabeçalho 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Dado 1</td>
        <td>Dado 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges de Status
```html
<span class="badge badge-recebida">RECEBIDA</span>
<span class="badge badge-em-analise">EM_ANALISE</span>
<span class="badge badge-pendente">PENDENTE</span>
<span class="badge badge-aprovada">APROVADA</span>
<span class="badge badge-recusada">RECUSADA</span>
```

### Alertas
```html
<div class="alert alert-success">Operação realizada com sucesso!</div>
<div class="alert alert-warning">Atenção: verifique os dados.</div>
<div class="alert alert-error">Erro: tente novamente.</div>
<div class="alert alert-info">Informação importante.</div>
```

## Layout

### Grid System
```html
<!-- Grid responsivo -->
<div class="grid grid-cols-4 gap-6">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
  <div class="card">Item 4</div>
</div>

<!-- Em mobile, automaticamente vira 1 coluna -->
```

### Container
```html
<div class="container">
  <!-- Conteúdo centralizado com largura máxima -->
</div>

<div class="dashboard-container">
  <!-- Container específico para dashboards -->
</div>
```

## Utilitários

### Espaçamento
```css
.mb-0, .mb-1, .mb-2, .mb-4, .mb-6, .mb-8  /* Margin bottom */
.mt-0, .mt-1, .mt-2, .mt-4, .mt-6, .mt-8  /* Margin top */
.p-0, .p-4, .p-6, .p-8                    /* Padding */
```

### Display
```css
.hidden, .block, .inline-block, .flex, .inline-flex
```

### Alinhamento
```css
.text-center, .text-left, .text-right
.items-center, .justify-center, .justify-between
```

### Cores de Texto
```css
.text-primary, .text-success, .text-warning, .text-error, .text-muted
```

### Tamanhos de Texto
```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl
```

## Responsividade

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: < 768px
- **Desktop**: >= 768px

### Comportamento Responsivo
- Grids se adaptam automaticamente
- Tabelas ganham scroll horizontal em mobile
- Botões e formulários se ajustam ao tamanho da tela

## Animações

### Transições
```css
--transition-fast: 150ms ease-in-out
--transition-normal: 250ms ease-in-out
--transition-slow: 350ms ease-in-out
```

### Animações Disponíveis
```css
.fade-in    /* Fade in com slide up */
.slide-in   /* Slide in da esquerda */
.loading    /* Spinner de carregamento */
```

## Estados

### Loading
```html
<div class="loading"></div>
```

### Disabled
```html
<button class="btn btn-primary" disabled>Botão Desabilitado</button>
```

### Hover/Focus
- Todos os elementos interativos têm estados hover
- Focus visible para acessibilidade
- Transições suaves

## Ícones

O sistema utiliza **emojis** como ícones para:
- **Performance**: Não requer carregamento de fontes externas
- **Compatibilidade**: Funcionam em todos os navegadores
- **Simplicidade**: Fácil de implementar e manter

### Ícones Comuns
- 📋 Documentos/Autorizações
- 🎤 Palestras
- ⏳ Em análise/Aguardando
- ✅ Aprovado/Concluído
- ⚠️ Pendência/Atenção
- 📤 Enviar/Upload
- 📥 Baixar/Download
- 🗑️ Excluir
- 👁️ Visualizar/Detalhes
- 🔍 Buscar/Filtrar
- 💾 Salvar
- 🚪 Sair/Logout

## Implementação

### Estrutura de Arquivos
```
frontend/src/
├── styles.css              # Sistema de design principal
├── app/
│   ├── pages/
│   │   ├── login.component/
│   │   ├── usuario/
│   │   └── admin.dashboard/
│   └── ...
```

### Como Usar

1. **Importe o CSS global** no `angular.json`:
```json
{
  "styles": ["src/styles.css"]
}
```

2. **Use as classes** nos templates HTML:
```html
<button class="btn btn-primary">Ação</button>
<div class="card">Conteúdo</div>
```

3. **Personalize** através das variáveis CSS:
```css
:root {
  --primary-500: #your-color;
  --border-radius-lg: 0.75rem;
}
```

## Boas Práticas

### ✅ Recomendado
- Use as classes utilitárias para espaçamento
- Mantenha consistência nos componentes
- Teste em diferentes tamanhos de tela
- Use os badges para status
- Implemente estados de loading

### ❌ Evite
- Estilos inline
- Cores hardcoded
- Margens/paddings arbitrários
- Componentes não padronizados
- Ignorar estados de acessibilidade

## Customização

### Cores da Instituição
Para adaptar às cores da PMERJ, modifique as variáveis primárias:

```css
:root {
  --primary-500: #1e40af;  /* Azul PMERJ */
  --primary-600: #1e3a8a;
  --primary-700: #1e3a8a;
}
```

### Tema Escuro
Para implementar tema escuro, adicione:

```css
[data-theme="dark"] {
  --gray-50: #111827;
  --gray-900: #f9fafb;
  /* ... outras variáveis */
}
```

## Suporte

Este sistema de design foi desenvolvido especificamente para o Portal PMERJ e está otimizado para:
- **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- **Dispositivos móveis** e desktop
- **Acessibilidade** (WCAG 2.1 AA)
- **Performance** (carregamento rápido)

---

**Desenvolvido para:** Polícia Militar do Estado do Rio de Janeiro  
**Versão:** 1.0.0  
**Data:** 2024
