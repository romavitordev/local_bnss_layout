import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import type { ReactNode } from "react";
import { api, restaurar, tokens, type Conta } from "../api/cliente";

type EstadoAuth = {
  conta: Conta | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  /** Relê a conta do servidor. Usado quando algo muda o estado dela por fora
   *  da sessão — o link de verificação de e-mail, por exemplo, que pode ser
   *  aberto em outro aparelho. */
  recarregar: () => Promise<void>;
};

const Contexto = createContext<EstadoAuth | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [conta, setConta] = useState<Conta | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Restaura a sessão no primeiro render: sem isso, um F5 derruba o usuário.
  //
  // No produto isto é uma ida ao servidor levando o cookie `HttpOnly` (A6).
  // Na vitrine não há servidor nem cookie: `restaurar()` só confere a memória,
  // então recarregar volta ao login. É o comportamento honesto para uma
  // demonstração sem backend, e o aviso no rodapé já diz isso.
  useEffect(() => {
    void (async () => {
      try {
        if (await restaurar()) setConta(await api.eu());
      } catch {
        tokens.limpar();
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    tokens.gravar(await api.entrar(email, senha));
    setConta(await api.eu());
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    tokens.gravar(await api.registrar(nome, email, senha));
    setConta(await api.eu());
  }, []);

  const recarregar = useCallback(async () => {
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
    () => ({ conta, carregando, entrar, registrar, sair, recarregar }),
    [conta, carregando, entrar, registrar, sair, recarregar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): EstadoAuth {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useAuth precisa estar dentro de <ProvedorAuth>");
  return contexto;
}
