# Pulse FX

Painel para acompanhar câmbio em real e alguns indicadores macro. Os dados vêm de fontes públicas, ficam no PostgreSQL e a interface lê só o que já foi gravado.

Informação educacional. Não é recomendação de investimento.

## Subir com Docker

Requisitos: Docker e Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:8080
- API: http://localhost:3333
- Postgres no host: `localhost:5433` (5432 dentro da rede do Compose), banco `pulse_fx`, usuário e senha `pulse`

A API aplica as migrations na subida e então passa a sincronizar as séries cujo cache venceu.

`APP_KEY` no `.env.example` serve para o ambiente local. Troque antes de qualquer outro uso. `ADMIN_TOKEN` protege `POST /admin/sync`.

Para o FRED, peça uma chave em https://fredaccount.stlouisfed.org/apikeys e coloque em `.env`:

```bash
FRED_API_KEY=sua-chave
```

O Compose repassa `FRED_API_KEY` para a API. Sem a chave, dólar, euro, IPCA, Selic, câmbio real efetivo e PIB do Brasil continuam. Fed funds e CPI dos EUA registram falha de sincronização até a chave existir.

## Variáveis

| Variável | Uso |
| --- | --- |
| `APP_KEY` | Chave da API |
| `ADMIN_TOKEN` | Cabeçalho `x-admin-token` em `POST /admin/sync` |
| `FRED_API_KEY` | Chave do FRED. Fica fora do git |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | PostgreSQL |
| `DB_CONNECTION` | `pg` |
| `CORS_ORIGIN` | Origens liberadas quando a API é chamada direto, separadas por vírgula |

O modelo do backend está em `api/.env.example`.

## API sem Docker

Com o Postgres do Compose no ar:

```bash
cd api
npm install
npm run dev
```

Ao subir o servidor HTTP, a API aplica sozinha as migrations pendentes e só depois sincroniza as séries. Não há passo manual de migration.

## Front sem Docker

Com a API em http://localhost:3333:

```bash
cd web
npm install
npm run dev
```

O Vite encaminha `/api` para a API. Abra http://localhost:5173.

## Testes e lint

```bash
docker compose up -d postgres
cd api
npm install
npm test
npm run lint
```

```bash
cd web
npm install
npm test
npm run lint
```

Build:

```bash
cd api && npm run build
cd web && npm run build
```

A suíte da API sobe o HTTP contra o banco `pulse_fx_test` no PostgreSQL do Compose. Suba o Postgres antes de `npm test` em `api/`.

## Séries

Duas fontes obrigatórias, Banco Central do Brasil e FRED, e duas opcionais, Ipeadata e World Bank.

**Dólar PTAX** (`USD`, diário). Cotação de venda do último boletim de cada dia útil na API Olinda do Banco Central. É o fechamento do câmbio comercial em real, a referência de contratos e do noticiário. Fim de semana, feriado e dia sem boletim ficam de fora, sem valor inventado. A variação compara esse fechamento com o quinto pregão anterior que já está salvo.  
https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/

**Euro PTAX** (`EUR`, diário). A mesma PTAX de venda, para a outra moeda líquida do mercado local. Serve para ver se o movimento do real é específico do dólar ou aparece também contra o euro. Vale a mesma regra de calendário e o mesmo intervalo de cinco pregões.  
https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/

**IPCA 12 meses** (SGS `13522`, mensal). Inflação oficial acumulada, o número que se lê junto com o câmbio para entender o poder de compra do real. A série já vem em percentual. A variação do painel compara esse nível com o de 12 meses antes e não recalcula o índice. Mês sem publicação usa o último número oficial anterior.  
https://www3.bcb.gov.br/sgspub/

**Meta Selic** (SGS `432`, tratada como mensal). Meta do Copom, o custo básico do dinheiro no Brasil, que costuma andar junto com o câmbio. A série muda na reunião, não em todo mês. Entre reuniões permanece a última meta. A comparação usa o nível vigente 12 meses antes, sem preencher o intervalo.  
https://www3.bcb.gov.br/sgspub/

