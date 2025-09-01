export function gerarProtocolo(prefixo) {
  const agora = new Date();
  const ano = agora.getFullYear();
  const numero = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `PMRJ-${prefixo}-${ano}-${numero}`; // AE, PE, PL
}
