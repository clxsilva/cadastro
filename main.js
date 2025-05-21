console.log("Processo principal")

// shell (acessar links e aplicações externas)
const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

// Esta linha está relacionada ao preload.js
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clientModel = require('./src/models/Clientes.js')

// Importação da biblioteca nativa do JS para manipular arquivos
const fs = require('fs')

// Importação do pacote jspdf (arquivos pdf) npm install jspdf
const { jspdf, default: jsPDF } = require('jspdf')

// Janela principal
let win
const createWindow = () => {
    // a linha abaixo define o tema (claro ou escuro)
    nativeTheme.themeSource = 'light' //(dark ou light)
    win = new BrowserWindow({
        width: 800,
        height: 600,
        //autoHideMenuBar: true,
        //minimizable: false,
        resizable: false,
        //ativação do preload.js
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')
}

// Janela sobre
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    // a linha abaixo obtém a janela principal
    const main = BrowserWindow.getFocusedWindow()
    let about
    // Estabelecer uma relação hierárquica entre janelas
    if (main) {
        // Criar a janela sobre
        about = new BrowserWindow({
            width: 360,
            height: 200,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: main,
            modal: true
        })
    }
    //carregar o documento html na janela
    about.loadFile('./src/views/sobre.html')
}

// Janela cliente
let client
function clientWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 680,
            //autoHideMenuBar: true,
            //resizable: false,
            parent: main,
            modal: true,
            //ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center() //iniciar no centro da tela   
}

// Iniciar a aplicação
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados (pedido direto do preload.js)
ipcMain.on('db-connect', async (event) => {
    let conectado = await conectar()
    // se conectado for igual a true
    if (conectado) {
        // enviar uma mensagem para o renderizador trocar o ícone, criar um delay de 0.5s para sincronizar a nuvem
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500) //500ms        
    }
})

// IMPORTANTE ! Desconectar do banco de dados quando a aplicação for encerrada.
app.on('before-quit', () => {
    desconectar()
})

// template do menu
const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                click: () => clientWindow()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                click: () => app.quit(),
                accelerator: 'Alt+F4'
            }
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            {
                label: 'Clientes',
                click: () => relatorioClientes()
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do desenvolvedor',
                role: 'toggleDevTools'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on('client-window', () => {
    clientWindow()
})

// ============================================================
// == Clientes - CRUD Create
// recebimento do objeto que contem os dados do cliente

ipcMain.on('new-client', async (event, client) => {
    // Teste de recebimento dos dados do cliente
    console.log(client)

    // Validar CPF antes de continuar
    if (!validarCPF(client.cpfCli)) {
        // Se o CPF for inválido, exibe uma mensagem de erro
        dialog.showMessageBox({
            type: 'error',
            title: "Atenção!",
            message: "CPF inválido. O cadastro não será realizado.",
            buttons: ['OK']
        });
        return;  // Não prosseguir com o cadastro
    }

    // Cadastrar a estrutura de dados no banco de dados MongoDB
    try {
        // Criar uma nova estrutura de dados usando a classe modelo
        const newClient = new clientModel({
            nomeCliente: client.nameCli,
            cpfCliente: client.cpfCli.replace(/[^\d]/g, ''), // Remove a pontuação do CPF
            emailCliente: client.emailCli,
            foneCliente: client.phoneCli,
            cepCliente: client.cepCli,
            logradouroCliente: client.addressCli,
            numeroCliente: client.numberCli,
            complementoCliente: client.complementCli,
            bairroCliente: client.neighborhoodCli,
            cidadeCliente: client.cityCli,
            ufCliente: client.ufCli
        })
        
        // Salvar os dados do cliente no banco de dados
        await newClient.save()

        // Confirmação de cliente adicionado no banco
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form') // Limpar o formulário
            }
        })
    } catch (error) {
        // Tratamento da exceção "CPF duplicado"
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF já cadastrado.\nVerifique o número digitado.",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    // Limpar o campo CPF, foco e borda em vermelho
                }
            })
        } else {
            console.log(error)
        }
    }
})

