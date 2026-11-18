import { api } from './api';
import type { Agendamento } from '../types';

export const agendaService = {
  listar: () => api.get<Agendamento[]>('/agenda/buscar'),
  buscarPorId: (id: number) => api.get<Agendamento>(`/agenda/buscar/${id}`),
  alterar: (id: number, agendamento: Partial<Agendamento>) =>
    api.put<Agendamento>(`/agenda/alterar/${id}`, agendamento),
  cancelar: (id: number) => api.delete<void>(`/agenda/cancelar/${id}`),
};
