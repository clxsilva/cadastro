const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    data_nascimento: { type: Date, required: true },
    sexo: { type: String, required: true },
    cep: { type: String, required: true },
    telefone: { type: String, required: true },
    endereco: { type: String, required: true },
    numero: { type: String, required: true },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    uf: { type: String, required: true },
    email: { type: String, required: true },
    imagem: { type: String } // Caso queira armazenar a URL da imagem
});

module.exports = mongoose.model('Client', clientSchema);
