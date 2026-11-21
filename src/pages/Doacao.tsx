import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Aviso from '../components/Aviso';
import { agendaService } from '../services/agendaService';
import { doacaoService } from '../services/doacaoService';
import { ApiError } from '../services/api';
import { agoraLocalInput, formatarDataHora, formatarMl } from '../utils/format';
import type { Agendamento, Doacao, Mensagem } from '../types';

function formInicial() {
  return {
    idAgendamento: '',
    dataDoacao: agoraLocalInput(),
    volumeSanguineo: '',
    pressaoArterial: '',
    temperatura: '',
    hemoglobina: '',
    aptidao: true,
  };
}

function rotuloAgendamento(a: Agendamento): string {
  const partes = [`#${a.id}`, formatarDataHora(a.dataAgenda)];
  if (a.doador?.nome) partes.push(a.doador.nome);
  const unidade = (a.unidadeColeta ?? a.unidade)?.nome;
  if (unidade) partes.push(unidade);
  return partes.join(' — ');
}

export default function RegistroDoacao() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(formInicial);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [enviando, setEnviando] = useState(false);

  const maximo = useMemo(agoraLocalInput, []);

  function mostrar(nova: Mensagem) {
    setMensagem(nova);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const carregar = useCallback(async () => {
    try {
      const [a, d] = await Promise.all([agendaService.listar(), doacaoService.listar()]);
      setAgendamentos(a);
      setDoacoes(d);
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

  // Só entram agendamentos que ainda não foram cancelados nem realizados e não têm doação registrada.
  const disponiveis = useMemo(() => {
    const comDoacao = new Set(doacoes.map((d) => d.agendamento?.id));
    return agendamentos.filter((a) => {
      const status = (a.status ?? '').toUpperCase();
      return status !== 'CANCELADO' && status !== 'REALIZADO' && !comDoacao.has(a.id);
    });
  }, [agendamentos, doacoes]);

  const volumeTotal = useMemo(
    () => doacoes.reduce((soma, d) => soma + (Number(d.volumeSanguineo) || 0), 0),
    [doacoes],
  );

  function validar(): string | null {
    if (!form.idAgendamento) return 'Selecione o agendamento.';
    if (!form.dataDoacao || new Date(form.dataDoacao) > new Date()) {
      return 'Informe a data e o horário da doação (não pode ser no futuro).';
    }
    const volume = Number(form.volumeSanguineo);
    if (form.volumeSanguineo === '' || !Number.isInteger(volume) || volume < 0 || volume > 1000) {
      return 'Informe o volume coletado em mL (número inteiro).';
    }
    if (form.aptidao && volume === 0) return 'Para um doador apto, informe o volume coletado.';
    if (!/^\d{2,3}\/\d{2,3}$/.test(form.pressaoArterial)) return 'Informe a pressão arterial no formato 120/80.';
    const temperatura = Number(form.temperatura);
    if (form.temperatura === '' || Number.isNaN(temperatura) || temperatura < 30 || temperatura > 45) {
      return 'Informe uma temperatura válida, em °C.';
    }
    const hemoglobina = Number(form.hemoglobina);
    if (form.hemoglobina === '' || Number.isNaN(hemoglobina) || hemoglobina < 3 || hemoglobina > 25) {
      return 'Informe a hemoglobina em g/dL.';
    }
    return null;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();

    const erro = validar();
    if (erro) {
      mostrar({ texto: erro, tipo: 'erro' });
      return;
    }

    setEnviando(true);
    try {
      await doacaoService.criar(Number(form.idAgendamento), {
        dataDoacao: form.dataDoacao,
        volumeSanguineo: Number(form.volumeSanguineo),
        pressaoArterial: form.pressaoArterial,
        temperatura: Number(form.temperatura),
        hemoglobina: Number(form.hemoglobina),
        aptidao: form.aptidao,
      });
      mostrar({ texto: 'Doação registrada com sucesso!', tipo: 'sucesso' });
      setForm(formInicial());
      await carregar();
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível registrar a doação.';
      mostrar({ texto, tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm('Tem certeza de que deseja excluir este registro de doação?')) return;
    try {
      await doacaoService.deletar(id);
      await carregar();
      mostrar({ texto: 'Registro de doação excluído.', tipo: 'sucesso' });
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível excluir a doação.';
      mostrar({ texto, tipo: 'erro' });
    }
  }

  return (
    <main className="pagina-interna">
      <section className="titulo-secao">
        <p className="etiqueta">Atendimento no hemocentro</p>
        <h1>Registrar doação</h1>
        <p>Escolha o agendamento e informe os dados da triagem e da coleta.</p>
      </section>

      <Aviso mensagem={mensagem} />

      <section className="resumo-cartoes">
        <article className="cartao">
          <p className="numero">{doacoes.length}</p>
          <p>Doações registradas</p>
        </article>
        <article className="cartao">
          <p className="numero">{formatarMl(volumeTotal)}</p>
          <p>Volume total coletado</p>
        </article>
      </section>

      <section className="secao">
        <h2>Nova doação</h2>
        <form className="formulario formulario-menor" onSubmit={enviar} noValidate>
          <div className="campo campo-largo">
            <label htmlFor="agendamento">Agendamento *</label>
            <select id="agendamento" value={form.idAgendamento} disabled={carregando}
              onChange={(e) => setForm({ ...form, idAgendamento: e.target.value })} required>
              <option value="">
                {carregando ? 'Carregando agendamentos...' : 'Selecione um agendamento'}
              </option>
              {disponiveis.map((a) => (
                <option key={a.id} value={a.id}>{rotuloAgendamento(a)}</option>
              ))}
            </select>
            {!carregando && disponiveis.length === 0 && (
              <p className="carregando">
                Nenhum agendamento disponível. <Link className="link-simples" to="/agendamento">Criar um agendamento</Link>
              </p>
            )}
          </div>

          <div className="campo campo-largo">
            <label htmlFor="dataDoacao">Data e horário da doação *</label>
            <input id="dataDoacao" type="datetime-local" max={maximo}
              value={form.dataDoacao} onChange={(e) => setForm({ ...form, dataDoacao: e.target.value })} required />
          </div>

          <div className="campo">
            <label htmlFor="volume">Volume coletado (mL) *</label>
            <input id="volume" type="number" inputMode="numeric" min={0} max={1000} step={1} placeholder="Ex.: 450"
              value={form.volumeSanguineo} onChange={(e) => setForm({ ...form, volumeSanguineo: e.target.value })} required />
          </div>

          <div className="campo">
            <label htmlFor="pressao">Pressão arterial *</label>
            <input id="pressao" type="text" inputMode="numeric" maxLength={7} placeholder="120/80"
              value={form.pressaoArterial}
              onChange={(e) => setForm({ ...form, pressaoArterial: e.target.value.replace(/[^\d/]/g, '') })} required />
          </div>

          <div className="campo">
            <label htmlFor="temperatura">Temperatura (°C) *</label>
            <input id="temperatura" type="number" inputMode="decimal" step="0.1" min={30} max={45} placeholder="36.5"
              value={form.temperatura} onChange={(e) => setForm({ ...form, temperatura: e.target.value })} required />
          </div>

          <div className="campo">
            <label htmlFor="hemoglobina">Hemoglobina (g/dL) *</label>
            <input id="hemoglobina" type="number" inputMode="decimal" step="0.1" min={3} max={25} placeholder="13.5"
              value={form.hemoglobina} onChange={(e) => setForm({ ...form, hemoglobina: e.target.value })} required />
          </div>

          <label className="aceite campo-largo">
            <input type="checkbox" checked={form.aptidao}
              onChange={(e) => setForm({ ...form, aptidao: e.target.checked })} />{' '}
            <span>Doador apto (triagem aprovada)</span>
          </label>

          <div className="campo-largo">
            <button className="botao" type="submit" disabled={enviando || carregando}>
              {enviando ? 'Registrando...' : 'Registrar doação'}
            </button>
          </div>
        </form>
      </section>

      <section className="secao">
        <h2>Doações registradas</h2>
        <div className="tabela-responsiva">
          <table>
            <thead>
              <tr>
                <th>Data</th><th>Agendamento</th><th>Volume</th><th>Pressão</th>
                <th>Temp.</th><th>Hemoglobina</th><th>Triagem</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={8}>Carregando...</td></tr>
              ) : doacoes.length === 0 ? (
                <tr><td colSpan={8}>Nenhuma doação registrada.</td></tr>
              ) : (
                doacoes.map((d) => (
                  <tr key={d.id}>
                    <td>{formatarDataHora(d.dataDoacao)}</td>
                    <td>{d.agendamento?.id !== undefined ? `#${d.agendamento.id}` : '—'}</td>
                    <td>{formatarMl(Number(d.volumeSanguineo) || 0)}</td>
                    <td>{d.pressaoArterial ?? '—'}</td>
                    <td>{d.temperatura !== undefined && d.temperatura !== null ? `${d.temperatura} °C` : '—'}</td>
                    <td>{d.hemoglobina !== undefined && d.hemoglobina !== null ? `${d.hemoglobina} g/dL` : '—'}</td>
                    <td>
                      <span className={`selo ${d.aptidao ? 'apto' : 'inapto'}`}>
                        {d.aptidao ? 'Apto' : 'Inapto'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="botao-tabela perigo" onClick={() => excluir(d.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
