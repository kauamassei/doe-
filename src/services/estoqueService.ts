import { api } from './api';

// Sem tela por enquanto; pronto para uso quando houver.
export const estoqueService = {
  criar: (idUnidade: number, corpo: unknown) => api.post<unknown>(`/estoque/criar/${idUnidade}`, corpo),
  listar: () => api.get<unknown[]>('/estoque/buscar'),
  buscarPorId: (id: number) => api.get<unknown>(`/estoque/buscar/${id}`),
  alterar: (id: number, corpo: unknown) => api.put<unknown>(`/estoque/alterar/${id}`, corpo),
  deletar: (id: number) => api.delete<void>(`/estoque/deletar/${id}`),
};
