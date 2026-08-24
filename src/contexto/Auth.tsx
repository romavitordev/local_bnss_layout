import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import type { ReactNode } from "react";
import { api, tokens, type Conta } from "../api/cliente";

type EstadoAuth = {
  conta: Conta | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const Contexto = createContext<EstadoAuth | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [conta, setConta] = useState<Conta | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Restaura a sessão no primeiro render: sem isso, um F5 derruba o usuário.
  useEffect(() => {
    const { acesso } = tokens.ler();
    if (!acesso) {
      setCarregando(false);
      return;
    }
    api
      .eu()
      .then(setConta)
      .catch(() => tokens.limpar())
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    tokens.gravar(await api.entrar(email, senha));
    setConta(await api.eu());
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    tokens.gravar(await api.registrar(nome, email, senha));
    setConta(await api.eu());
  }, []);

  const sair = useCallback(async () => {
    // Revoga no servidor primeiro; se a rede falhar, ainda limpamos o
    // local para nao deixar o usuario preso numa sessao que ele quis encerrar.
    try {
      await api.sair();
    } catch {
      /* servidor fora do ar: segue com a limpeza local */
    }
    tokens.limpar();
    setConta(null);
  }, []);

  const valor = useMemo(
    () => ({ conta, carregando, entrar, registrar, sair }),
    [conta, carregando, entrar, registrar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): EstadoAuth {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAuth precisa estar dentro de <ProvedorAuth>");
  return contexto;
}
