import { useCallback, useEffect, useMemo, useState } from 'react';
import Aviso from '../components/Aviso';
import { doadorService } from '../services/doadorService';
import { agendaService } from '../services/agendaService';
import { ApiError } from '../services/api';
import type { Agendamento, Doador, Mensagem } from '../types';

function formatarData(valor: string): string {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleString('pt-BR');
}

export default function Painel() {
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [d, a] = await Promise.all([doadorService.listar(), agendaService.listar()]);
      setDoadores(d);
      setAgendamentos(a);
      setMensagem(null);
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível carregar os dados.';
      setMensagem({ texto, tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const doadoresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const digitos = termo.replace(/\D/g, '');
    return doadores.filter(
      (d) => d.nome.toLowerCase().includes(termo) || (digitos !== '' && d.cpf.replace(/\D/g, '').includes(digitos)),
    );
  }, [doadores, busca]);

  async function cancelar(id: number) {
    if (!window.confirm('Tem certeza de que deseja cancelar este agendamento?')) return;
    try {
      await agendaService.cancelar(id);
      setAgendamentos(await agendaService.listar());
      setMensagem({ texto: 'Agendamento cancelado.', tipo: 'sucesso' });
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível cancelar o agendamento.';
      setMensagem({ texto, tipo: 'erro' });
    }
  }

  return (
    <main className="pagina-interna">
      <section className="titulo-secao">
        <p className="etiqueta">Área demonstrativa</p>
        <h1>Painel de cadastros</h1>
        <p>Consulte os doadores e os agendamentos registrados no sistema.</p>
      </section>

      <Aviso mensagem={mensagem} />

      <section className="resumo-cartoes">
        <article className="cartao">
          <p className="numero">{doadores.length}</p>
          <p>Doadores cadastrados</p>
        </article>
        <article className="cartao">
          <p className="numero">{agendamentos.length}</p>
          <p>Agendamentos registrados</p>
        </article>
      </section>

      <section className="secao">
        <div className="linha-titulo">
          <h2>Doadores</h2>
          <input className="busca" type="search" placeholder="Buscar por nome ou CPF"
            value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="tabela-responsiva">
          <table>
            <thead>
              <tr><th>Nome</th><th>CPF</th><th>E-mail</th><th>Telefone</th><th>Tipo sanguíneo</th></tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={5}>Carregando...</td></tr>
              ) : doadoresFiltrados.length === 0 ? (
                <tr><td colSpan={5}>Nenhum doador encontrado.</td></tr>
              ) : (
                doadoresFiltrados.map((d) => (
                  <tr key={d.id ?? d.cpf}>
                    <td>{d.nome}</td>
                    <td>{d.cpf}</td>
                    <td>{d.email}</td>
                    <td>{d.telefone}</td>
                    <td>{d.tipoSanguineo || 'Não informado'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="secao">
        <h2>Agendamentos</h2>
        <div className="tabela-responsiva">
          <table>
            <thead>
              <tr><th>Doador</th><th>Unidade</th><th>Data e horário</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={5}>Carregando...</td></tr>
              ) : agendamentos.length === 0 ? (
                <tr><td colSpan={5}>Nenhum agendamento registrado.</td></tr>
              ) : (
                agendamentos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.doador?.nome ?? '—'}</td>
                    <td>{(a.unidadeColeta ?? a.unidade)?.nome ?? '—'}</td>
                    <td>{formatarData(a.dataAgenda)}</td>
                    <td>{a.status ?? '—'}</td>
                    <td>
                    <button
  type="button"
  className="botao-tabela"
  onClick={() => cancelar(a.id)}
  disabled={a.status === 'CANCELADO'}
>
  Cancelar
</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="aviso-painel">
        Atenção: este painel não possui login. Não use dados pessoais reais neste ambiente de demonstração.
      </p>
    </main>
  );
}
