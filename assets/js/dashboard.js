// Funções utilitárias
// Função segura para acessar o Storage (evita erro de Tracking Prevention)
const safeStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Acesso ao localStorage bloqueado pelo navegador.', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Erro ao salvar no localStorage.', e);
    }
  }
};

const brl = (n) => {
  const v = Number(n);
  if (!isFinite(v)) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const num = (v) => {
  if (typeof v === "number") return v;
  if (!v) return NaN;
  const s = String(v).trim().replace(/\s/g,'');
  const normalized = s.includes(",")
    ? s.replace(/\./g,'').replace(",", ".")
    : s;
  return Number(normalized);
};

// Toast Notification Helper
function showToast(msg){
  const div = document.createElement("div");
  div.className = "toast";
  div.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
    ${msg}
  `;
  document.body.appendChild(div);
  setTimeout(()=> {
    div.style.transition = "all .3s"; div.style.opacity = "0"; div.style.transform = "translateY(10px)";
    setTimeout(()=> div.remove(), 300);
  }, 2500);
}

// New helper function for status badge styling
function getStatusBadgeStyle(status) {
  let bgColor, textColor;
  switch (status) {
    case "Pendente":
      bgColor = "rgba(245,158,11,0.2)";
      textColor = "#f59e0b";
      break;
    case "Pago":
      bgColor = "rgba(52,211,153,0.2)"; // Greenish
      textColor = "#34d399";
      break;
    case "Enviado":
      bgColor = "rgba(96,165,250,0.2)"; // Bluish
      textColor = "#60a5fa";
      break;
    case "Entregue":
      bgColor = "rgba(16,185,129,0.2)"; // Darker Green
      textColor = "#10b981";
      break;
    case "Cancelado":
      bgColor = "rgba(239,68,68,0.2)"; // Reddish
      textColor = "#ef4444";
      break;
    default:
      bgColor = "rgba(107,114,128,0.2)"; // Grayish
      textColor = "#6b7280";
  }
  return `background:${bgColor}; color:${textColor}; padding:4px 8px; border-radius:12px; font-size:12px;`;
}

// Navegação entre as "páginas" internas do dashboard
function setDashboardView(viewId){
  const contentArea = document.getElementById("dashboard-content");
  if (!contentArea) return;

  // Atualiza o botão ativo na sidebar
  document.querySelectorAll(".sidebar .nav-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === viewId);
  });

  const title = document.querySelector(`.sidebar .nav-btn[data-page='${viewId}']`)?.textContent?.trim();
  document.title = title ? `ClimaERP AI — ${title}` : "ClimaERP AI";

  // Simulação de carregamento de conteúdo
  if (viewId === 'dashboard') {
      contentArea.innerHTML = `<h2>Visão Geral</h2><div class="kpis"></div>`; // Prepara a área dos KPIs
      refreshKPIs(); // Carrega os dados
  } else if (viewId === 'ia') {
      contentArea.innerHTML = getIAModuleHTML();
      if (typeof initIAModule === 'function') initIAModule();
  } else if (viewId === 'revendedores') {
      contentArea.innerHTML = getRevendedoresModuleHTML();
      if (typeof initRevendedoresModule === 'function') initRevendedoresModule();
  } else if (viewId === 'pedidos') {
      contentArea.innerHTML = getPedidosModuleHTML();
      if (typeof initPedidosModule === 'function') initPedidosModule();
  } else if (viewId === 'graficos') {
      contentArea.innerHTML = getGraficosModuleHTML();
      if (typeof initGraficosModule === 'function') initGraficosModule();
  } else if (viewId === 'ferramentas') {
      contentArea.innerHTML = getFerramentasModuleHTML();
      if (typeof initFerramentasModule === 'function') initFerramentasModule();
  } else if (viewId === 'agenda') {
      contentArea.innerHTML = getAgendaModuleHTML();
      if (typeof initAgendaModule === 'function') initAgendaModule();
  } else if (viewId === 'fornecedores') {
      contentArea.innerHTML = getFornecedoresModuleHTML();
      if (typeof initFornecedoresModule === 'function') initFornecedoresModule();
  } else {
      contentArea.innerHTML = `<div class="ia-header"><h2>${title}</h2><p style="color: var(--muted);">Conteúdo para esta seção ainda não implementado.</p></div>`;
  }
}

// Atualiza os KPIs com dados (substitua com dados reais de uma API)
function refreshKPIs() {
  const kpiArea = document.querySelector("#dashboard-content .kpis");
  if(!kpiArea) return;

  // Injeta o HTML dos KPIs e depois preenche os valores
  kpiArea.innerHTML = `
    <div class="kpi"><div class="label">Vendas Totais</div><div class="value" id="kpiVendas">--</div></div>
    <div class="kpi"><div class="label">Lucro Estimado</div><div class="value" id="kpiLucro">--</div></div>
    <div class="kpi"><div class="label">Novos Pedidos</div><div class="value" id="kpiPedidos">--</div></div>
  `;

  document.getElementById("kpiVendas").textContent = brl(14780);
  document.getElementById("kpiLucro").textContent = brl(5200);
  document.getElementById("kpiPedidos").textContent = "22";
}

// Função de inicialização para a lógica do Dashboard
function initDashboard() {
  // Previne que os eventos sejam adicionados múltiplas vezes
  if (window.dashboardInitialized) return;

  document.querySelectorAll(".sidebar .nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setDashboardView(btn.dataset.page);
    });
  });

  setDashboardView("dashboard"); // Define a view inicial
  window.dashboardInitialized = true; // Marca como inicializado
}

// Retorna o HTML para o módulo de IA
function getIAModuleHTML() {
  return `
    <div class="ia-header">
      <h2 id="ia-title">Centro de Inteligência & Precificação</h2>
      <p>Agentes autônomos para precificação e monitoramento. Simule o preço ideal considerando custo, impostos, margem e mercado.</p>
    </div>

    <div class="ia-layout">
      <!-- Formulário de Parâmetros -->
      <div class="ia-panel">
        <h3>Precificação Dinâmica</h3>
        <div class="ia-form-group">
          <label for="custo">Custo do fornecedor (R$)</label>
          <input id="custo" type="number" min="0" step="0.01" placeholder="Ex.: 1750"/>
        </div>
        <div class="ia-form-group">
          <label for="imposto">Impostos + taxas (%)</label>
          <input id="imposto" type="number" min="0" step="0.01" value="10"/>
        </div>
        <div class="ia-form-group">
          <label for="margem">Margem alvo (%)</label>
          <input id="margem" type="number" min="0" step="0.01" value="25"/>
        </div>
        <div class="ia-form-group">
          <label for="frete">Frete + manuseio (R$)</label>
          <input id="frete" type="number" min="0" step="0.01" value="120"/>
        </div>
        <div class="ia-form-group">
          <label for="btu">BTU</label>
          <select id="btu">
            <option value="9000">9.000</option>
            <option value="12000" selected>12.000</option>
            <option value="18000">18.000</option>
            <option value="24000">24.000</option>
            <option value="30000">30.000</option>
          </select>
        </div>
        <div class="ia-form-group">
          <label for="posicionamento">Posicionamento</label>
          <select id="posicionamento">
            <option value="conservador" selected>Conservador (protege margem)</option>
            <option value="competitivo">Competitivo (ganha volume)</option>
            <option value="premium">Premium (valor percebido)</option>
          </select>
        </div>
        <button id="btnCalc" class="btn-calc">Calcular Preço</button>
        <button id="btnReset" class="btn-reset">Limpar</button>
      </div>

      <!-- Resultado e Radar de Concorrência -->
      <div class="ia-panel">
        <h3>Radar de Concorrência</h3>
        <table class="ia-radar-table">
          <tbody>
            <tr>
              <td><b>FrioPeças</b></td>
              <td style="text-align:right; color:#FB7185;">R$ 2.399</td>
              <td style="text-align:right; opacity:0.7;">Sem estoque</td>
            </tr>
            <tr>
              <td><b>Dufrio</b></td>
              <td style="text-align:right;">R$ 2.450</td>
              <td style="text-align:right; opacity:0.7;">Online</td>
            </tr>
            <tr class="seu-preco-row">
              <td>Seu Preço</td>
              <td style="text-align:right;" id="precoSugerido">R$ —</td>
              <td style="text-align:right;">Ideal</td>
            </tr>
          </tbody>
        </table>

        <div id="recomendacoes" class="ia-recommendations">
          Informe os parâmetros e clique em calcular para ver as recomendações.
        </div>
      </div>
    </div>

    <!-- Chat Assistente IA -->
    <div class="ia-chat-container ia-panel">
      <h3>Assistente IA</h3>
      <div id="chat" class="ia-chat-window"></div>
      <div style="margin-top:12px; display:flex; gap:8px;">
        <input id="input-chat" type="text" placeholder="Digite sua pergunta..." class="ia-form-group" style="flex:1; margin:0;"/>
        <button id="btn-enviar" class="btn-calc" style="padding:10px 16px;">Enviar</button>
      </div>
    </div>
  `;
}

// Retorna o HTML para o módulo de Agenda
function getAgendaModuleHTML() {
  return `
    <div class="ia-header">
      <h2>Agenda</h2>
      <p>Gerencie seus compromissos e tarefas diárias.</p>
    </div>

    <form id="form-agenda" class="agenda-form" onsubmit="return false;">
      <input type="date" id="data-compromisso" required class="ia-form-group"/>
      <input type="text" id="descricao-compromisso" placeholder="Descrição do compromisso" required class="ia-form-group" style="flex: 1;"/>
      <button type="submit" class="btn btn-aqua">Adicionar</button>
    </form>

    <ul id="lista-compromissos" class="agenda-list">
      <!-- Compromissos listados aqui -->
    </ul>
  `;
}

// Retorna o HTML para o módulo de Fornecedores
function getFornecedoresModuleHTML() {
  return `
    <div class="ia-header">
      <h2>Fornecedores</h2>
      <p>Gerencie seus fornecedores, visualize contatos e informações.</p>
    </div>

    <button id="btnAddFornecedor" class="btn btn-aqua" style="margin-bottom: 20px;">Adicionar Fornecedor</button>

    <div class="table-wrap" style="background: var(--panel); border-radius: var(--radius-lg); padding: 10px;">
      <table style="width:100%; border-collapse: separate; border-spacing: 0 5px;">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Contato</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="fornecedores-lista">
          <!-- Fornecedores listados aqui -->
        </tbody>
      </table>
    </div>
  `;
}

// Retorna o HTML para o módulo de Gráficos
function getGraficosModuleHTML() {
  return `
    <div class="ia-header">
      <h2>Análises e Gráficos</h2>
      <p>Visualize o desempenho de vendas e outras métricas chave ao longo do tempo.</p>
    </div>
    <div class="ia-panel" style="height: 400px; padding: 20px;">
      <canvas id="graficoVendas"></canvas>
    </div>
  `;
}

// Retorna o HTML para o módulo de Ferramentas
function getFerramentasModuleHTML() {
  return `
    <div class="ia-header">
      <h2>Ferramentas Técnicas</h2>
      <p>Utilize calculadoras e simuladores para auxiliar em projetos e vendas.</p>
    </div>

    <div class="tools-layout">
      <div class="tool-card">
        <h3>Cálculo de BTU Recomendado</h3>
        <form class="tool-form" onsubmit="return false;">
          <div class="ia-form-group"><label for="area">Área (m²)</label><input type="number" id="area" min="1" placeholder="20"/></div>
          <div class="ia-form-group"><label for="pessoas">Pessoas no ambiente</label><input type="number" id="pessoas" min="1" placeholder="2"/></div>
          <div class="ia-form-group"><label for="equip">Equipamentos (PC, TV, etc)</label><input type="number" id="equip" min="0" placeholder="1"/></div>
          <button id="btnCalcularBTU" class="btn btn-aqua">Calcular</button>
        </form>
        <div id="resbtu" class="tool-result" style="display: none;"></div>
      </div>

      <div class="tool-card">
        <h3>Simulação de Consumo Mensal</h3>
        <form class="tool-form" onsubmit="return false;">
          <div class="ia-form-group"><label for="pot">Potência (kW)</label><input type="number" id="pot" min="0" step="0.01" placeholder="1.08"/></div>
          <div class="ia-form-group"><label for="horas">Horas de uso por dia</label><input type="number" id="horas" min="0" step="0.1" placeholder="8"/></div>
          <div class="ia-form-group"><label for="valor">Valor do kWh (R$)</label><input type="number" id="valor" min="0" step="0.01" placeholder="0.75"/></div>
          <button id="btnSimularConsumo" class="btn btn-amber">Simular</button>
        </form>
        <div id="resultadoConsumo" class="tool-result" style="display: none;"></div>
      </div>
    </div>
  `;
}

// Retorna o HTML para o módulo de Pedidos
function getPedidosModuleHTML() {
  return `
    <div class="ia-header">
      <h2>Gerenciamento de Pedidos</h2>
      <p>Acompanhe o status, histórico e detalhes de todas as vendas realizadas.</p>
    </div>
    
    <div class="table-wrap" style="background: var(--panel); border-radius: var(--radius-lg); padding: 10px;">
      <table style="width:100%; border-collapse: separate; border-spacing: 0 5px;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Qtd.</th>
            <th>Status</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="pedidos-lista">
          <!-- Pedidos serão listados aqui -->
        </tbody>
      </table>
    </div>
  `;
}

// Retorna o HTML para o módulo de Revendedores
function getRevendedoresModuleHTML() {
  return `
    <div class="ia-header">
      <h2>Gestão de Revendedores</h2>
      <p>Gerencie sua rede de parceiros comerciais, visualize contatos e status.</p>
    </div>
    
    <button id="btnAddRevendedor" class="btn btn-aqua" style="margin-bottom: 20px;">Adicionar Revendedor</button>
    
    <div class="table-wrap" style="background: var(--panel); border-radius: var(--radius-lg); padding: 10px;">
      <table style="width:100%; border-collapse: separate; border-spacing: 0 5px;">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="revendedores-lista">
          <!-- Revendedores serão listados aqui -->
        </tbody>
      </table>
    </div>
  `;
}

function initPedidosModule() {
  const container = document.getElementById("pedidos-lista");
  if (!container) return;

  const pedidos = JSON.parse(safeStorage.get("alpe_pedidos")) || [];
  
  if (pedidos.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--muted);">Nenhum pedido registrado ainda.</td></tr>';
    return;
  }

  container.innerHTML = pedidos.map(p => `
    ${(() => {
      const statusStyle = getStatusBadgeStyle(p.status);
      let actionButton;

      if (p.status === "Pago" && p.instalacao === "Aguardando") {
        const whatsappMessage = encodeURIComponent(`Olá! Gostaria de agendar a instalação do pedido #${p.id} para o cliente ${p.cliente}. O produto é: ${p.itens}.`);
        actionButton = `<button class="btn-calc" style="padding:5px 10px; font-size:11px; background-color: #34d399; color: white;" onclick="window.open('https://api.whatsapp.com/send?phone=5521980220417&text=${whatsappMessage}', '_blank')">Agendar Instalação</button>`;
      } else {
        const whatsappMessage = encodeURIComponent(`Olá! Quero tratar do pedido #${p.id}`);
        actionButton = `<button class="btn-calc" style="padding:5px 10px; font-size:11px;" onclick="window.open('https://api.whatsapp.com/send?phone=5521980220417&text=${whatsappMessage}', '_blank')">Detalhes</button>`;
      }

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px;">#${p.id}</td>
          <td>${p.cliente}</td>
          <td>${p.itens}</td>
          <td>1</td>
          <td><span style="${statusStyle}">${p.status}</span></td>
          <td>${p.data}</td>
          <td>${actionButton}</td>
        </tr>
      `;
    })()}`
  ).join('');
}