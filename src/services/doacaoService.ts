import { api } from './api';

// Sem tela por enquanto; pronto para uso quando houver.
export const doacaoService = {
  criar: (idAgendamento: number, corpo?: unknown) => api.post<unknown>(`/doacoes/criar/${idAgendamento}`, corpo),
  listar: () => api.get<unknown[]>('/doacoes/buscar'),
  buscarPorId: (id: number) => api.get<unknown>(`/doacoes/buscar/${id}`),
  deletar: (id: number) => api.delete<void>(`/doacoes/deletar/${id}`),
};
