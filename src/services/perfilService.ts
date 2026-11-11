export type TipoDocumento = "CPF" | "RG" | "CNH";

export interface PerfilData {
    foto: string;
    nome: string;
    telefone: string;
    endereco: string;
    email: string;
    tipoDocumento: TipoDocumento;
    documento: string;
    cartaoSus: string;
    deficiencia: string;
    dataNascimento: string;
}

const STORAGE_KEY = "saquacare:perfil";

export const PERFIL_ATUALIZADO_EVENTO = "saquacare:perfil-atualizado";

export const PERFIL_PADRAO: PerfilData = {
    foto: "",
    nome: "",
    telefone: "",
    endereco: "",
    email: "",
    tipoDocumento: "CPF",
    documento: "",
    cartaoSus: "",
    deficiencia: "",
    dataNascimento: "",
};

export async function carregarPerfil(): Promise<PerfilData> {
    try {
        const bruto = localStorage.getItem(STORAGE_KEY);

        if (!bruto) {
            return { ...PERFIL_PADRAO };
        }

      
        return { ...PERFIL_PADRAO, ...JSON.parse(bruto) };
    } catch {
        return { ...PERFIL_PADRAO };
    }
}

export async function salvarPerfil(dados: PerfilData): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch {
        throw new Error("Não foi possível gravar os dados no navegador.");
    }

    window.dispatchEvent(new Event(PERFIL_ATUALIZADO_EVENTO));
}

export async function sincronizarPerfilUsuario(dados: {
    nome: string;
    cpf: string;
    numeroSus: string;
    dataNascimento: string;
    email: string;
    telefone: string;
    endereco: string;
}): Promise<void> {
    const perfil = await carregarPerfil();

    await salvarPerfil({
        ...perfil,
        nome: dados.nome,
        documento: dados.cpf,
        cartaoSus: dados.numeroSus,
        dataNascimento: dados.dataNascimento,
        email: dados.email,
        telefone: dados.telefone,
        endereco: dados.endereco,
        tipoDocumento: "CPF",
    });
}
