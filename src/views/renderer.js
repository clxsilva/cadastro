/**
 *  Processo de renderização do documento index.html
 */
console.log("Processo de renderização")

// Inserção da data no rodapé
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

// Trocar do icone do banco de dados (status de conexão)
// Uso da api do preload.js
api.dbStatus((event, message) => {
    // Teste de recebimento da mensagem
    console.log(message)
    if (message === "conectado") {
        document.getElementById('iconeDB').src = "../public/img/dbon.png"
    } else {
        document.getElementById('iconeDB').src = "../public/img/dboff.png"
    }
})

document.getElementById('btnCreate').addEventListener('click', (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const clientData = {
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        data_nascimento: document.getElementById('data_nascimento').value,
        sexo: document.getElementById('sexo').value,
        cep: document.getElementById('cep').value,
        telefone: document.getElementById('telefone').value,
        endereco: document.getElementById('endereco').value,
        numero: document.getElementById('numero').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        uf: document.getElementById('uf').value,
        email: document.getElementById('email').value,
        // Adicione a URL da imagem, se necessário
    };

    // Validação dos campos
    const camposInvalidos = Object.keys(clientData).filter(key => !clientData[key]);

    if (camposInvalidos.length > 0) {
        camposInvalidos.forEach(campo => {
            const elemento = document.getElementById(campo);
            elemento.style.border = '2px solid red'; // Destaque em vermelho
            elemento.setAttribute('placeholder', 'Campo obrigatório'); // Adiciona um placeholder
        });
        alert('Por favor, preencha todos os campos obrigatórios!');
        return; // Impede o cadastro
    }

    // Se todos os campos estiverem preenchidos, pergunta para confirmar o cadastro
    if (confirm('Você tem certeza que deseja cadastrar este cliente?')) {
        // Enviar dados para o main.js
        api.newClient(clientData);
    }
});

// Ouvir a resposta do main.js
ipcRenderer.on('client-saved', (event, response) => {
    alert(response.message);
    if (response.success) {
        limparFormulario();
    }
});

// Limpar destaque ao focar nos campos
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        input.style.border = ''; // Remove o destaque
        input.setAttribute('placeholder', ''); // Remove o placeholder
    });
});

// Ouvir a resposta do main.js
ipcRenderer.on('client-saved', (event, response) => {
    alert(response.message);
    if (response.success) {
        limparFormulario(); // Limpar o formulário após o sucesso
    }
});