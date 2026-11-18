import { Link } from 'react-router-dom';

export default function PorqueDoar() {
  return (
    <main className="pagina-interna">
      <section className="titulo-secao">
        <p className="etiqueta">Informação também salva vidas</p>
        <h1>Por que doar sangue?</h1>
        <p>
          O sangue é essencial em diversos tratamentos e não pode ser produzido artificialmente. Por isso, as
          doações são importantes para manter os estoques dos serviços de saúde.
        </p>
      </section>

      <section className="cartoes">
        <article className="cartao">
          <h2>Ajuda outras pessoas</h2>
          <p>Uma doação pode ser separada em componentes e contribuir para o tratamento de diferentes pacientes.</p>
        </article>
        <article className="cartao">
          <h2>Atende emergências</h2>
          <p>Acidentes, cirurgias e alguns tratamentos podem precisar de transfusões de sangue.</p>
        </article>
        <article className="cartao">
          <h2>Os estoques precisam de reposição</h2>
          <p>Os componentes do sangue têm prazo de validade. Doações regulares ajudam a manter os estoques.</p>
        </article>
      </section>

      <section className="secao">
        <h2>Requisitos básicos</h2>
        <ul className="lista-informativa">
          <li>Estar em boas condições de saúde.</li>
          <li>Ter idade e peso dentro dos critérios definidos pelo serviço de saúde.</li>
          <li>Apresentar documento oficial com foto.</li>
          <li>Passar pela entrevista e pela triagem realizadas no local.</li>
        </ul>
        <p className="nota">
          Os critérios podem variar conforme as normas vigentes e a avaliação da equipe responsável. Consulte o
          hemocentro antes de se deslocar.
        </p>
      </section>

      <section className="secao">
        <h2>Etapas da doação</h2>
        <ol className="etapas">
          <li><strong>Cadastro:</strong> informe seus dados pessoais.</li>
          <li><strong>Agendamento:</strong> escolha uma unidade e um horário pretendido.</li>
          <li><strong>Triagem:</strong> a equipe avalia se você pode doar naquele dia.</li>
          <li><strong>Doação:</strong> a coleta é feita por profissionais de saúde.</li>
          <li><strong>Recuperação:</strong> siga as orientações da equipe antes de ir embora.</li>
        </ol>
      </section>

      <Link className="botao" to="/cadastro">Quero me cadastrar</Link>
    </main>
  );
}
