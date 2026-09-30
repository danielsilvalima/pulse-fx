export type Frequency = 'daily' | 'monthly' | 'yearly'
export type Unit = 'brl' | 'percent' | 'index'
export type Source = 'bcb_ptax' | 'bcb_sgs' | 'fred' | 'ipeadata' | 'world_bank'

export type CatalogItem = {
  code: string
  name: string
  source: Source
  frequency: Frequency
  externalId: string
  unit: Unit
  summary: string
  limitations: string
  historyLimit: number
  variationLag: number
  ttlHours: number
  sortOrder: number
}

export const CATALOG: CatalogItem[] = [
  {
    code: 'usd-brl',
    name: 'Dólar PTAX',
    source: 'bcb_ptax',
    frequency: 'daily',
    externalId: 'USD',
    unit: 'brl',
    summary:
      'Taxa de venda do dólar comercial publicada pelo Banco Central. Serve para acompanhar o câmbio que referencia contratos e o noticiário de fechamento.',
    limitations:
      'Usa a PTAX de venda e o último boletim de cada dia útil. Fins de semana, feriados e dias sem boletim ficam de fora, sem valor inventado.',
    historyLimit: 90,
    variationLag: 5,
    ttlHours: 6,
    sortOrder: 1,
  },
  {
    code: 'eur-brl',
    name: 'Euro PTAX',
    source: 'bcb_ptax',
    frequency: 'daily',
    externalId: 'EUR',
    unit: 'brl',
    summary:
      'Taxa de venda do euro comercial no mesmo boletim PTAX. Entra no painel para comparar o real com a segunda moeda de referência do mercado local.',
    limitations:
      'Mesma regra do dólar: último boletim de venda do dia útil. Lacunas do calendário não são preenchidas.',
    historyLimit: 90,
    variationLag: 5,
    ttlHours: 6,
    sortOrder: 2,
  },
  {
    code: 'ipca-12m',
    name: 'IPCA 12 meses',
    source: 'bcb_sgs',
    frequency: 'monthly',
    externalId: '13522',
    unit: 'percent',
    summary:
      'Inflação oficial acumulada em 12 meses (SGS 13522). É o número que o mercado usa para ler o poder de compra do real ao lado do câmbio.',
    limitations:
      'A série já é um percentual em 12 meses. A variação do Pulse FX compara esse nível com o de 12 meses antes, sem recalcular o índice. Mês sem publicação usa o último número oficial anterior.',
    historyLimit: 36,
    variationLag: 12,
    ttlHours: 24,
    sortOrder: 3,
  },
  {
    code: 'selic-target',
    name: 'Meta Selic',
    source: 'bcb_sgs',
    frequency: 'monthly',
    externalId: '432',
    unit: 'percent',
    summary:
      'Meta da taxa básica definida pelo Copom (SGS 432). Ajuda a ler o custo do dinheiro no Brasil, que costuma andar junto com o câmbio.',
    limitations:
      'O Copom não publica todo mês. Entre reuniões permanece a última meta. A comparação usa o nível vigente 12 meses antes, sem interpolar o intervalo.',
    historyLimit: 36,
    variationLag: 12,
    ttlHours: 24,
    sortOrder: 4,
  },
  {
    code: 'fed-funds',
    name: 'Fed funds',
    source: 'fred',
    frequency: 'monthly',
    externalId: 'FEDFUNDS',
    unit: 'percent',
    summary:
      'Taxa efetiva dos Fed funds, média mensal no FRED. É o juro de referência dos Estados Unidos e um dos fatores externos do dólar.',
    limitations:
      'Depende de chave do FRED. O valor já vem em percentual ao ano. A variação compara com 12 meses antes e não é taxa brasileira.',
    historyLimit: 36,
    variationLag: 12,
    ttlHours: 24,
    sortOrder: 5,
  },
  {
    code: 'us-cpi',
    name: 'CPI dos EUA',
    source: 'fred',
    frequency: 'monthly',
    externalId: 'CPIAUCSL',
    unit: 'index',
    summary:
      'Índice de preços ao consumidor dos EUA, já ajustado sazonalmente no FRED. Mostra a inflação americana que influencia o diferencial com o Brasil.',
    limitations:
      'A série é um índice, não um percentual pronto. A variação em 12 meses aproxima a inflação anual a partir desse índice. Depende de chave do FRED.',
    historyLimit: 36,
    variationLag: 12,
    ttlHours: 24,
    sortOrder: 6,
  },
  {
    code: 'real-effective',
    name: 'Câmbio real efetivo',
    source: 'ipeadata',
    frequency: 'monthly',
    externalId: 'PAN12_TCERXTINPC12',
    unit: 'index',
    summary:
      'Índice da taxa de câmbio efetiva real das exportações, deflacionado pelo INPC (média 2010 = 100). Mede o real contra uma cesta de parceiros, não a cotação PTAX de um dia.',
    limitations:
      'Série mensal do Ipeadata. O Ipea inativou a atualização; o último número oficial publicado é dezembro de 2024. Mês sem publicação usa o último valor oficial anterior, sem interpolar.',
    historyLimit: 36,
    variationLag: 12,
    ttlHours: 24,
    sortOrder: 7,
  },
  {
    code: 'br-gdp-growth',
    name: 'PIB do Brasil',
    source: 'world_bank',
    frequency: 'yearly',
    externalId: 'NY.GDP.MKTP.KD.ZG',
    unit: 'percent',
    summary:
      'Crescimento anual do PIB real do Brasil, em percentual. Situa o câmbio num ciclo de atividade, sem virar cotação nem meta de juros.',
    limitations:
      'Frequência anual. A variação compara o último ano publicado com o ano anterior que já tem número. Ano ausente usa o último ano oficial anterior. Valores nulos da API são descartados.',
    historyLimit: 10,
    variationLag: 1,
    ttlHours: 24,
    sortOrder: 8,
  },
]
