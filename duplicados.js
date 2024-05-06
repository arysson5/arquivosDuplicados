const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Lista de pastas a serem excluídas da busca
const excludeFolders = ['TERMOGRAFIA', 'ARTS', '- RELATÓRIO RESUMO', '- DOCUMENTAÇÃO'];

// Criar interface de leitura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Perguntar ao usuário o ano e o nome do shopping
rl.question('Digite o ano: ', (year) => {
    rl.question('Digite o nome do shopping: ', (shopping) => {
        const rootDir = '\\\\bgf-nas\\';
        const outputFilePath = shopping+ 'resultados_duplicados.txt'; // Nome do arquivo de saída

        function findDuplicateFiles(rootDir, year, shopping, outputFilePath) {
            const filesMap = new Map(); // Mapa para armazenar o nome do arquivo e a quantidade de vezes que se repete
            const outputLines = []; // Array para armazenar as linhas a serem escritas no arquivo de saída

            // Função recursiva para explorar pastas e arquivos
            function exploreDir(dir) {
                const files = fs.readdirSync(dir); // Listar arquivos e pastas no diretório

                for (const file of files) {
                    const filePath = path.join(dir, file); // Caminho completo do arquivo ou pasta

                    if (fs.statSync(filePath).isDirectory()) {
                        // Verificar se a pasta deve ser excluída da busca
                        if (excludeFolders.includes(file)) {
                            continue; // Pular esta pasta
                        }

                        // Se não for uma pasta excluída, chamar recursivamente a função para explorar
                        exploreDir(filePath);
                    } else {
                        // Se for um arquivo, verificar se já existe no mapa
                        const fileName = path.basename(file); // Nome do arquivo
                        const fileFullPath = path.join(dir, file); // Caminho completo do arquivo
                        if (filesMap.has(fileName)) {
                            // Se o arquivo já existir no mapa, incrementar a contagem de repetições e adicionar o caminho ao array
                            const fileData = filesMap.get(fileName);
                            fileData.count++;
                            fileData.paths.push(fileFullPath);
                            filesMap.set(fileName, fileData);
                        } else {
                            // Se o arquivo não existir no mapa, adicioná-lo ao mapa com contagem 1 e o caminho em um array
                            filesMap.set(fileName, { count: 1, paths: [fileFullPath] });
                        }
                    }
                }
            }

            // Montar o caminho completo com base no ano e no nome do shopping e iniciar a exploração da pasta raiz
            const rootPath = path.join(rootDir, 'Auditoria', year, 'CLIENTES', 'MULTIPLAN', shopping);
            exploreDir(rootPath);

            // Montar o conteúdo a ser escrito no arquivo de saída
            for (const [fileName, fileData] of filesMap.entries()) {
                if (fileData.count > 2 && fileData.count < 10) { // Modificado para verificar se a contagem está entre 3 e 9
                    outputLines.push(`Arquivo duplicado encontrado (${fileData.count} vezes): ${fileName}`);
                    outputLines.push('Caminhos:');
                    fileData.paths.forEach((filePath, index) => {
                        outputLines.push(`  ${index + 1}. ${filePath}`);
                    });
                    outputLines.push(''); // Adicionar linha em branco entre os resultados
                    console.log("Linha  adicionada ao relatório");
                }
            }

            // Escrever o conteúdo no arquivo de saída
            console.log("Criando arquivo");
            fs.writeFileSync(outputFilePath, outputLines.join('\n'));
            console.log(`Resultados exportados para ${outputFilePath}`);

            // Fechar a interface de leitura
            rl.close();
        }

        // Chamar a função para buscar duplicatas no caminho especificado e exportar os resultados
        findDuplicateFiles(rootDir, year, shopping, outputFilePath);
    });
});
