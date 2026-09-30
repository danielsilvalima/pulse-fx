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

O Compose repassa `FRED_API_KEY` para a API. Sem a chave, dólar, euro, IPCA e Selic continuam. Fed funds e CPI dos EUA registram falha de sincronização até a chave existir.

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

Duas fontes: Banco Central do Brasil e FRED. IPEADATA e World Bank ficaram de fora.

**Dólar PTAX** (`USD`, diário). Olinda, cotação de venda, último boletim do dia. É a referência de fechamento do câmbio comercial em real.  
https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/

**Euro PTAX** (`EUR`, diário). A mesma PTAX, para ver o real contra a outra moeda líquida do mercado local.  
https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/swagger-ui3/

**IPCA 12 meses** (SGS `13522`, mensal). Inflação oficial acumulada, o número que se lê junto com o câmbio.  
https://www3.bcb.gov.br/sgspub/

**Meta Selic** (SGS `432`, tratada como mensal). Custo básico do dinheiro no Brasil. A série muda na reunião do Copom, não em todo mês.  
https://www3.bcb.gov.br/sgspub/

**Fed funds** (`FEDFUNDS`, mensal). Juro efetivo dos Estados Unidos no FRED. Entra porque o diferencial de juros mexe no dólar.  
https://fred.stlouisfed.org/docs/api/fred/

**CPI dos EUA** (`CPIAUCSL`, mensal). Índice de preços americano já ajustado no FRED. A leitura em 12 meses aproxima a inflação de lá.  
https://fred.stlouisfed.org/docs/api/fred/

## Variação e histórico

Último valor é a observação válida mais recente gravada. A data de referência é a data dessa observação, não o horário da consulta.

Fórmula, igual no painel e no detalhe: `(atual - base) / base * 100`. Se a base é zero ou não existe, a variação fica ausente.

- **Diário:** base = quinto boletim anterior que existe na base. N = 5, uma semana de pregões. Fim de semana, feriado e dia sem boletim não ganham valor interpolado.
- **Mensal:** base = nível vigente 12 meses antes da data atual. N = 12. Se não houve publicação naquele mês, vale o último número oficial anterior. Isso cobre a Selic, que fica parada entre reuniões. Não se usa janela de dias numa série mensal.

Histórico exibido: 90 pontos no diário e 36 no mensal. A variação pode usar um ponto anterior a essa janela, se ele já estiver salvo.

Séries que já são percentual (IPCA 12 meses, Selic, Fed funds) usam a mesma fórmula. O resultado é a variação relativa daquele nível, não ponto percentual novo.

## Sincronização

A tela não chama BCB nem FRED. Ela lê o banco.

- Câmbio: cache de 6 horas
- Macro: cache de 24 horas
- Com a API no ar, um ciclo interno roda a cada 30 minutos e só busca o que venceu
- `POST /admin/sync` com `x-admin-token` ignora o cache quando o corpo traz `"force": true`

## Favoritos

Não há login. Na primeira visita o navegador pede `POST /viewers`, guarda o id em `localStorage` (`pulse-fx.viewer`) e envia esse id ao marcar ou desmarcar. A escolha fica na tabela `favorites`.

## Decisões

- Monorepo `api/` (AdonisJS, Lucid) e `web/` (React, Vite, Tailwind).
- PostgreSQL 16 no Compose, inclusive na suíte da API (`pulse_fx_test`).
- Perfil anônimo em vez de conta. O escopo não pede cadastro.
- Cache com TTL em vez de consultar a fonte a cada abertura de tela.
