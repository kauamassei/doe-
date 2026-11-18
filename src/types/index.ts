// Ajuste estes tipos conforme os DTOs reais do backend.

export interface Doador {
  id?: number;
  nome: string;
  cpf: string;
  dataNascimento: string; // yyyy-MM-dd
  email: string;
  telefone: string;
  sexo?: string;
  tipoSanguineo?: string;
  cep?: string;
  endereco?: string;
  observacoes?: string;
}

export interface UnidadeColeta {
  id: number;
  nome: string;
  endereco?: string;
  cidade?: string;
}

export interface NovoAgendamento {
  dataAgenda: string; // yyyy-MM-ddTHH:mm
  observacoes?: string;
}

export interface Agendamento {
  id: number;
  dataAgenda: string;
  status?: string;
  observacoes?: string;
  doador?: { id?: number; nome?: string };
  unidadeColeta?: { id?: number; nome?: string };
  unidade?: { id?: number; nome?: string };
}

export interface Mensagem {
  texto: string;
  tipo: 'erro' | 'sucesso';
}
