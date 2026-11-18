import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PorqueDoar from './pages/PorqueDoar';
import Cadastro from './pages/Cadastro';
import Agendamento from './pages/Agendamento';
import Painel from './pages/Painel';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/porque-doar" element={<PorqueDoar />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
