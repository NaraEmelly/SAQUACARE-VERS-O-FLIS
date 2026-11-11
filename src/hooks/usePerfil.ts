import { useEffect, useState } from "react";

import {
    carregarPerfil,
    PERFIL_ATUALIZADO_EVENTO,
    PERFIL_PADRAO,
} from "../services/perfilService";
import type { PerfilData } from "../services/perfilService";

export function usePerfil(): PerfilData {
    const [perfil, setPerfil] = useState<PerfilData>(PERFIL_PADRAO);

    useEffect(() => {
        let ativo = true;

        function atualizar() {
            carregarPerfil().then((dados) => {
                if (ativo) setPerfil(dados);
            });
        }

        atualizar();
        window.addEventListener(PERFIL_ATUALIZADO_EVENTO, atualizar);

        return () => {
            ativo = false;
            window.removeEventListener(PERFIL_ATUALIZADO_EVENTO, atualizar);
        };
    }, []);

    return perfil;
}
