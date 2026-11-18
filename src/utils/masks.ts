export function mascaraCpf(valor: string): string {
  let n = valor.replace(/\D/g, '').slice(0, 11);
  n = n.replace(/(\d{3})(\d)/, '$1.$2');
  n = n.replace(/(\d{3})(\d)/, '$1.$2');
  n = n.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return n;
}

export function mascaraTelefone(valor: string): string {
  let n = valor.replace(/\D/g, '').slice(0, 11);
  if (n.length > 10) n = n.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  else if (n.length > 6) n = n.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  else if (n.length > 2) n = n.replace(/(\d{2})(\d+)/, '($1) $2');
  return n;
}

export function mascaraCep(valor: string): string {
  const n = valor.replace(/\D/g, '').slice(0, 8);
  return n.length > 5 ? n.replace(/(\d{5})(\d{1,3})/, '$1-$2') : n;
}
