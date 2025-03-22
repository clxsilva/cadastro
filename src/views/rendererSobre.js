/**
 * Processo de renderizção do documento sobre.html
 */
 
// enviar uma mensagem para o processo principal fechar a janela sobre
function fechar() {
    // Executar a função aboutExit() vinculada ao preload.js, através da api do electron (ipcRenderer)
    api.aboutExit()
}
 