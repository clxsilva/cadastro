/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose
 */

// importação do mongoose
const mongoose = require('mongoose')

// configuração do banco de dados
// ip/link do servidor, autenticação, nome do banco
// ao final da url, definir o nome do banco de dados
// exemplo: /dbclientes
const url = ''

// validação (evitar a abertura de várias conexões)
let conectado = false

// método para conectar com o banco de dados
const conectar = async () => {
    // se não estiver conectado
    if (!conectado) {
        // conectar com o banco de dados
        try {
            await mongoose.connect(url) // conectar
            conectado = true // setar a variável
            console.log("MongoDB Connect")
        } catch (error) {
            // tratamento de exceções específicas
            if (error.code = 110000) {
                console.log(`Erro: O CPF ${cpfCli} já está cadastrado`)
            } else {
                console.error(error)
            }
        }
    }
}

// método para desconectar com o banco de dados
const desconectar = async () => {
    // se estiver conectado
    if (conectado) {
        // desconectar
        try {
            await mongoose.disconnect(url) // desconectar
            conectado = false // setar a variável
            console.log("MongoDB Desconnect")
        } catch (error) {
            console.error(error)
        }
    }
}

// exportar para o main os métodos conectar e desconectar
module.exports = { conectar, desconectar }