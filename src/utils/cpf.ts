export function validarCPF(cpfEntrada: string): boolean {
    const cpf = cpfEntrada.replace(/[^\d]+/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
 
    let soma = 0;
    let resto;
 
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = soma % 11;
    resto = resto < 2 ? 0 : 11 - resto;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = soma % 11;
    resto = resto < 2 ? 0 : 11 - resto;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}