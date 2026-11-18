import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Aviso from '../components/Aviso';
import ilustracao from '../assets/doe-ilustracao.png';
import { doadorService } from '../services/doadorService';
import { ApiError } from '../services/api';
import { mascaraCep, mascaraCpf, mascaraTelefone } from '../utils/masks';
import { calcularIdade, cpfValido } from '../utils/validators';
import type { Mensagem } from '../types';

const TIPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FORM_VAZIO = {
  nome: '',
  cpf: '',
  nascimento: '',
  email: '',
  telefone: '',
  sexo: '',
  tipoSanguineo: '',
  cep: '',
  endereco: '',
  observacoes: '',
};

type Campo = keyof typeof FORM_VAZIO;

export default function Cadastro() {
  const [form, setForm] = useState(FORM_VAZIO);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [enviando, setEnviando] = useState(false);

  function atualizar(campo: Campo, transformar?: (v: string) => string) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const valor = transformar ? transformar(e.target.value) : e.target.value;
      setForm((anterior) => ({ ...anterior, [campo]: valor }));
    };
  }

  function validar(): string | null {
    if (form.nome.trim().split(/\s+/).length < 2) return 'Digite seu nome e sobrenome.';
    if (!cpfValido(form.cpf)) return 'Confira o CPF informado.';
    if (!form.nascimento || new Date(form.nascimento) >= new Date()) return 'Informe uma data de nascimento válida.';
    const idade = calcularIdade(form.nascimento);
    if (idade < 16 || idade > 69) return 'Para este projeto, o cadastro considera pessoas entre 16 e 69 anos.';
    if (!form.email.includes('@') || !form.email.includes('.')) return 'Informe um e-mail válido.';
    if (form.telefone.replace(/\D/g, '').length < 10) return 'Informe um telefone com DDD.';
    if (!aceitouTermos) return 'Marque a confirmação dos dados para continuar.';
    return null;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();

    const erro = validar();
    if (erro) {
      setMensagem({ texto: erro, tipo: 'erro' });
      return;
    }

    setEnviando(true);
    try {
      await doadorService.criar({
        nome: form.nome.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        nascimento: form.nascimento,
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        sexo: form.sexo,
        tipoSanguineo: form.tipoSanguineo,
        cep: form.cep.trim(),
        endereco: form.endereco.trim(),
        observacoes: form.observacoes.trim(),
      });
      setMensagem({ texto: 'Cadastro realizado! Obrigado por fazer parte do Doe+.', tipo: 'sucesso' });
      setForm(FORM_VAZIO);
      setAceitouTermos(false);
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : 'Não foi possível concluir o cadastro.';
      setMensagem({ texto, tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="pagina-interna pagina-cadastro">
      <section className="cabecalho-cadastro">
        <div>
          <p className="etiqueta">Que bom ter você por aqui</p>
          <h1>Vamos começar pelo seu cadastro.</h1>
          <p>Preencha seus dados com atenção. Os campos marcados com * são obrigatórios.</p>
        </div>
        <img src={ilustracao} alt="Duas mãos acolhem uma gota de sangue com um coração" />
      </section>

      <div className="aviso-formulario">
        <strong>Um aviso importante:</strong> este cadastro faz parte de um projeto acadêmico. Não informe dados
        pessoais reais.
      </div>

      <Aviso mensagem={mensagem} />

      <form className="formulario" onSubmit={enviar} noValidate>
        <div className="formulario-titulo campo-largo">
          <h2>Seus dados</h2>
          <p>Essas informações ajudam a identificar seu registro no projeto.</p>
        </div>

        <div className="campo campo-largo">
          <label htmlFor="nome">Nome completo *</label>
          <input id="nome" name="nome" type="text" autoComplete="name" placeholder="Digite seu nome completo"
            value={form.nome} onChange={atualizar('nome')} required />
        </div>

        <div className="campo">
          <label htmlFor="cpf">CPF *</label>
          <input id="cpf" name="cpf" type="text" inputMode="numeric" maxLength={14} placeholder="000.000.000-00"
            value={form.cpf} onChange={atualizar('cpf', mascaraCpf)} required />
        </div>

        <div className="campo">
          <label htmlFor="nascimento">Data de nascimento *</label>
          <input id="nascimento" name="nascimento" type="date"
            value={form.nascimento} onChange={atualizar('nascimento')} required />
        </div>

        <div className="campo">
          <label htmlFor="email">E-mail *</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com"
            value={form.email} onChange={atualizar('email')} required />
        </div>

        <div className="campo">
          <label htmlFor="telefone">Telefone *</label>
          <input id="telefone" name="telefone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={15}
            placeholder="(11) 99999-9999"
            value={form.telefone} onChange={atualizar('telefone', mascaraTelefone)} required />
        </div>

        <div className="formulario-titulo campo-largo">
          <h2>Mais algumas informações</h2>
          <p>Os campos abaixo são opcionais.</p>
        </div>

        <div className="campo">
          <label htmlFor="sexo">Sexo</label>
          <select id="sexo" name="sexo" value={form.sexo} onChange={atualizar('sexo')}>
            <option value="">Prefiro não informar</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="tipoSanguineo">Tipo sanguíneo</label>
          <select id="tipoSanguineo" name="tipoSanguineo" value={form.tipoSanguineo} onChange={atualizar('tipoSanguineo')}>
            <option value="">Ainda não sei</option>
            {TIPOS_SANGUINEOS.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="cep">CEP</label>
          <input id="cep" name="cep" type="text" inputMode="numeric" maxLength={9} placeholder="00000-000"
            value={form.cep} onChange={atualizar('cep', mascaraCep)} />
        </div>

        <div className="campo campo-largo">
          <label htmlFor="endereco">Endereço</label>
          <input id="endereco" name="endereco" type="text" autoComplete="street-address"
            placeholder="Rua, número, bairro e cidade"
            value={form.endereco} onChange={atualizar('endereco')} />
        </div>

        <div className="campo campo-largo">
          <label htmlFor="observacoes">Observações</label>
          <textarea id="observacoes" name="observacoes" rows={3}
            placeholder="Se quiser, deixe alguma informação adicional"
            value={form.observacoes} onChange={atualizar('observacoes')} />
        </div>

        <label className="aceite campo-largo">
          <input id="termos" type="checkbox" checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)} />{' '}
          <span>Confirmo que os dados informados estão corretos e entendo que este é um projeto demonstrativo.</span>
        </label>

        <div className="campo-largo acao-formulario">
          <button className="botao" type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Finalizar cadastro'} <span aria-hidden="true">→</span>
          </button>
          <Link className="link-simples" to="/">Voltar para o início</Link>
        </div>
      </form>
    </main>
  );
}