**Fed funds** (`FEDFUNDS`, mensal). Taxa efetiva dos Estados Unidos no FRED, média mensal. Entra porque o diferencial de juros com o Brasil mexe no dólar. O valor já vem em percentual ao ano. A variação compara com 12 meses antes. Sem `FRED_API_KEY`, esta série fica com falha de sincronização e as séries do Banco Central continuam.  
https://fred.stlouisfed.org/docs/api/fred/

**CPI dos EUA** (`CPIAUCSL`, mensal). Índice de preços ao consumidor americano, já ajustado no FRED. Mostra a inflação de lá, outro fator externo do câmbio. A série é um índice, não um percentual pronto. A variação em 12 meses aproxima a inflação anual a partir desse índice. Também depende da chave do FRED.  
https://fred.stlouisfed.org/docs/api/fred/

**Câmbio real efetivo** (`PAN12_TCERXTINPC12`, mensal). Índice Ipeadata da taxa de câmbio efetiva real das exportações, deflacionado pelo INPC, média 2010 = 100. Mede o real contra uma cesta de parceiros comerciais, então não repete a PTAX de um dia nem o IPCA. A variação compara com 12 meses antes. Mês sem publicação usa o último número oficial anterior, sem interpolar. O Ipea inativou a atualização; o último valor publicado é dezembro de 2024.  
http://www.ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PAN12_TCERXTINPC12')

**PIB do Brasil** (`NY.GDP.MKTP.KD.ZG`, anual). Crescimento do PIB real brasileiro, em percentual, no World Bank Open Data, país BR. Entra para situar o câmbio num ciclo de atividade, não como cotação. A variação compara o último ano publicado com o ano anterior que já tem número. Ano ausente usa o último ano oficial anterior. Valores nulos da API são descartados. A janela guardada cobre cerca de 15 anos; a tela mostra 10.  
https://api.worldbank.org/v2/country/BR/indicator/NY.GDP.MKTP.KD.ZG?format=json

## Variação e histórico

Último valor é a observação válida mais recente gravada. A data de referência é a data dessa observação, não o horário da consulta.

Fórmula, igual no painel e no detalhe: `(atual - base) / base * 100`. Se a base é zero ou não existe, a variação fica ausente.

- **Diário:** base = quinto boletim anterior que existe na base. N = 5, uma semana de pregões. Fim de semana, feriado e dia sem boletim não ganham valor interpolado.
- **Mensal:** base = nível vigente 12 meses antes da data atual. N = 12. Se não houve publicação naquele mês, vale o último número oficial anterior. Isso cobre a Selic, que fica parada entre reuniões. Não se usa janela de dias numa série mensal.
- **Anual:** base = nível vigente 1 ano antes da data atual. N = 1. Se aquele ano não veio na API, vale o último ano oficial anterior. Não se interpola o intervalo.

Histórico exibido: 90 pontos no diário, 36 no mensal e 10 no anual. A variação pode usar um ponto anterior a essa janela, se ele já estiver salvo.

Séries que já são percentual (IPCA 12 meses, Selic, Fed funds, PIB do Brasil) usam a mesma fórmula. O resultado é a variação relativa daquele nível, não ponto percentual novo.

## Sincronização

A tela não chama BCB, FRED, Ipeadata nem World Bank. Ela lê o banco.

- Câmbio diário: cache de 6 horas
- Macro mensal e anual: cache de 24 horas
- Com a API no ar, um ciclo interno roda a cada 30 minutos e só busca o que venceu
- `POST /admin/sync` com `x-admin-token` ignora o cache quando o corpo traz `"force": true`

## Favoritos

Não há login. Na primeira visita o navegador pede `POST /viewers`, guarda o id em `localStorage` (`pulse-fx.viewer`) e envia esse id ao marcar ou desmarcar. A escolha fica na tabela `favorites`.

## Decisões

- Monorepo `api/` (AdonisJS, Lucid) e `web/` (React, Vite, Tailwind).
- PostgreSQL 16 no Compose, inclusive na suíte da API (`pulse_fx_test`).
- Perfil anônimo em vez de conta. O escopo não pede cadastro.
- Cache com TTL em vez de consultar a fonte a cada abertura de tela.
