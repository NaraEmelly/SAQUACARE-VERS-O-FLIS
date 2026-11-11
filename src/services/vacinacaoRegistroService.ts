export type OrigemRegistroVacinal = "caderneta" | "comprovante";

export interface RegistroDoseVacinal {
    id: string;
    vacina: string;
    dose: string;
    dataAplicacao: string;
    unidade: string;
    lote: string;
    observacoes: string;
    origem: OrigemRegistroVacinal;
}

const STORAGE_PREFIX = "saquacare:registros-vacinais:v1";
const USUARIO_STORAGE_KEY = "@SaquaCare:user";
export const REGISTROS_VACINAIS_ATUALIZADOS =
    "saquacare:registros-vacinais-atualizados";

function obterChaveArmazenamento(): string {
    const usuarioSalvo = localStorage.getItem(USUARIO_STORAGE_KEY);
    if (!usuarioSalvo) return `${STORAGE_PREFIX}:perfil-local`;

    let usuario: unknown;
    try {
        usuario = JSON.parse(usuarioSalvo);
    } catch {
        throw new Error("Não foi possível identificar a conta para carregar as doses.");
    }

    if (
        typeof usuario !== "object" ||
        usuario === null ||
        !("id" in usuario) ||
        (typeof usuario.id !== "string" && typeof usuario.id !== "number")
    ) {
        return `${STORAGE_PREFIX}:perfil-local`;
    }

    return `${STORAGE_PREFIX}:conta-${encodeURIComponent(String(usuario.id))}`;
}

function validarRegistro(registro: unknown): registro is RegistroDoseVacinal {
    if (typeof registro !== "object" || registro === null) return false;

    const item = registro as Record<string, unknown>;
    return (
        typeof item.id === "string" &&
        typeof item.vacina === "string" &&
        typeof item.dose === "string" &&
        typeof item.dataAplicacao === "string" &&
        typeof item.unidade === "string" &&
        typeof item.lote === "string" &&
        typeof item.observacoes === "string" &&
        (item.origem === "caderneta" || item.origem === "comprovante")
    );
}

export function carregarRegistrosVacinais(): RegistroDoseVacinal[] {
    const bruto = localStorage.getItem(obterChaveArmazenamento());
    if (!bruto) return [];

    let dados: unknown;
    try {
        dados = JSON.parse(bruto);
    } catch {
        throw new Error("Os registros de vacinação salvos estão inválidos.");
    }

    if (!Array.isArray(dados) || !dados.every(validarRegistro)) {
        throw new Error("Os registros de vacinação salvos estão inválidos.");
    }

    return dados;
}

export function salvarRegistrosVacinais(
    registros: RegistroDoseVacinal[]
): void {
    try {
        localStorage.setItem(
            obterChaveArmazenamento(),
            JSON.stringify(registros)
        );
    } catch (erro) {
        if (erro instanceof Error && erro.message.includes("identificar a conta")) {
            throw erro;
        }
        throw new Error(
            "Não foi possível salvar os registros neste navegador. Verifique o espaço disponível e tente novamente."
        );
    }

    window.dispatchEvent(new Event(REGISTROS_VACINAIS_ATUALIZADOS));
}
