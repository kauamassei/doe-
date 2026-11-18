import { api } from './api';
import type { UnidadeColeta } from '../types';

export const unidadeService = {
  criar: (unidade: Omit<UnidadeColeta, 'id'>) => api.post<UnidadeColeta>('/unidade-coleta/criar', unidade),
  listar: () => api.get<UnidadeColeta[]>('/unidade-coleta/buscar'),
  buscarPorId: (id: number) => api.get<UnidadeColeta>(`/unidade-coleta/buscar/${id}`),
  alterar: (id: number, unidade: Partial<UnidadeColeta>) =>
    api.put<UnidadeColeta>(`/unidade-coleta/alterar/${id}`, unidade),
  deletar: (id: number) => api.delete<void>(`/unidade-coleta/deletar/${id}`),
};
