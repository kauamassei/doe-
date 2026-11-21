import { api } from './api';
import type { Doacao, NovaDoacao } from '../types';

export const doacaoService = {
  criar: (idAgendamento: number, doacao: NovaDoacao) =>
    api.post<Doacao>(`/doacoes/criar/${idAgendamento}`, doacao),
  listar: () => api.get<Doacao[]>('/doacoes/buscar'),
  buscarPorId: (id: number) => api.get<Doacao>(`/doacoes/buscar/${id}`),
  deletar: (id: number) => api.delete<void>(`/doacoes/deletar/${id}`),
};
