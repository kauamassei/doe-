import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="cabecalho">
      <Link className="logo" to="/" aria-label="Doe+, página inicial">
        Doe<span>+</span>
        <small>um gesto que importa</small>
      </Link>
      <nav className="menu" aria-label="Navegação principal">
        <NavLink to="/" end>Início</NavLink>
        <NavLink to="/porque-doar">Por que doar</NavLink>
        <NavLink to="/agendamento">Agendamento</NavLink>
        <NavLink to="/painel">Painel</NavLink>
        <NavLink className="menu-destaque" to="/cadastro">Cadastro</NavLink>
      </nav>
    </header>
  );
}
