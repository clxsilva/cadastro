/**
 * preload.js - Usado no framework electron para aumentar a segurança e o desempenho
 */

// Importação dos recursos do framework electron
// IpcRenderer permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// PontextBridge: permissões de comunicação entre processos usando a api do electron
const { ipcRenderer, contextBridge } = require('electron')

// Enviar uma mensagem para o main.js estabelecer uma conexão com o banco de dados quando iniciar a aplicação 
// Send (enviar)
// db-connect (rótulo para identificar a mensagem)
ipcRenderer.send('db-connect')

// Permissões para estabelecer a comunicação entre processos
contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message), aboutExit: () => ipcRenderer.send('about-exit')
})
