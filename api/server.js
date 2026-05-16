/**
 * ClimaERP — Servidor de Integração com Fornecedores
 *
 * Instalar:  npm install
 * Rodar:     node server.js
 * Porta:     3001
 */

const express  = require('express');
const cors     = require('cors');
const axios    = require('axios');
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');

const app    = express();
const PORT   = process.env.PORT || 3001;
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Garante que a pasta de uploads existe
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Arquivo local que armazena as tabelas de preços importadas
const DB_PATH = path.join(__dirname, 'precos_db.json');

app.use(cors());
app.use(express.json());

// ============================================================
// BANCO DE DADOS LOCAL (JSON)
// Armazena os preços importados via planilha
// Formato: { "LG-S4Q12": { "Adias": 1850, "Leveros": 1920 }, ... }
// ============================================================
function lerDB() {
  try {
    if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {}
  return {};
}

function salvarDB(dados) {
  fs.writeFileSync(DB_PATH, JSON.stringify(dados, null, 2));
}

// ============================================================
// CONFIGURAÇÃO DOS FORNECEDORES
// ============================================================
const FORNECEDORES = {
  adias:    { nome: 'Adias',    tipo: 'api', apiKey: process.env.ADIAS_API_KEY    || '', baseUrl: 'https://api.adias.com.br/v1',    ativo: true },
  leveros:  { nome: 'Leveros',  tipo: 'api', apiKey: process.env.LEVEROS_API_KEY  || '', baseUrl: 'https://api.leveros.com.br/v1',  ativo: true },
  dufrio:   { nome: 'Dufrio',   tipo: 'csv', csvUrl: process.env.DUFRIO_CSV_URL   || '',                                            ativo: true },
  climario: { nome: 'ClimaRio', tipo: 'api', apiKey: process.env.CLIMARIO_API_KEY || '', baseUrl: 'https://api.climario.com.br/v1', ativo: true }
};

// ============================================================
// PARSER DE CSV
// Aceita separador ; ou , e cabeçalho flexível
// Colunas esperadas: sku, produto, fornecedor, preco, estoque
// ============================================================
function parsearCSV(texto) {
  const linhas = texto.split(/\r?\n/).filter(l => l.trim());
  if (linhas.length < 2) return [];

  // Detecta separador
  const sep = linhas[0].includes(';') ? ';' : ',';
  const header = linhas[0].toLowerCase().split(sep).map(h => h.trim().replace(/"/g, ''));

  const idx = {
    sku:        header.findIndex(h => h.includes('sku') || h.includes('codigo') || h.includes('código')),
    produto:    header.findIndex(h => h.includes('produto') || h.includes('descri')),
    fornecedor: header.findIndex(h => h.includes('fornecedor')),
    preco:      header.findIndex(h => h.includes('preco') || h.includes('preço') || h.includes('price') || h.includes('valor')),
    estoque:    header.findIndex(h => h.includes('estoque') || h.includes('stock') || h.includes('qtd'))
  };

  if (idx.sku === -1 || idx.preco === -1) return [];

  return linhas.slice(1).map(linha => {
    const cols = linha.split(sep).map(c => c.trim().replace(/"/g, ''));
    const preco = parseFloat(cols[idx.preco]?.replace(/\./g, '').replace(',', '.')) || 0;
    return {
      sku:        cols[idx.sku]       || '',
      produto:    idx.produto    >= 0 ? cols[idx.produto]    : '',
      fornecedor: idx.fornecedor >= 0 ? cols[idx.fornecedor] : '',
      preco,
      estoque:    idx.estoque    >= 0 ? cols[idx.estoque]    : ''
    };
  }).filter(r => r.sku && r.preco > 0);
}

// ============================================================
// ROTAS
// ============================================================

/**
 * GET /api/fornecedores/status
 */
app.get('/api/fornecedores/status', async (req, res) => {
  const db = lerDB();
  const skusNoDB = Object.keys(db).length;

  const status = Object.entries(FORNECEDORES).map(([key, f]) => ({
    id:          key,
    nome:        f.nome,
    tipo:        f.tipo,
    configurado: f.tipo === 'api' ? !!f.apiKey : !!f.csvUrl,
    online:      false, // só verifica se tiver credencial
    ativo:       f.ativo
  }));

  res.json({ fornecedores: status, skusImportados: skusNoDB, atualizadoEm: new Date().toISOString() });
});

/**
 * POST /api/importar/:fornecedor
 * Upload de planilha CSV de um fornecedor específico
 * Campo do form: arquivo
 * Ex: POST /api/importar/adias  com arquivo CSV
 */
app.post('/api/importar/:fornecedor', upload.single('arquivo'), (req, res) => {
  const nomeFornecedor = req.params.fornecedor;
  const fornConfig = Object.values(FORNECEDORES).find(
    f => f.nome.toLowerCase() === nomeFornecedor.toLowerCase()
  );
  const nomeExibicao = fornConfig ? fornConfig.nome : nomeFornecedor;

  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });

  try {
    const texto   = fs.readFileSync(req.file.path, 'utf8');
    const linhas  = parsearCSV(texto);
    fs.unlinkSync(req.file.path); // remove arquivo temporário

    if (!linhas.length) {
      return res.status(400).json({
        erro: 'Planilha inválida ou vazia. Verifique se tem colunas: SKU, Produto, Preco, Estoque'
      });
    }

    // Atualiza o banco local
    const db = lerDB();
    let novos = 0, atualizados = 0;

    linhas.forEach(({ sku, preco, produto, estoque }) => {
      if (!db[sku]) { db[sku] = { produto }; novos++; }
      else atualizados++;
      db[sku][nomeExibicao] = preco;
      if (estoque) db[sku].estoque = db[sku].estoque || {};
      if (estoque) db[sku].estoque[nomeExibicao] = estoque;
    });

    salvarDB(db);

    res.json({
      sucesso:     true,
      fornecedor:  nomeExibicao,
      novos,
      atualizados,
      total:       linhas.length,
      mensagem:    `${linhas.length} produtos importados de ${nomeExibicao}`
    });
  } catch (e) {
    console.error('[Importar]', e.message);
    res.status(500).json({ erro: 'Erro ao processar planilha: ' + e.message });
  }
});

/**
 * GET /api/comparar?sku=LG-S4Q12
 * Busca preços do banco local + APIs (se configuradas)
 */
app.get('/api/comparar', async (req, res) => {
  const { sku } = req.query;
  if (!sku) return res.status(400).json({ erro: 'Informe ?sku=' });

  const db = lerDB();
  const entrada = db[sku] || {};
  const resultados = [];

  // Preços do banco local (planilhas importadas)
  Object.entries(FORNECEDORES).forEach(([, f]) => {
    if (entrada[f.nome] > 0) {
      resultados.push({
        fornecedor: f.nome,
        preco:      entrada[f.nome],
        estoque:    entrada.estoque?.[f.nome] || null,
        fonte:      'planilha'
      });
    }
  });

  // Tenta APIs se configuradas
  const apiCalls = [];
  if (FORNECEDORES.adias.apiKey)    apiCalls.push(buscarPrecoAdias(sku));
  if (FORNECEDORES.leveros.apiKey)  apiCalls.push(buscarPrecoLeveros(sku));
  if (FORNECEDORES.climario.apiKey) apiCalls.push(buscarPrecoClimaRio(sku));

  if (apiCalls.length) {
    const apiRes = await Promise.allSettled(apiCalls);
    apiRes.forEach(r => {
      if (r.status === 'fulfilled' && r.value?.preco) {
        // Substitui o preço da planilha pelo da API (mais recente)
        const idx = resultados.findIndex(x => x.fornecedor === r.value.fornecedor);
        const item = { ...r.value, fonte: 'api' };
        if (idx >= 0) resultados[idx] = item;
        else resultados.push(item);
      }
    });
  }

  const comPreco = resultados.filter(r => r.preco > 0);
  const melhor   = comPreco.length ? comPreco.reduce((a, b) => a.preco < b.preco ? a : b) : null;

  res.json({ sku, produto: entrada.produto || '', resultados, melhor, atualizadoEm: new Date().toISOString() });
});

/**
 * POST /api/comparar/lote
 * Body: { skus: ["LG-S4Q12", "SAM-WF9"] }
 */
app.post('/api/comparar/lote', async (req, res) => {
  const { skus } = req.body;
  if (!Array.isArray(skus) || !skus.length) {
    return res.status(400).json({ erro: 'Informe { skus: [...] }' });
  }

  const db = lerDB();
  const comparativo = skus.map(sku => {
    const entrada  = db[sku] || {};
    const resultados = Object.values(FORNECEDORES)
      .filter(f => entrada[f.nome] > 0)
      .map(f => ({ fornecedor: f.nome, preco: entrada[f.nome], estoque: entrada.estoque?.[f.nome] || null }));

    const melhor = resultados.length ? resultados.reduce((a, b) => a.preco < b.preco ? a : b) : null;
    return { sku, produto: entrada.produto || '', resultados, melhor };
  });

  res.json({ comparativo, atualizadoEm: new Date().toISOString() });
});

/**
 * GET /api/precos
 * Retorna todos os preços do banco local
 */
app.get('/api/precos', (req, res) => {
  res.json(lerDB());
});

// ============================================================
// FUNÇÕES DE API (usadas quando credenciais estiverem no .env)
// ============================================================
async function buscarPrecoAdias(sku) {
  const f = FORNECEDORES.adias;
  try {
    const { data } = await axios.get(`${f.baseUrl}/produtos/${sku}`, {
      headers: { 'Authorization': `Bearer ${f.apiKey}` }, timeout: 5000
    });
    return { fornecedor: 'Adias', preco: data.preco_venda || data.price || null, estoque: data.estoque || null };
  } catch { return null; }
}

async function buscarPrecoLeveros(sku) {
  const f = FORNECEDORES.leveros;
  try {
    const { data } = await axios.get(`${f.baseUrl}/catalogo`, {
      headers: { 'x-api-key': f.apiKey }, params: { codigo: sku }, timeout: 5000
    });
    return { fornecedor: 'Leveros', preco: data.preco || null, estoque: data.disponivel || null };
  } catch { return null; }
}

async function buscarPrecoClimaRio(sku) {
  const f = FORNECEDORES.climario;
  try {
    const { data } = await axios.post(`${f.baseUrl}/consulta-preco`, { sku }, {
      headers: { 'Authorization': `Bearer ${f.apiKey}`, 'Content-Type': 'application/json' }, timeout: 5000
    });
    return { fornecedor: 'ClimaRio', preco: data.preco || null, estoque: data.qtd_estoque || null };
  } catch { return null; }
}

// ============================================================
app.listen(PORT, () => {
  console.log(`\n✅ ClimaERP API rodando em http://localhost:${PORT}`);
  console.log(`   GET  /api/fornecedores/status`);
  console.log(`   POST /api/importar/adias        (upload CSV)`);
  console.log(`   POST /api/importar/leveros       (upload CSV)`);
  console.log(`   POST /api/importar/dufrio        (upload CSV)`);
  console.log(`   POST /api/importar/climario      (upload CSV)`);
  console.log(`   GET  /api/comparar?sku=LG-S4Q12`);
  console.log(`   POST /api/comparar/lote          { skus: [...] }`);
  console.log(`   GET  /api/precos                 (banco completo)\n`);
});
