import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="rodape">
      <Link className="logo logo-rodape" to="/">
        Doe<span>+</span>
      </Link>
      <p>Projeto acadêmico de incentivo à doação de sangue.</p>
      <p className="rodape-nota">
        Este site é demonstrativo e não substitui o atendimento ou as orientações de um hemocentro.
      </p>
    </footer>
  );
}
