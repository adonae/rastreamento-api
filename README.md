![Node.js](https://img.shields.io/badge/Node.js-18%2B-3C873A?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

# rastreamento-api

API em Node.js para consultar rastreamentos dos Correios e atualizar registros pendentes no Airtable automaticamente.

## Destaques

- Integração com a API dos Correios
- Atualização automática de registros no Airtable
- Processamento em lote para reduzir chamadas
- Endpoint protegido por segredo para uso com cron ou automações

## Sobre o projeto

Este projeto foi criado para centralizar a atualização de objetos rastreados. O fluxo principal da aplicação é:

1. Gerar um token de autenticação na API dos Correios.
2. Buscar no Airtable os registros que ainda não foram entregues.
3. Consultar os códigos de rastreio em lote.
4. Mapear o último evento do objeto para um status legível.
5. Atualizar os campos correspondentes no Airtable.

## Tecnologias utilizadas

- Node.js
- Express
- Axios
- Dotenv
- Airtable API
- API dos Correios

## Estrutura principal

```bash
src/
  config/
    env.js
  controllers/
    rastreio.controller.js
  services/
    airtable.service.js
    correios.service.js
    token.service.js
  utils/
    statusMapper.js
  server.js
```

## Requisitos

- Node.js 18 ou superior
- Conta e credenciais válidas da API dos Correios
- Base no Airtable com os campos esperados

## Instalação

```bash
npm install
```

Depois, gere seu arquivo de ambiente:

```bash
cp .env.example .env
```

## Variáveis de ambiente

Use o arquivo `.env.example` como base para criar o seu `.env`:

```env
PORT=3000

CORREIOS_BASE_URL=https://api.correios.com.br
USUARIO_MEUS_CORREIOS=seu_usuario
WS_NOVA_API=sua_senha_ou_token_ws
CONTRATO_CORREIOS=seu_contrato
CORREIOS_DR=30

AIRTABLE_API_KEY=sua_chave_airtable
AIRTABLE_BASE_ID=seu_base_id
AIRTABLE_TABLE=nome_da_tabela

CRON_SECRET=seu_segredo

REQUEST_TIMEOUT_MS=20000
CORREIOS_CONCURRENCY=10
TOKEN_EXPIRY_SAFETY_MS=60000
```

## Campos esperados no Airtable

A aplicação considera principalmente estes campos na tabela:

- `Codigo`
- `Status`
- `Último Evento`
- `Última Atualização`
- `Data Postagem`
- `Data Entrega`

Os registros buscados seguem a regra:

- `Status != 'Entregue'`
- `Codigo != ''`

## Como executar

Ambiente de desenvolvimento:

```bash
npm run dev
```

Ambiente normal:

```bash
npm start
```

Por padrão, a API sobe na porta `3000`, ou na porta definida em `PORT`.

## Endpoints

### `GET /health`

Endpoint de verificação de saúde da aplicação.

Exemplo de resposta:

```json
{
  "ok": true,
  "service": "rastreamento-api",
  "timestamp": "2026-03-22T12:00:00.000Z"
}
```

### `POST /atualizar-rastreios`

Executa o processo completo de atualização dos rastreamentos.

Esse endpoint exige o header:

```http
x-secret: SEU_CRON_SECRET
```

Exemplo com `curl`:

```bash
curl -X POST http://localhost:3000/atualizar-rastreios \
  -H "Content-Type: application/json" \
  -H "x-secret: SEU_CRON_SECRET"
```

Exemplo de resposta:

```json
{
  "sucesso": true,
  "mensagem": "Rastreios processados com sucesso",
  "totalEncontrados": 20,
  "totalAtualizados": 18,
  "totalFalhas": 2,
  "totalLotes": 1,
  "tamanhoLote": 50,
  "duracaoMs": 2480
}
```

## Mapeamento de status

Os eventos retornados pelos Correios são convertidos para status mais simples no Airtable, como:

- `Postado`
- `Em trânsito`
- `Saiu para entrega`
- `Entregue`
- `Tentativa de entrega`
- `Retirada`
- `Tributado`
- `Devolvido`
- `Desconhecido`

## Funcionamento em lote

- Os códigos são consultados em lotes de até `50` objetos por vez.
- As atualizações no Airtable são enviadas em blocos de até `10` registros por requisição.

## Segurança

Para evitar execuções indevidas:

- o endpoint `POST /atualizar-rastreios` exige o header `x-secret`
- o valor enviado deve ser igual ao `CRON_SECRET` configurado no ambiente

## Sugestão de uso com automação

Você pode acionar essa API com:

- GitHub Actions
- cron job no servidor
- plataformas como Railway, Render ou VPS própria

Um exemplo comum é agendar chamadas periódicas para `POST /atualizar-rastreios`.

## Deploy

Esta API pode ser publicada em qualquer ambiente Node.js que permita configurar variáveis de ambiente.

Opções comuns:

- Railway
- Render
- VPS com PM2
- Docker
- GitHub Actions chamando uma instância já publicada

Passos gerais de deploy:

1. Configure todas as variáveis do `.env.example` no provedor.
2. Defina o comando de inicialização como `npm start`.
3. Garanta que a porta da aplicação seja lida por `PORT`.
4. Proteja o endpoint de execução com um `CRON_SECRET` forte.
5. Aponte sua automação para `POST /atualizar-rastreios`.

### Exemplo de automação com GitHub Actions

Se a API já estiver publicada, você pode criar um workflow para disparar a atualização periodicamente:

```yaml
name: Atualizar rastreios

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

jobs:
  atualizar:
    runs-on: ubuntu-latest
    steps:
      - name: Chamar API
        run: |
          curl -X POST "${{ secrets.RASTREAMENTO_API_URL }}/atualizar-rastreios" \
            -H "x-secret: ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

Secrets sugeridos no GitHub:

- `RASTREAMENTO_API_URL`
- `CRON_SECRET`

## Scripts disponíveis

```bash
npm start
npm run dev
```

## Observações

- O projeto utiliza cache temporário do token dos Correios para evitar autenticações desnecessárias.
- Em caso de erro, a API retorna informações úteis para depuração, como status HTTP, URL chamada e detalhes da resposta.
- Atualmente o projeto não possui testes automatizados configurados.
- Mantenha o arquivo `.env` fora do versionamento e publique apenas o `.env.example`.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
