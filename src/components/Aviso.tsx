import type { Mensagem } from '../types';

interface Props {
  mensagem: Mensagem | null;
}

export default function Aviso({ mensagem }: Props) {
  const classes = mensagem ? `mensagem mostrar ${mensagem.tipo}` : 'mensagem';
  return (
    <div className={classes} role="status" aria-live="polite">
      {mensagem?.texto}
    </div>
  );
}
