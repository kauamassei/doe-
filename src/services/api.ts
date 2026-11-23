const BASE_URL: string = (
  import.meta.env.VITE_API_URL ?? "https://doe-1090.onrender.com"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extrairMensagem(resposta: Response): Promise<string> {
  const texto = await resposta.text();
  if (!texto) return `Erro ${resposta.status} ao falar com o servidor.`;
  try {
    const json = JSON.parse(texto);
    return json.message ?? json.mensagem ?? json.error ?? json.erro ?? texto;
  } catch {
    return texto;
  }
}

async function request<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      ...opcoes,
      headers: {
        "Content-Type": "application/json",
        ...(opcoes.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando.",
      0,
    );
  }

  if (!resposta.ok) {
    throw new ApiError(await extrairMensagem(resposta), resposta.status);
  }

  const texto = await resposta.text();
  if (!texto) return undefined as T;

  try {
    return JSON.parse(texto) as T;
  } catch {
    return texto as unknown as T;
  }
}

export const api = {
  get: <T>(caminho: string) => request<T>(caminho),
  post: <T>(caminho: string, corpo?: unknown) =>
    request<T>(caminho, {
      method: "POST",
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    }),
  put: <T>(caminho: string, corpo?: unknown) =>
    request<T>(caminho, {
      method: "PUT",
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    }),
  delete: <T>(caminho: string) => request<T>(caminho, { method: "DELETE" }),
};
