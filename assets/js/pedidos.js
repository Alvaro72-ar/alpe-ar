// Inicializa o namespace global se não existir
window.ClimaERP = window.ClimaERP || {};

// Define os dados de pedidos globalmente para persistência
if (!window.ClimaERP.pedidos) {
  window.ClimaERP.pedidos = [
    { id: 101, cliente: "João Silva", produto: "Samsung Inverter 12.000 BTU", quantidade: 2, status: "Entregue", data: "2026-03-01" },
    { id: 102, cliente: "Maria Souza", produto: "LG Dual Inverter 9.000 BTU", quantidade: 1, status: "Enviado", data: "2026-03-05" },
    { id: 103, cliente: "Carlos Pereira", produto: "Daikin Cassete 36.000 BTU", quantidade: 1, status: "Pendente", data: "2026-03-10" },
    { id: 104, cliente: "Ana Costa", produto: "Midea Xtreme Save 18.000 BTU", quantidade: 3, status: "Cancelado", data: "2026-03-08" }
  ];
}

function initPedidosModule() {
  const tbody = document.getElementById("pedidos-lista");

  function renderPedidos() {
    if (!tbody) return;
    tbody.innerHTML = "";
    // Usa os dados globais
    window.ClimaERP.pedidos.forEach((p, i) => {
      const tr = document.createElement("tr");
      // Converte o status para uma classe CSS válida (ex: "Pendente" -> "status-pendente")
      const statusClass = p.status.toLowerCase().replace(' ', '-');
      tr.innerHTML = `
        <td>#${p.id}</td>
        <td>${p.cliente}</td>
        <td>${p.produto}</td>
        <td style="text-align: center;">${p.quantidade}</td>
        <td><span class="status-badge status-${statusClass}">${p.status}</span></td>
        <td>${new Date(p.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
        <td style="display:flex; gap:8px;">
          <button data-index="${i}" class="btn btn-amber btn-sm btn-edit">Editar</button>
          <button data-index="${i}" class="btn btn-rose btn-sm btn-remove">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const idx = parseInt(target.dataset.index);

      if (target.classList.contains("btn-remove")) {
        if (confirm(`Tem certeza que deseja remover o pedido #${window.ClimaERP.pedidos[idx].id}?`)) {
          window.ClimaERP.pedidos.splice(idx, 1);
          renderPedidos();
          showToast("Pedido removido.");
        }
      }

      if (target.classList.contains("btn-edit")) {
        const p = window.ClimaERP.pedidos[idx];
        const novoStatus = prompt("Digite o novo status (Pendente, Enviado, Entregue, Cancelado):", p.status);
        if (novoStatus && ["Pendente", "Enviado", "Entregue", "Cancelado"].includes(novoStatus)) {
          window.ClimaERP.pedidos[idx].status = novoStatus;
          renderPedidos();
          showToast("Status do pedido atualizado!");
        } else if (novoStatus !== null) {
          alert("Status inválido. Use um dos valores sugeridos.");
        }
      }
    });
  }

  renderPedidos();
}

// Função auxiliar para adicionar pedido vindo da Loja (acessível globalmente)
window.ClimaERP.adicionarPedido = function(pedido) {
  if(window.ClimaERP.pedidos) {
    // Gera um ID simples baseado no último
    const lastId = window.ClimaERP.pedidos.length > 0 ? window.ClimaERP.pedidos[window.ClimaERP.pedidos.length - 1].id : 100;
    pedido.id = lastId + 1;
    window.ClimaERP.pedidos.push(pedido);
    console.log("Pedido adicionado ao sistema:", pedido);
  }
};