// == Fim - Clientes - CRUD Create
// ============================================================


// ============================================================
// == Relatório de clientes ===================================
async function relatorioClientes() {
    try {
        // ================================================
        //          Configuração do documento pdf
        // ================================================

        // p (portrait)  l (landscape)
        // a4 (210 mm x 297 mm)
        const doc = new jsPDF('p', 'mm', 'a4')

        // inserir data atual no documento
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        // doc.setFontSize() tamanho da fonte em ponto(= word)
        doc.setFontSize(10)
        // doc.text() escreve um texto no documento
        doc.text(`Data: ${dataAtual}`, 170, 15) //( x,y (mm))
        doc.setFontSize(18)
        doc.text("Relatório de clientes", 15, 30)
        doc.setFontSize(12)
        let y = 50 //variável de apoio
        // cabeçalho da tabela
        doc.text("Nome", 14, y)
        doc.text("Telefone", 85, y)
        doc.text("E-mail", 130, y)
        y += 5
        // desenhar uma linha
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y) // (10 (inicio)_________ 200 (fim))
        y += 10

        // ================================================
        //  Obter a listagem de clientes(ordem alfabética)
        // ================================================

        const clientes = await clientModel.find().sort({ nomeCliente: 1 })
        // teste de recimento (Importante!)
        // console.log(clientes)
        // popular o documento pdf com os clientes cadastrados
        clientes.forEach((c) => {
            // criar uma nova página se y > 280mm (A4 = 297mm)
            if (y > 280) {
                doc.addPage()
                y = 20 //margem de 20mm para iniciar nova folha
                // cabeçalho da tabela
                doc.text("Nome", 14, y)
                doc.text("Telefone", 85, y)
                doc.text("E-mail", 130, y)
                y += 5
                // desenhar uma linha
                doc.setLineWidth(0.5)
                doc.line(10, y, 200, y) // (10 (inicio)_________ 200 (fim))
                y += 10
            }
            doc.text(c.nomeCliente, 15, y)
            doc.text(c.foneCliente, 85, y)
            doc.text(c.emailCliente, 130, y)
            y += 10
        })

        // ================================================
        //         Numeração automática de páginas
        // ================================================

        const pages = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pages; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${pages}`, 105, 290, { align: 'center' })
        }

        // ================================================
        //    Abrir o arquivo pdf no sistema operacional
        // ================================================

        // Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf (importante!)
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf')
        // salvar temporariamente o arquivo
        doc.save(filePath)
        // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}
// == Fim - relatório de clientes =============================
// ============================================================


// ============================================================
// == Crud Read ===============================================

// validação da busca
ipcMain.on('validate-search', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atenção',
        message: 'Preencha o campo de busca',
        buttons: ['OK']
    })
})

ipcMain.on('search-name', async (event, cliSearch) => {
    const cleanCPF = cliSearch.replace(/[^\d]/g, '')
    // teste de recebimento do nome do cliente (passo2)
    console.log(cliSearch)
    try {
        // Passos 3 e 4 (busca dos dados do cliente pelo nome)
        // RegExp (expressão regular 'i' -> insensitive (ignorar letras maiúsculas ou minúsculas)
        const client = await clientModel.find({
            $or: [
                { nomeCliente: new RegExp(cliSearch, 'i') },
                { cpfCliente: cleanCPF }
            ]
        })
        // teste da busca do cliente pelo nome (passos 3 e 4)
        console.log(client)
        // melhoria da experiência do usuário (se não existir um cliente cadastrado enviar uma mensagem ao usuário questionando se ele deseja cadastrar este novo cliente)
        // se o vetor estiver vazio (lenght retorna o tamanho do vetor)
        if (client.length === 0) {
            // questionar o usuário ...
            dialog.showMessageBox({
                type: 'warning',
                title: 'Aviso',
                message: 'Cliente não cadastrado.\nDeseja cadastrar este cliente?',
                defaultId: 0,
                buttons: ['Sim', 'Não'] //[0, 1] defaultId: 0 = Sim
            }).then((result) => {
                // se o botão sim for pressionado
                if (result.response === 0) {
                    // enviar ao rendererCliente um pedido para recortar e copiar o nome do cliente do campo de busca para o campo nome (evitar que o usuário digite o nome novamente)
                    event.reply('set-search', cliSearch)
                } else {
                    // enviar ao rendererCliente um pedido para limpar os campos (reutilzar a api do preload 'reset-form')
                    event.reply('reset-form')
                }
            })
        } else {
            // enviar ao renderizador (rendererCliente) os dados do cliente (passo 5) OBS: não esquecer de converter para string "JSON.stringify"
            event.reply('render-client', JSON.stringify(client))
        }
    } catch (error) {
        console.log(error)
    }
})

// == Fim - Crud Read =========================================
// ============================================================

// ============================================================
// == CRUD Delete =============================================

ipcMain.on('delete-client', async (event, id) => {
    // Exibe uma caixa de diálogo para confirmar a exclusão
    const result = await dialog.showMessageBox(win, {
        type: 'warning',
        title: "Atenção!",
        message: "Tem certeza que deseja excluir este cliente?\nEsta ação não poderá ser desfeita.",
        buttons: ['Cancelar', 'Excluir']
    });

    if (result.response === 1) {
        // Exclui o cliente no banco de dados
        try {
            const delClient = await clientModel.findByIdAndDelete(id);
            // Exibe uma caixa de mensagem de sucesso após a exclusão
            dialog.showMessageBox({
                type: 'info',
                title: "Sucesso",
                message: "Cliente excluído com sucesso!",
                buttons: ['OK']
            });
            event.reply('client-deleted', true) // Envia a resposta ao frontend
            event.reply('reset-form')
        } catch (error) {
            console.error(error)
            dialog.showMessageBox({
                type: 'error',
                title: "Erro",
                message: "Não foi possível excluir o cliente. Tente novamente.",
                buttons: ['OK']
            })
        }
    }
})

// == Fim - Crud delete =======================================
// ============================================================

// ============================================================
// == CRUD - Editar ===========================================

ipcMain.on('update-client', async (event, client) => {
    console.log(client);

    // Verifica se o CPF inserido é válido
    if (!validarCPF(client.cpfCli)) {
        // Caso o CPF seja inválido, bloqueia a edição
        dialog.showMessageBox({
            type: 'error',
            title: "Atenção!",
            message: "CPF inválido. A edição não será permitida.",
            buttons: ['OK']
        });
        return;
    }

    try {
        // Verifica se o CPF já está cadastrado no banco
        const existingClient = await clientModel.findOne({ cpfCliente: client.cpfCli });

        // Se o CPF for encontrado e não for o mesmo cliente (diferença no ID), bloqueia a edição
        if (existingClient && existingClient._id.toString() !== client.idCli) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "Este CPF já está vinculado a outro cliente. Edição não permitida.",
                buttons: ['OK']
            });
            return;
        }

        // Permite editar caso o CPF seja válido e não esteja vinculado a outro cliente
        const updateClient = await clientModel.findByIdAndUpdate(
            client.idCli,
            {
                nomeCliente: client.nameCli,
                cpfCliente: client.cpfCli,
                emailCliente: client.emailCli,
                foneCliente: client.phoneCli,
                cepCliente: client.cepCli,
                logradouroCliente: client.addressCli,
                numeroCliente: client.numberCli,
                complementoCliente: client.complementCli,
                bairroCliente: client.neighborhoodCli,
                cidadeCliente: client.cityCli,
                ufCliente: client.ufCli
            },
            { new: true }
        );

        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Dados do cliente alterados com sucesso.",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form');
            }
        });

    } catch (error) {
        console.log(error);
        dialog.showMessageBox({
            type: 'error',
            title: "Erro!",
            message: "Erro ao tentar atualizar os dados do cliente.",
            buttons: ['OK']
        });
    }
});


function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // Verifica CPF com números repetidos

    let soma = 0;
    let resto;

    // Validação do primeiro dígito
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;

    // Validação do segundo dígito
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
}

// == Fim - Crud update =======================================
// ============================================================