function initIAModule() {
  // Previne que os eventos sejam adicionados múltiplas vezes
  if (window.iaModuleInitialized) return;

  // --- Elementos do DOM ---
  const btnCalc = document.getElementById("btnCalc");
  const btnReset = document.getElementById("btnReset");
  const chat = document.getElementById("chat");
  const inputChat = document.getElementById("input-chat");
  const btnEnviar = document.getElementById("btn-enviar");

  // --- Funções ---

  // Função para calcular preço sugerido
  function calcularPrecoSugerido(custo, imposto, margem, frete, posicionamento) {
    let precoBase = (custo + frete) / (1 - margem / 100);
    precoBase *= (1 + imposto / 100);

    const ajustes = {
      conservador: 1.00,
      competitivo: 0.95,
      premium: 1.10
    };
    const multiplicador = ajustes[posicionamento] || 1.00;

    return precoBase * multiplicador;
  }

  // Atualiza o preço sugerido e recomendações
  function atualizarResultado() {
    const custo = parseFloat(document.getElementById("custo").value) || 0;
    const imposto = parseFloat(document.getElementById("imposto").value) || 0;
    const margem = parseFloat(document.getElementById("margem").value) || 0;
    const frete = parseFloat(document.getElementById("frete").value) || 0;
    const posicionamento = document.getElementById("posicionamento").value;

    if (custo <= 0) {
      showToast("Por favor, informe um custo válido.");
      return;
    }

    const preco = calcularPrecoSugerido(custo, imposto, margem, frete, posicionamento);
    document.getElementById("precoSugerido").textContent = brl(preco);

    // Recomendações simples baseadas no preço
    const rec = document.getElementById("recomendacoes");
    if (posicionamento === "competitivo") {
      rec.innerHTML = "<strong>Sugestão:</strong> Considere promoções para ganhar volume de vendas.";
    } else if (posicionamento === "premium") {
      rec.innerHTML = "<strong>Sugestão:</strong> Destaque o valor agregado para justificar o preço premium.";
    } else {
      rec.innerHTML = "<strong>Sugestão:</strong> Mantenha a margem protegida para maior segurança financeira.";
    }
  }

  // Limpa formulário e resultados
  function limparFormulario() {
    document.getElementById("custo").value = "";
    document.getElementById("imposto").value = "10";
    document.getElementById("margem").value = "25";
    document.getElementById("frete").value = "120";
    document.getElementById("btu").value = "12000";
    document.getElementById("posicionamento").value = "conservador";
    document.getElementById("precoSugerido").textContent = "R$ —";
    document.getElementById("recomendacoes").innerHTML = "Informe os parâmetros e clique em calcular para ver as recomendações.";
    showToast("Formulário resetado.");
  }

  function adicionarMensagem(texto, tipo) {
    const msg = document.createElement("div");
    msg.classList.add('chat-message', tipo); // Usa classes CSS
    msg.textContent = texto;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function handleChatSubmit() {
    const texto = inputChat.value.trim();
    if (!texto) return;
    adicionarMensagem(texto, "usuario");
    inputChat.value = "";
    // Simula resposta IA
    setTimeout(() => {
      adicionarMensagem("Esta é uma resposta simulada da IA para: '" + texto + "'", "ia");
    }, 1000);
  }

  // --- Event Listeners ---
  btnCalc?.addEventListener("click", atualizarResultado);
  btnReset?.addEventListener("click", limparFormulario);
  btnEnviar?.addEventListener("click", handleChatSubmit);
  inputChat?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleChatSubmit();
    }
  });

  // Adiciona mensagem inicial no chat
  setTimeout(() => {
    adicionarMensagem("Olá! Sou o assistente de IA do ClimaERP. Como posso ajudar com sua estratégia de preços hoje?", "ia");
  }, 500);

  window.iaModuleInitialized = true;
}