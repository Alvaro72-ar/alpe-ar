function initFerramentasModule() {
  if (window.ferramentasModuleInitialized) return;

  const btnCalcularBTU = document.getElementById("btnCalcularBTU");
  const btnSimularConsumo = document.getElementById("btnSimularConsumo");

  if (btnCalcularBTU) {
    btnCalcularBTU.addEventListener("click", () => {
      const area = parseFloat(document.getElementById("area").value) || 0;
      const pessoas = parseFloat(document.getElementById("pessoas").value) || 0;
      const equip = parseFloat(document.getElementById("equip").value) || 0;
      
      if (area <= 0) {
        showToast("Por favor, insira uma área válida.");
        return;
      }

      const btuBase = area * 600;
      const btuPessoas = (pessoas > 1 ? pessoas - 1 : 0) * 600;
      const btuEquip = equip * 600;
      const btuTotal = btuBase + btuPessoas + btuEquip;
      
      const resDiv = document.getElementById("resbtu");
      resDiv.textContent = "BTU recomendado: " + btuTotal.toLocaleString("pt-BR");
      resDiv.style.display = 'block';
    });
  }

  if (btnSimularConsumo) {
    btnSimularConsumo.addEventListener("click", () => {
      const pot = parseFloat(document.getElementById("pot").value) || 0;
      const horas = parseFloat(document.getElementById("horas").value) || 0;
      const valor = parseFloat(document.getElementById("valor").value) || 0;

      if (pot <= 0 || horas <= 0 || valor <= 0) {
        showToast("Preencha todos os campos da simulação.");
        return;
      }

      const consumo = pot * horas * 30 * valor;
      const resDiv = document.getElementById("resultadoConsumo");
      resDiv.textContent = "Custo mensal aproximado: " + brl(consumo);
      resDiv.style.display = 'block';
    });
  }

  window.ferramentasModuleInitialized = true;
}