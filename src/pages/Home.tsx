import { Link } from 'react-router-dom';
import ilustracao from '../assets/doe-ilustracao.png';

export default function Home() {
  return (
    <main>
      <section className="destaque inicio-destaque">
        <div className="destaque-conteudo">
          <p className="etiqueta">Doe sangue. Compartilhe vida.</p>
          <h1>
            Tem gestos que fazem <span>toda a diferença.</span>
          </h1>
          <p>
            Doar sangue é um ato de cuidado com alguém que talvez você nunca conheça. O primeiro passo é buscar
            informação e entender como participar.
          </p>
          <div className="acoes-destaque">
            <Link className="botao" to="/cadastro">
              Fazer meu cadastro <span aria-hidden="true">→</span>
            </Link>
            <Link className="link-simples" to="/porque-doar">Entenda por que doar</Link>
          </div>
          <p className="texto-pequeno">
            Uma iniciativa acadêmica para aproximar pessoas da causa da doação de sangue.
          </p>
        </div>
        <div className="destaque-imagem">
          <img src={ilustracao} alt="Ilustração de duas mãos acolhendo uma gota de sangue com um coração" />
          <span className="selo-imagem">Um gesto de cuidado</span>
        </div>
      </section>

      <section className="faixa-mensagem" aria-label="Mensagem do projeto">
        <p>
          O sangue não se fabrica. <strong>A solidariedade faz chegar.</strong>
        </p>
        <span aria-hidden="true">♥</span>
      </section>

      <section className="secao secao-introducao">
        <div className="titulo-secao">
          <p className="etiqueta">Sobre o Doe+</p>
          <h2>Informação, cuidado e vontade de ajudar.</h2>
        </div>
        <div className="introducao-texto">
          <p>
            O Doe+ nasceu como um projeto acadêmico com uma ideia simples: criar um espaço fácil de entender para
            quem deseja conhecer melhor a doação de sangue e registrar seu interesse em participar.
          </p>
          <p>
            Aqui você encontra informações, pode preencher um cadastro e registrar um agendamento. Tudo de um jeito
            direto, sem complicação.
          </p>
        </div>
      </section>

      <section className="secao secao-passos">
        <div className="titulo-secao centralizado">
          <p className="etiqueta">Por onde começar</p>
          <h2>Seu primeiro passo pode ser agora.</h2>
          <p>O Doe+ organiza o começo dessa jornada em etapas simples.</p>
        </div>
        <div className="cartoes cartoes-passos">
          <article className="cartao cartao-passo">
            <span className="numero-passo">01</span>
            <div className="icone-passo" aria-hidden="true">♡</div>
            <h3>Conheça a causa</h3>
            <p>Entenda por que os bancos de sangue precisam de doações e quais cuidados fazem parte do processo.</p>
            <Link to="/porque-doar">Saiba mais <span aria-hidden="true">→</span></Link>
          </article>
          <article className="cartao cartao-passo cartao-passo-destaque">
            <span className="numero-passo">02</span>
            <div className="icone-passo" aria-hidden="true">＋</div>
            <h3>Faça seu cadastro</h3>
            <p>Registre seus dados no projeto para demonstrar seu interesse em se tornar um doador.</p>
            <Link to="/cadastro">Ir para cadastro <span aria-hidden="true">→</span></Link>
          </article>
          <article className="cartao cartao-passo">
            <span className="numero-passo">03</span>
            <div className="icone-passo" aria-hidden="true">⌖</div>
            <h3>Registre uma intenção</h3>
            <p>Depois do cadastro, você pode escolher uma unidade de coleta e um horário para doar.</p>
            <Link to="/agendamento">Ver agendamento <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>

      <section className="secao secao-conversa">
        <div className="conversa-conteudo">
          <p className="etiqueta">Antes de doar</p>
          <h2>Uma boa atitude também começa com informação.</h2>
          <p>
            Nem todo mundo pode doar em qualquer momento. A equipe do hemocentro avalia cada pessoa e orienta sobre
            os critérios, a segurança e os cuidados necessários.
          </p>
          <Link className="botao botao-claro" to="/porque-doar">Conhecer os cuidados</Link>
        </div>
        <div className="conversa-detalhe" aria-hidden="true">
          <span>♥</span>
          <p>
            Doe com cuidado.
            <br />
            Doe com informação.
          </p>
        </div>
      </section>

      <section className="secao chamada-final">
        <p className="etiqueta">Faça parte dessa ideia</p>
        <h2>Talvez o seu próximo gesto seja o mais importante para alguém.</h2>
        <p>Conheça o projeto e registre seu interesse em participar.</p>
        <Link className="botao" to="/cadastro">
          Quero fazer meu cadastro <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
