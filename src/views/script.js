function selecionarImagem() {
    let input = document.getElementById('imagem');
    let preview = document.getElementById('preview');

    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.style.backgroundSize = "cover";
            preview.style.backgroundPosition = "center";
        };
        reader.readAsDataURL(input.files[0]); // Lê a imagem como URL
    } else {
        // Limpa a imagem caso não haja seleção
        preview.style.backgroundImage = "";
        preview.style.backgroundColor = "white";
    }
}

function limparFormulario() {
    document.querySelector('form').reset(); // Limpa os campos do formulário

    // Limpa a imagem selecionada
    let preview = document.getElementById('preview');
    let inputImagem = document.getElementById('imagem');

    preview.style.backgroundImage = ""; // Remove a imagem exibida
    preview.style.backgroundColor = "white"; // Restaura a cor de fundo
    inputImagem.value = ""; // Reseta o input de arquivo
}

function buscarCep() {
    let cep = document.getElementById('cep').value.replace("-", "");
    // Valida se o CEP possui apenas números e tem 8 dígitos
    if (/^\d{8}$/.test(cep)) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById('endereco').value = data.logradouro;
                    document.getElementById('bairro').value = data.bairro;
                    document.getElementById('cidade').value = data.localidade;
                    document.getElementById('uf').value = data.uf;
                } else {
                    alert("CEP não encontrado!");
                }
            })
            .catch(error => console.error('Erro ao buscar CEP:', error));
    } else {
        alert("Por favor, insira um CEP válido.");
    }
}
function validarCPF() {
    let cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
    let cpfError = document.getElementById('cpf-error');

    // Valida a estrutura do CPF (11 números e não é um CPF repetido)
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        cpfError.textContent = "CPF inválido! Por favor, insira um CPF real.";
        document.getElementById('cpf').classList.add('error'); // Adiciona a classe de erro
        return false;
    }

    let soma = 0, resto;
    // Validação do primeiro dígito
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        cpfError.textContent = "CPF inválido!";
        document.getElementById('cpf').classList.add('error'); // Adiciona a classe de erro
        return false;
    }
    
    soma = 0;
    // Validação do segundo dígito
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        cpfError.textContent = "CPF inválido!";
        document.getElementById('cpf').classList.add('error'); // Adiciona a classe de erro
        return false;
    }

    // Se a validação for bem-sucedida, remove a classe de erro
    cpfError.textContent = "";
    document.getElementById('cpf').classList.remove('error');
    return true;  // CPF é estruturalmente válido
}

function validarFormulario() {
    if (!validarCPF()) {
        return false; // Se o CPF for inválido, não envia o formulário
    }
    return true; // Permite o envio do formulário se tudo estiver correto
}


