import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Aviso from '../components/Aviso';
import { doadorService } from '../services/doadorService';
import { unidadeService } from '../services/unidadeService';
import { ApiError } from '../services/api';
import { mascaraCpf } from '../utils/masks';
import type { Mensagem, UnidadeColeta } from '../types';

function dataMinima(): string {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  return agora.toISOString().slice(0, 16);
}

export default function Agendamento() {
  const [unidades, setUnidades] = useState<UnidadeColeta[]>([]);
  const [carregandoUnidades, setCarregandoUnidades] = useState(true);
  const [cpf, setCpf] = useState('');
  const [idUnidade, setIdUnidade] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [enviando, setEnviando] = useState(false);

  const minimo = useMemo(dataMinima, []);

  useEffect(() => {
    unidadeService
      .listar()
      .then(setUnidades)
      .catch((err) => {
        const texto = err instanceof ApiError ? err.message : 'Não foi possível carregar as unidades.';
        setMensagem({ texto, tipo: 'erro' });
      })
      .finally(() => setCarregandoUnidades(false));
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();

    if (cpf.replace(/\D/g, '').length !== 11) {
      setMensagem({ texto: 'Digite o CPF usado no cadastro.', tipo: 'erro' });
      return;
    }
    if (!idUnidade || !dataHora || new Date(dataHora) <= new Date()) {
      setMensagem({ texto: 'Escolha uma unidade e uma data futura.', tipo: 'erro' });
      return;
    }

    setEnviando(true);
    try {
      const doador = await doadorService.buscarPorCpf(cpf);
      if (!doador || doador.id === undefined) {
        setMensagem({ texto: 'Não encontramos esse CPF. Faça seu cadastro na página de cadastro.', tipo: 'erro' });
        return;
      }

      await doadorService.agendar(doador.id, Number(idUnidade), {
        dataHora,
        observacoes: observacoes.trim(),
      });

      setMensagem({ texto: 'Agendamento registrado com sucesso!', tipo: 'sucesso' });
      setCpf('');
      setIdUnidade('');
      setDataHora('');
      setObservacoes('');
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível registrar o agendamento.';
      setMensagem({ texto, tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-interna">
      <section className="titulo-secao">
        <p className="etiqueta">Próximo passo</p>
        <h1>Agende sua doação</h1>
        <p>Para agendar, primeiro você precisa ter feito seu cadastro no Doe+.</p>
      </section>

      <Aviso mensagem={mensagem} />

      <form className="formulario formulario-menor" onSubmit={enviar} noValidate>
        <div className="campo campo-largo">
          <label htmlFor="cpf">CPF cadastrado *</label>
          <input id="cpf" type="text" inputMode="numeric" maxLength={14} placeholder="000.000.000-00"
            value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} required />
        </div>

        <div className="campo campo-largo">
          <label htmlFor="unidade">Unidade de coleta *</label>
          <select id="unidade" value={idUnidade} onChange={(e) => setIdUnidade(e.target.value)}
            disabled={carregandoUnidades} required>
            <option value="">{carregandoUnidades ? 'Carregando unidades...' : 'Selecione uma unidade'}</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>

        <div className="campo campo-largo">
          <label htmlFor="dataHora">Data e horário pretendidos *</label>
          <input id="dataHora" type="datetime-local" min={minimo}
            value={dataHora} onChange={(e) => setDataHora(e.target.value)} required />
        </div>

        <div className="campo campo-largo">
          <label htmlFor="observacoes">Observações</label>
          <textarea id="observacoes" rows={3} placeholder="Opcional"
            value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        <div className="campo-largo">
          <button className="botao" type="submit" disabled={enviando}>
            {enviando ? 'Registrando...' : 'Registrar agendamento'}
          </button>
        </div>
      </form>

      <section className="secao">
        <h2>Unidades disponíveis</h2>
        {carregandoUnidades ? (
          <p className="carregando">Carregando unidades...</p>
        ) : unidades.length === 0 ? (
          <p className="carregando">Nenhuma unidade de coleta cadastrada.</p>
        ) : (
          <div className="cartoes">
            {unidades.map((u) => (
              <article className="cartao" key={u.id}>
                <h3>{u.nome}</h3>
                {(u.endereco || u.cidade) && <p>{[u.endereco, u.cidade].filter(Boolean).join(' — ')}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
