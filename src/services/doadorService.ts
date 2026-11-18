import { api } from './api';
import type { Agendamento, Doador, NovoAgendamento } from '../types';

export const doadorService = {
  criar: (doador: Doador) => api.post<Doador>('/doador/criar', doador),
  listar: () => api.get<Doador[]>('/doador/buscar'),
  buscarPorId: (id: number) => api.get<Doador>(`/doador/buscar/${id}`),
  alterar: (id: number, doador: Doador) => api.put<Doador>(`/doador/alterar/${id}`, doador),
  deletar: (id: number) => api.delete<void>(`/doador/deletar/${id}`),
  doacoes: (idDoador: number) => api.get<unknown[]>(`/doador/${idDoador}/doacoes`),

  agendar: (idDoador: number, idUnidade: number, agendamento: NovoAgendamento) =>
    api.post<Agendamento>(`/doador/${idDoador}/agendar/${idUnidade}`, agendamento),
  cancelarAgendamento: (idDoador: number, idAgendamento: number) =>
    api.delete<void>(`/doador/${idDoador}/cancelar/${idAgendamento}`),

  // Não existe endpoint de busca por CPF: listamos e filtramos no cliente.
  // Se o backend ganhar GET /doador/buscar?cpf=..., troque aqui.
  async buscarPorCpf(cpf: string): Promise<Doador | undefined> {
    const digitos = cpf.replace(/\D/g, '');
    const doadores = await this.listar();
    return doadores.find((d) => d.cpf.replace(/\D/g, '') === digitos);
  },
};
