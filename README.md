# Doe+ — Frontend (React + TypeScript + Vite)

Conversão do projeto HTML/CSS/JS original para React, integrado ao backend Spring Boot.

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se o back não estiver em localhost:8080
npm run dev            # http://localhost:5173
```

## CORS no Spring Boot

O front roda em `http://localhost:5173`, então o back precisa liberar essa origem:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

## Estrutura

```
src/
  assets/        imagens originais
  components/    Layout, Header, Footer, Aviso (mensagem de erro/sucesso)
  pages/         Home, PorqueDoar, Cadastro, Agendamento, Painel
  services/      api.ts (cliente HTTP) + um service por grupo de endpoints
  styles/        style.css (original, intacto) + app.css (pequenos acréscimos)
  types/         interfaces TypeScript (Doador, UnidadeColeta, Agendamento)
  utils/         máscaras (CPF, telefone, CEP) e validações
```

## Telas x endpoints

| Tela | Endpoints usados |
|---|---|
| Cadastro | `POST /doador/criar` |
| Agendamento | `GET /unidade-coleta/buscar`, `GET /doador/buscar` (para achar o doador pelo CPF), `POST /doador/{idDoador}/agendar/{idUnidade}` |
| Painel | `GET /doador/buscar`, `GET /agenda/buscar`, `DELETE /agenda/cancelar/{id}` |

Os services de **doações** e **estoque** já estão criados em `src/services`, mas sem tela.

## Pontos para conferir com os DTOs do backend

Não tive acesso aos DTOs, então estas partes são suposições e ficam concentradas em `src/types/index.ts` e `src/services/`:

1. **Doador**: o JSON enviado usa os mesmos nomes dos campos do formulário (`nome`, `cpf`, `nascimento`, `email`, `telefone`, `sexo`, `tipoSanguineo`, `cep`, `endereco`, `observacoes`). O CPF vai só com dígitos.
2. **Agendar**: o corpo enviado é `{ dataHora: "2026-11-20T10:00", observacoes }`.
3. **Unidade de coleta**: o front espera `id` e `nome` (e opcionalmente `endereco` e `cidade`).
4. **Agendamento (resposta)**: o painel lê `id`, `dataHora`, `status`, `doador.nome` e `unidadeColeta.nome` (ou `unidade.nome`). Se a sua entidade devolve outro formato, ajuste em `Painel.tsx`.
5. **Busca por CPF**: não existe endpoint para isso, então o front lista todos os doadores e filtra. Se criarem algo como `GET /doador/buscar?cpf=`, troque em `doadorService.buscarPorCpf`.
6. **Mensagens de erro**: `api.ts` mostra o campo `message` (ou `mensagem`/`error`) da resposta de erro do Spring.

## O que mudou em relação ao original

- `db.js` (localStorage) foi removido; tudo passa pelo backend.
- A checagem de CPF/e-mail duplicado agora é responsabilidade do back; o front mostra a mensagem que ele devolver.
- Unidades de coleta vêm do banco, em vez de ficarem fixas no HTML.
- O botão "Apagar dados de teste" do painel virou "Cancelar" em cada agendamento.
- Textos que diziam "demonstrativo/salvo neste navegador" foram ajustados onde deixaram de ser verdade.
