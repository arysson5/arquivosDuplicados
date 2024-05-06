const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Lista de pastas a serem excluídas da busca
const excludeFolders = ['TERMOGRAFIA', 'ARTS', '- RELATÓRIO RESUMO', '- DOCUMENTAÇÃO', 'MULTIPLAN - TI - DESCARREGAMENTO', 'RELATÓRIOS','📌 OBSOLETO'];

// Criar interface de leitura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Array para armazenar os shoppings inseridos pelo usuário
const shoppings = [];

// Função para solicitar o ano e o nome do shopping ao usuário
function askShoppingInfo(callback) {
    
        rl.question('Digite o shopping: ', (shopping) => {
            shoppings.push({shopping });
            rl.question('Deseja adicionar mais um shopping? (S/N): ', (answer) => {
                if (answer.toLowerCase() === 's') {
                    askShoppingInfo(callback); // Chama novamente para adicionar outro shopping
                } else {
                    callback(); // Chama a função de busca quando o usuário não quiser adicionar mais shoppings
                }
            });
        });
   
}

// Inicia o processo de adicionar shoppings
rl.question('Digite o ano: ', (year) => {
askShoppingInfo(() => {
    const shoppingNames = shoppings.map(shopping => shopping.shopping);

        const rootDir = '\\\\bgf-nas\\';
        rl.question('Digite o nome do arquivo de saída: ', (outputFileName) => {
            const outputFilePath = outputFileName + '.txt'; // Nome do arquivo de saída
        

        function findDuplicateFiles(rootDir, year, outputFilePath) {
            console.log(`Iniciando busca por arquivos duplicados para o ano ${year} na rede Multiplan`);

            const filesMap = new Map(); // Mapa para armazenar o nome do arquivo e a quantidade de vezes que se repete
            const outputLines = []; // Array para armazenar as linhas a serem escritas no arquivo de saída

            // Função recursiva para explorar pastas e arquivos
            function exploreDir(dir) {
                console.log(`Explorando pasta: ${dir}`);

                const files = fs.readdirSync(dir); // Listar arquivos e pastas no diretório

                for (const file of files) {
                    const filePath = path.join(dir, file); // Caminho completo do arquivo ou pasta

                    if (fs.statSync(filePath).isDirectory()) {
                        // Verificar se a pasta deve ser excluída da busca
                        if (excludeFolders.includes(file)) {
                            console.log(`Pasta ${file} está na lista de exclusão. Ignorando.`);
                            continue; // Pular esta pasta
                        }

                        // Se não for uma pasta excluída, chamar recursivamente a função para explorar
                        exploreDir(filePath);
                    } else {
                        // Se for um arquivo, verificar se já existe no mapa
                        const fileName = path.basename(file); // Nome do arquivo
                        const fileFullPath = path.join(dir, file); // Caminho completo do arquivo
                        const pasta = extrairNomeShoppping(fileFullPath);
                        
                        if (shoppingNames.includes(pasta)) {
                        if (filesMap.has(fileName) ) {

                           
                            // Se o arquivo já existir no mapa, incrementar a contagem de repetições e adicionar o caminho ao array
                            const fileData = filesMap.get(fileName);
                        const pastaDiferente = !fileData.folder.includes(pasta);

                                if (pastaDiferente) {
                                    console.log("Arquivo duplicado encontrado")
                                    fileData.count++;
                                    fileData.paths.push(fileFullPath);
                                    fileData.folder.push(pasta);
                                    filesMap.set(fileName, fileData);
                                }
                            
                        }else {
                            // Se o arquivo não existir no mapa, adicioná-lo ao mapa com contagem 1 e o caminho em um array
                            filesMap.set(fileName, { count: 1, paths: [fileFullPath], folder: [pasta] });
                        }
                        }else{
                            console.log('Arquivo sem pasta associada');
                        } 
                    }
                }
            }

            // Montar o caminho completo com base no ano e no nome do shopping e iniciar a exploração da pasta raiz
            const rootPath = path.join(rootDir, 'Auditoria', year, 'CLIENTES', 'MULTIPLAN');
            exploreDir(rootPath);

            // Montar o conteúdo a ser escrito no arquivo de saída
            for (const [fileName, fileData] of filesMap.entries()) {
                if (fileData.count > 1 && fileData.count < 20) { // Modificado para verificar se a contagem está entre 3 e 9
                    outputLines.push(`Arquivo duplicado encontrado (${fileData.count} vezes): ${fileName}`);
                    outputLines.push('Clientes:');
                    fileData.folder.forEach((folder, index) => {
                        outputLines.push(`  ${index + 1}. ${folder}`);
                    });
                    outputLines.push('Caminhos:');
                    fileData.paths.forEach((filePath, index) => {
                        outputLines.push(`  ${index + 1}. ${filePath}`);
                    });
                    outputLines.push(''); // Adicionar linha em branco entre os resultados
                    console.log(`Arquivo duplicado adicionado ao relatório: ${fileName}`);
                }
            }

            function extrairNomeShoppping(caminhoArquivo) {
                const regex = /\\Auditoria\\2023\\CLIENTES\\MULTIPLAN\\([^\\]+)\\/;
                const resultado = caminhoArquivo.match(regex);

                if (resultado && resultado.length > 1) {
                    return resultado[1];
                } else {
                    return null;
                }
            }

            // Escrever o conteúdo no arquivo de saída
            console.log("Criando arquivo de resultados duplicados...");
            fs.writeFileSync(outputFilePath, outputLines.join('\n'));
            console.log(`Resultados exportados para ${outputFilePath}`);

            // Fechar a interface de leitura
            rl.close();
        }

        // Chamar a função para buscar duplicatas no caminho especificado e exportar os resultados
        findDuplicateFiles(rootDir, year, outputFilePath);
    });
});
    
});
