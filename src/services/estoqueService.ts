import { api } from './api';
import type { Estoque, NovoEstoque } from '../types';

export const estoqueService = {
  criar: (idUnidade: number, estoque: NovoEstoque) =>
    api.post<Estoque>(`/estoque/criar/${idUnidade}`, estoque),
  listar: () => api.get<Estoque[]>('/estoque/buscar'),
  buscarPorId: (id: number) => api.get<Estoque>(`/estoque/buscar/${id}`),
  alterar: (id: number, estoque: Partial<Estoque>) => api.put<Estoque>(`/estoque/alterar/${id}`, estoque),
  deletar: (id: number) => api.delete<void>(`/estoque/deletar/${id}`),
};
