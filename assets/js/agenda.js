function initAgendaModule() {
  if (window.agendaModuleInitialized) return;

  let compromissos = [];

  const form = document.getElementById("form-agenda");
  const lista = document.getElementById("lista-compromissos");

  function renderCompromissos() {
    if (!lista) return;
    lista.innerHTML = "";
    compromissos.sort((a, b) => new Date(a.data) - new Date(b.data));
    compromissos.forEach((c, i) => {
      const li = document.createElement("li");
      li.className = "agenda-list-item";
      li.innerHTML = `
        <span><strong>${new Date(c.data).toLocaleDateString('pt-BR')}</strong> - ${c.descricao}</span>
        <button data-index="${i}" class="btn btn-rose btn-sm">Remover</button>
      `;
      lista.appendChild(li);
    });
  }

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const dataInput = document.getElementById("data-compromisso");
      const descricaoInput = document.getElementById("descricao-compromisso");
      const data = dataInput.value;
      const descricao = descricaoInput.value.trim();
      if (!data || !descricao) {
        showToast("Preencha todos os campos.");
        return;
      }
      compromissos.push({ data, descricao });
      renderCompromissos();
      dataInput.value = "";
      descricaoInput.value = "";
      showToast("Compromisso adicionado!");
    });
  }

  if (lista) {
    lista.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        const idx = parseInt(e.target.dataset.index);
        if (confirm("Remover este compromisso?")) {
          compromissos.splice(idx, 1);
          renderCompromissos();
          showToast("Compromisso removido.");
        }
      }
    });
  }

  renderCompromissos();
  window.agendaModuleInitialized = true;
}