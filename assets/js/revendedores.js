function initRevendedoresModule() {
  if (window.revendedoresModuleInitialized) return;

  // Estado local do módulo (simulando banco de dados)
  let revendedores = [
    { nome: "João Silva", email: "joao@exemplo.com", telefone: "(21) 99999-9999", status: "Ativo" },
    { nome: "Maria Souza", email: "maria@exemplo.com", telefone: "(11) 98888-8888", status: "Inativo" }
  ];

  const tbody = document.getElementById("revendedores-lista");
  const btnAdd = document.getElementById("btnAddRevendedor");

  function renderRevendedores() {
    if (!tbody) return;
    tbody.innerHTML = "";
    revendedores.forEach((r, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.nome}</td>
        <td>${r.email}</td>
        <td>${r.telefone}</td>
        <td>${r.status}</td>
        <td style="display:flex; gap:8px;">
          <button data-index="${i}" class="btn btn-amber btn-sm btn-edit">Editar</button>
          <button data-index="${i}" class="btn btn-rose btn-sm btn-remove">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      const nome = prompt("Nome do revendedor:");
      if (!nome) return;
      const email = prompt("Email:");
      if (!email) return;
      const telefone = prompt("Telefone:");
      if (!telefone) return;
      revendedores.push({ nome, email, telefone, status: "Ativo" });
      renderRevendedores();
      showToast("Revendedor adicionado com sucesso!");
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      
      if (e.target.classList.contains("btn-remove")) {
        if (confirm("Remover este revendedor?")) {
          revendedores.splice(idx, 1);
          renderRevendedores();
          showToast("Revendedor removido.");
        }
      }
      
      if (e.target.classList.contains("btn-edit")) {
        const r = revendedores[idx];
        const nome = prompt("Nome:", r.nome);
        if (nome !== null) r.nome = nome;
        const email = prompt("Email:", r.email);
        if (email !== null) r.email = email;
        const telefone = prompt("Telefone:", r.telefone);
        if (telefone !== null) r.telefone = telefone;
        
        revendedores[idx] = r; // Atualiza objeto (simplificado)
        renderRevendedores();
        showToast("Dados atualizados.");
      }
    });
  }

  renderRevendedores();
  window.revendedoresModuleInitialized = true;
}