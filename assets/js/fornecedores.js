function initFornecedoresModule() {
  if (window.fornecedoresModuleInitialized) return;

  let fornecedores = [
    { nome: "Fornecedor A", contato: "Carlos", email: "carlos@fornecedor.com" },
    { nome: "Fornecedor B", contato: "Ana", email: "ana@fornecedor.com" }
  ];

  const tbody = document.getElementById("fornecedores-lista");
  const btnAdd = document.getElementById("btnAddFornecedor");

  function renderFornecedores() {
    if (!tbody) return;
    tbody.innerHTML = "";
    fornecedores.forEach((f, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.nome}</td>
        <td>${f.contato}</td>
        <td>${f.email}</td>
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
      const nome = prompt("Nome do fornecedor:");
      if (!nome) return;
      const contato = prompt("Contato:");
      if (!contato) return;
      const email = prompt("Email:");
      if (!email) return;
      fornecedores.push({ nome, contato, email });
      renderFornecedores();
      showToast("Fornecedor adicionado.");
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index);
      if (e.target.classList.contains("btn-remove")) {
        if (confirm("Remover este fornecedor?")) {
          fornecedores.splice(idx, 1);
          renderFornecedores();
          showToast("Fornecedor removido.");
        }
      }
      if (e.target.classList.contains("btn-edit")) {
        const f = fornecedores[idx];
        f.nome = prompt("Nome:", f.nome) || f.nome;
        f.contato = prompt("Contato:", f.contato) || f.contato;
        f.email = prompt("Email:", f.email) || f.email;
        renderFornecedores();
        showToast("Dados atualizados.");
      }
    });
  }

  renderFornecedores();
  window.fornecedoresModuleInitialized = true;
}