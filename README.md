# Projeto Jaiminho — Auto-preenchimento de Formulários com CNPJ e CEP

Este projeto tem como objetivo implementar o preenchimento automático de dados cadastrais em formulários HTML utilizando a BrasilAPI. A funcionalidade foi aplicada nos arquivos `fornecedor.html`, `cliente.html` e `empresa.html`, com foco em boas práticas de usabilidade, acessibilidade e organização de código.

## Funcionalidades Implementadas

- Consulta automática de dados via CNPJ e CEP utilizando a BrasilAPI
- Sanitização de entradas (aceita apenas dígitos, removendo máscaras)
- Indicadores de carregamento durante requisições (spinner e desabilitação de campos)
- Exibição de mensagens de erro claras para entradas inválidas, falhas de rede e respostas 404
- Acessibilidade básica: uso de `<label>` associado, retorno de foco em caso de erro e `aria-live` para feedback
- Reutilização de funções utilitárias para evitar duplicação de código
- Armazenamento local de cadastros utilizando `localStorage`
- Estrutura modular com HTML, CSS e JavaScript puro (sem bibliotecas externas)

## Como Testar

1. Clone ou baixe este repositório:
git clone https://github.com/seuusuario/jaiminho.git

2. Abra os arquivos `fornecedor.html`, `cliente.html` ou `empresa.html` diretamente no navegador.

3. Digite um CNPJ válido no campo correspondente e aguarde o preenchimento automático dos campos:
- Exemplo de CNPJ válido: `27865757000102`

4. Digite um CEP válido e aguarde o preenchimento automático do endereço:
- Exemplo de CEP válido: `01001000`

5. Teste também com valores inválidos para verificar o tratamento de erros:
- CNPJ inválido: `00000000000000`
- CEP inválido: `99999999`

## Estrutura do Projeto

jaiminho/ 
├── index.html 
├── fornecedor.html 
├── cliente.html 
├── empresa.html 
├── listagem.html 
├── listafornecedor.html 
├── css/ │ 
         ├── fornecedor.css │
                            ├── cliente.css │ 
                                            ├── empresa.css │ 
                                                            ├── listafornecedor.css │ 
                                                                                    ├── listafuncionarios.css 
                                                                                    ├── js/ │ 
                                                                                            ├── fornecedor.js │ 
                                                                                                              ├── cliente.js │ 
                                                                                                                             ├── empresa.js │ 
                                                                                                                                            ├── utils.js 
                                                                                                                                            └── README.md


## Visualização Online

O projeto está disponível via GitHub Pages no seguinte endereço:

https://lenizaOMD2009.github.io/jaiminho


## Autor

_Leniza Oliveira Mendes
        Cacoal, Rondônia — Brasil  
        https://github.com/seuusuario
        Instituição SENAC _ técnico de informática
