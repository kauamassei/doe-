import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Aviso from '../components/Aviso';
import { estoqueService } from '../services/estoqueService';
import { unidadeService } from '../services/unidadeService';
import { ApiError } from '../services/api';
import { formatarMl } from '../utils/format';
import type { Estoque, Mensagem, UnidadeColeta } from '../types';

const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FORM_VAZIO = { idUnidade: '', tipoSanguineo: '', quantidadeMl: '', capacidadeMl: '' };

function percentual(quantidade: number, capacidade: number): number {
  if (capacidade <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((quantidade / capacidade) * 100)));
}

// Faixas do indicador de nível (ajuste aqui se o hemocentro usar outros limites).
function nivel(pct: number): { texto: string; classe: string } {
  if (pct < 25) return { texto: 'Crítico', classe: 'inapto' };
  if (pct < 50) return { texto: 'Baixo', classe: 'neutro' };
  return { texto: 'Adequado', classe: 'apto' };
}

function Barra({ pct, rotulo }: { pct: number; rotulo: string }) {
  return (
    <div className="barra" role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
      <div className="barra-preenchimento" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function EstoqueSangue() {
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [unidades, setUnidades] = useState<UnidadeColeta[]>([]);
  const [filtroUnidade, setFiltroUnidade] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  function mostrar(nova: Mensagem) {
    setMensagem(nova);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const carregar = useCallback(async () => {
    try {
      const [e, u] = await Promise.all([estoqueService.listar(), unidadeService.listar()]);
      setEstoques(e);
      setUnidades(u);
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível carregar o estoque.';
      setMensagem({ texto, tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function nomeUnidade(e: Estoque): string {
    const id = e.unidadeColeta?.id;
    return e.unidadeColeta?.nome ?? unidades.find((u) => u.id === id)?.nome ?? '—';
  }

  const filtrados = useMemo(
    () => (filtroUnidade ? estoques.filter((e) => String(e.unidadeColeta?.id) === filtroUnidade) : estoques),
    [estoques, filtroUnidade],
  );

  // Soma por tipo sanguíneo (considera a unidade escolhida no filtro, ou todas).
  const resumo = useMemo(
    () =>
      TIPOS_SANGUINEOS.map((tipo) => {
        const registros = filtrados.filter((e) => e.tipoSanguineo === tipo);
        const quantidade = registros.reduce((s, e) => s + (Number(e.quantidadeMl) || 0), 0);
        const capacidade = registros.reduce((s, e) => s + (Number(e.capacidadeMl) || 0), 0);
        return { tipo, quantidade, capacidade, pct: percentual(quantidade, capacidade), temRegistro: registros.length > 0 };
      }),
    [filtrados],
  );

  function validar(): string | null {
    if (editandoId === null && !form.idUnidade) return 'Selecione a unidade de coleta.';
    if (!form.tipoSanguineo) return 'Selecione o tipo sanguíneo.';
    const quantidade = Number(form.quantidadeMl);
    const capacidade = Number(form.capacidadeMl);
    if (form.quantidadeMl === '' || Number.isNaN(quantidade) || quantidade < 0) return 'Informe a quantidade atual em mL.';
    if (form.capacidadeMl === '' || Number.isNaN(capacidade) || capacidade <= 0) return 'Informe a capacidade em mL.';
    if (quantidade > capacidade) return 'A quantidade não pode ser maior que a capacidade.';
    return null;
  }

  function limparFormulario() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  function iniciarEdicao(e: Estoque) {
    setEditandoId(e.id);
    setForm({
      idUnidade: e.unidadeColeta?.id !== undefined ? String(e.unidadeColeta.id) : '',
      tipoSanguineo: e.tipoSanguineo ?? '',
      quantidadeMl: String(e.quantidadeMl ?? ''),
      capacidadeMl: String(e.capacidadeMl ?? ''),
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();

    const erro = validar();
    if (erro) {
      mostrar({ texto: erro, tipo: 'erro' });
      return;
    }

    const corpo = {
      tipoSanguineo: form.tipoSanguineo,
      quantidadeMl: Number(form.quantidadeMl),
      capacidadeMl: Number(form.capacidadeMl),
    };

    setEnviando(true);
    try {
      if (editandoId !== null) {
        // A unidade segue junto no corpo para o backend não perder o vínculo ao alterar.
        await estoqueService.alterar(editandoId, {
          ...corpo,
          ...(form.idUnidade ? { unidadeColeta: { id: Number(form.idUnidade) } } : {}),
        });
        mostrar({ texto: 'Estoque atualizado!', tipo: 'sucesso' });
      } else {
        await estoqueService.criar(Number(form.idUnidade), corpo);
        mostrar({ texto: 'Registro de estoque criado!', tipo: 'sucesso' });
      }
      limparFormulario();
      await carregar();
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível salvar o estoque.';
      mostrar({ texto, tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  }

  async function excluir(id: number) {
    if (!window.confirm('Tem certeza de que deseja excluir este registro de estoque?')) return;
    try {
      await estoqueService.deletar(id);
      if (editandoId === id) limparFormulario();
      await carregar();
      mostrar({ texto: 'Registro de estoque excluído.', tipo: 'sucesso' });
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível excluir o registro.';
      mostrar({ texto, tipo: 'erro' });
    }
  }

  return (
    <main className="pagina-interna">
      <section className="titulo-secao">
        <p className="etiqueta">Banco de sangue</p>
        <h1>Estoque de sangue</h1>
        <p>Acompanhe a quantidade disponível de cada tipo sanguíneo por unidade de coleta.</p>
      </section>

      <Aviso mensagem={mensagem} />

      <section className="secao">
        <div className="linha-titulo">
          <h2>Visão geral</h2>
          <div className="filtro-unidade">
            <select className="busca" aria-label="Filtrar por unidade de coleta" value={filtroUnidade}
              onChange={(e) => setFiltroUnidade(e.target.value)}>
              <option value="">Todas as unidades</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cartoes-estoque">
          {resumo.map((r) => {
            const n = nivel(r.pct);
            return (
              <article className="cartao cartao-estoque" key={r.tipo}>
                <div className="cartao-topo">
                  <span className="tipo">{r.tipo}</span>
                  {r.temRegistro && r.capacidade > 0 && <span className={`selo ${n.classe}`}>{n.texto}</span>}
                </div>
                <Barra pct={r.pct} rotulo={`Nível do estoque ${r.tipo}`} />
                <p className="detalhe">
                  {carregando
                    ? 'Carregando...'
                    : r.temRegistro
                      ? `${formatarMl(r.quantidade)} de ${formatarMl(r.capacidade)} (${r.pct}%)`
                      : 'Sem registro'}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="secao">
        <h2>Registros de estoque</h2>
        <div className="tabela-responsiva">
          <table>
            <thead>
              <tr>
                <th>Unidade</th><th>Tipo</th><th>Quantidade</th><th>Capacidade</th><th>Nível</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={6}>Carregando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6}>Nenhum registro de estoque encontrado.</td></tr>
              ) : (
                filtrados.map((e) => {
                  const quantidade = Number(e.quantidadeMl) || 0;
                  const capacidade = Number(e.capacidadeMl) || 0;
                  const pct = percentual(quantidade, capacidade);
                  return (
                    <tr key={e.id}>
                      <td>{nomeUnidade(e)}</td>
                      <td><strong>{e.tipoSanguineo}</strong></td>
                      <td>{formatarMl(quantidade)}</td>
                      <td>{formatarMl(capacidade)}</td>
                      <td>
                        <div className="celula-nivel">
                          <Barra pct={pct} rotulo={`Nível do estoque ${e.tipoSanguineo}`} />
                          <span>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="acoes-tabela">
                          <button type="button" className="botao-tabela" onClick={() => iniciarEdicao(e)}>Editar</button>
                          <button type="button" className="botao-tabela perigo" onClick={() => excluir(e.id)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="secao" ref={formRef}>
        <h2>{editandoId !== null ? `Editar registro #${editandoId}` : 'Novo registro de estoque'}</h2>
        <form className="formulario formulario-menor" onSubmit={enviar} noValidate>
          <div className="campo campo-largo">
            <label htmlFor="unidade">Unidade de coleta *</label>
            <select id="unidade" value={form.idUnidade} disabled={editandoId !== null}
              onChange={(e) => setForm({ ...form, idUnidade: e.target.value })} required>
              <option value="">Selecione uma unidade</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>

          <div className="campo campo-largo">
            <label htmlFor="tipo">Tipo sanguíneo *</label>
            <select id="tipo" value={form.tipoSanguineo}
              onChange={(e) => setForm({ ...form, tipoSanguineo: e.target.value })} required>
              <option value="">Selecione o tipo</option>
              {TIPOS_SANGUINEOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="quantidade">Quantidade atual (mL) *</label>
            <input id="quantidade" type="number" inputMode="decimal" min={0} step="any" placeholder="Ex.: 4500"
              value={form.quantidadeMl} onChange={(e) => setForm({ ...form, quantidadeMl: e.target.value })} required />
          </div>

          <div className="campo">
            <label htmlFor="capacidade">Capacidade (mL) *</label>
            <input id="capacidade" type="number" inputMode="decimal" min={0} step="any" placeholder="Ex.: 10000"
              value={form.capacidadeMl} onChange={(e) => setForm({ ...form, capacidadeMl: e.target.value })} required />
          </div>

          <div className="campo-largo acao-formulario">
            <button className="botao" type="submit" disabled={enviando}>
              {enviando ? 'Salvando...' : editandoId !== null ? 'Salvar alterações' : 'Criar registro'}
            </button>
            {editandoId !== null && (
              <button type="button" className="botao-tabela" onClick={limparFormulario}>Cancelar edição</button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
