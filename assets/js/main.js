document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  
  // Função segura para acessar o Storage (evita erro de Tracking Prevention)
  const inMemoryStorage = {};
  const safeStorage = {
    get: (key) => {
      try {
        return localStorage.getItem(key) || inMemoryStorage[key] || null;
      } catch (e) {
        return inMemoryStorage[key] || null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        inMemoryStorage[key] = value;
      }
    }
  };

  // Recupera o carrinho salvo ou inicia vazio
  let carrinho = JSON.parse(safeStorage.get('alpe_cart')) || [];
  
  // Função auxiliar de formatação (estava faltando)
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  
  // Lista de Produtos atualizada conforme o HTML da loja
  const produtos = [
    { id: 1, nome: "Samsung Inverter 12.000 BTU", preco: 2999.00 },
    { id: 2, nome: "LG Dual Inverter 9.000 BTU", preco: 2450.00 },
    { id: 3, nome: "Daikin Cassete 36.000 BTU", preco: 8990.00 },
    { id: 4, nome: "Hisense Inverter 12.000 BTU", preco: 2050.48 },
    { id: 5, nome: "Elgin Inverter 12.000 BTU", preco: 2155.60 },
    { id: 6, nome: "Electrolux Inverter 9.000 BTU", preco: 1709.05 },
    { id: 7, nome: "Fujitsu Inverter 9.000 BTU", preco: 1709.05 },
    { id: 8, nome: "Hitachi Inverter 9.000 BTU", preco: 2496.79 },
    { id: 9, nome: "Philco Inverter 12.000 BTU", preco: 2435.24 },
    { id: 10, nome: "Gree Inverter 9.000 BTU", preco: 2435.24 },
    { id: 11, nome: "TCL Inverter 12.000 BTU", preco: 2435.24 },
    { id: 12, nome: "Midea Inverter 9.000 BTU", preco: 2435.24 }
  ];

  // --- DOM Elements ---
  const cartCountEl = document.getElementById("cart-count");
  const catalogoContainer = document.getElementById("catalogo-produtos");
  const carrinhoListaEl = document.getElementById("carrinho-lista");

  // --- Functions ---

  // Render products in the store (Usado apenas se não houver HTML estático, mas mantemos para referência)
  function renderProdutos() {
    if (!catalogoContainer) return;
    // Se o container já tiver conteúdo (HTML estático), não renderiza dinamicamente
    if (catalogoContainer.children.length > 0) return;

    catalogoContainer.innerHTML = "";
    produtos.forEach(prod => {
      const card = document.createElement("div");
      card.className = "produto-card";
      card.innerHTML = `
        <div class="placeholder-img produto-img-placeholder">Imagem do Produto</div>
        <div class="produto-info">
          <h4>${prod.nome}</h4>
          <div class="preco">${brl(prod.preco)}</div>
          <a href="#" class="cta-card btn-add-cart" data-id="${prod.id}">COMPRAR AGORA</a>
        </div>
      `;
      catalogoContainer.appendChild(card);
    });
  }

  // Função para exibir mensagem (Toast)
  function showToast(msg) {
    const div = document.createElement("div");
    div.className = "toast";
    div.innerHTML = `<i class="fas fa-check-circle" style="color:#3DE3C9; margin-right:8px;"></i> ${msg}`;
    // Garante que o CSS do toast funcione (se não estiver carregado, define estilos inline básicos)
    if (!document.querySelector('.toast-style')) {
        div.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#0B1220; color:white; padding:12px 24px; border-radius:12px; z-index:9999; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; align-items:center;";
    }
    document.body.appendChild(div);
    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  // Update cart counter in the header
  function atualizarContadorCarrinho() {
    if (cartCountEl) cartCountEl.textContent = carrinho.length;
    safeStorage.set('alpe_cart', JSON.stringify(carrinho)); // Salva no navegador
  }

  // Render items in the cart page
  function renderCarrinho() {
    if (!carrinhoListaEl) return;
    carrinhoListaEl.innerHTML = "";
    if (carrinho.length === 0) {
      carrinhoListaEl.innerHTML = "<p>Seu carrinho está vazio.</p>";
      return;
    }
    carrinho.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "carrinho-item";
      // Exibe nome e preço (string) + Imagem se disponível
      div.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.image || ''}" style="width:50px; height:50px; object-fit:contain; border:1px solid #eee; border-radius:4px;">
          <span><strong>${item.name}</strong> <br> ${item.price}</span>
        </div>
        <button data-index="${index}" class="btn btn-rose btn-sm btn-remove">Remover</button>
      `;
      carrinhoListaEl.appendChild(div);
    });
  }

  // Main page navigation
  function mostrarPagina(id) {
    document.querySelectorAll("section.page").forEach(sec => {
      sec.classList.toggle("active", sec.id === id);
    });
  }

  // --- Event Listeners ---

  // Main navigation
  document.getElementById("nav-loja")?.addEventListener("click", e => { e.preventDefault(); mostrarPagina("page-loja"); });
  document.getElementById("nav-produtos")?.addEventListener("click", e => { e.preventDefault(); mostrarPagina("page-loja"); });
  document.getElementById("nav-carrinho")?.addEventListener("click", e => { e.preventDefault(); renderCarrinho(); mostrarPagina("page-carrinho"); });
  document.getElementById("btn-ir-loja")?.addEventListener("click", e => { e.preventDefault(); mostrarPagina("page-loja"); });
  
  // Ícone de carrinho no header da nova loja
  document.querySelector(".cart-link")?.addEventListener("click", e => { e.preventDefault(); renderCarrinho(); mostrarPagina("page-carrinho"); });

  // Storefront and Cart actions
  document.addEventListener("click", e => {
    const btnAdd = e.target.closest(".btn-add-cart");
    if (btnAdd) {
      e.preventDefault();
      
      // Se o botão tem onclick com abrirCheckout, deixa o modal abrir
      if (btnAdd.getAttribute('onclick') && btnAdd.getAttribute('onclick').includes('abrirCheckout')) {
        return;
      }
      
      // Captura os dados direto do cartão do produto (DOM) para garantir consistência
      const card = btnAdd.closest('.produto-card');
      if (card) {
        const produto = {
          id: Date.now(),
          name: card.querySelector('h4').innerText,
          price: card.querySelector('.preco').innerText,
          image: card.querySelector('img').src
        };
        
        carrinho.push(produto);
        atualizarContadorCarrinho();

        const isMarcaPage = window.location.pathname.includes('/marcas.index/');
        const checkoutUrl = isMarcaPage ? '../checkout.html' : 'checkout.html';
        window.location.href = checkoutUrl;
      }
    }

    const btnRemove = e.target.closest(".btn-remove");
    if (btnRemove) {
      const index = parseInt(btnRemove.dataset.index);
      carrinho.splice(index, 1);
      atualizarContadorCarrinho();
      renderCarrinho();
    }
  });

  // Checkout process
  document.getElementById("btn-finalizar")?.addEventListener("click", () => mostrarPagina("page-checkout"));
  document.getElementById("form-checkout")?.addEventListener("submit", e => {
    e.preventDefault();
    
    // Integração: Criar objeto do pedido
    const nomeCliente = document.getElementById("nome").value;
    const hoje = new Date().toISOString().split('T')[0];
    const itensPedido = carrinho.map(i => i.name).join(", ");
    
    // Calcula total convertendo string de preço "R$ 2.000,00" para number
    const totalPedido = carrinho.reduce((acc, i) => {
        const valor = parseFloat(i.price.replace('R$','').trim().replace(/\./g,'').replace(',','.')) || 0;
        return acc + valor;
    }, 0);
    
    // Para simplificar, cria um pedido para cada item ou agrupa (aqui agruparemos o primeiro item como exemplo principal)
    if (carrinho.length > 0) {
      const pedidoNovo = {
        id: Math.floor(Math.random() * 10000) + 1000, // Gera ID aleatório
        cliente: nomeCliente,
        itens: itensPedido,
        total: totalPedido,
        status: "Pendente",
        instalacao: "Aguardando",
        data: hoje
      };
      
      // Salva no LocalStorage para o Dashboard ler
      const pedidosSalvos = JSON.parse(safeStorage.get('alpe_pedidos')) || [];
      pedidosSalvos.unshift(pedidoNovo);
      safeStorage.set('alpe_pedidos', JSON.stringify(pedidosSalvos));
    }

    showToast("Pedido enviado para o Admin!");
    carrinho = [];
    atualizarContadorCarrinho();
    e.target.reset();
    mostrarPagina("page-loja");
  });

  // --- Initial Load ---
  renderProdutos();
  atualizarContadorCarrinho();

  // === Integração Scripts da Loja ===
  
  // 1. Calculadora BTU
  const btuForm = document.getElementById('btuForm');
  if (btuForm) {
    btuForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const area = Number(document.getElementById('area').value) || 0;
      const pessoas = Number(document.getElementById('pessoas').value) || 1;
      const base = area * 600;
      const pessoasExtra = Math.max(0, pessoas - 1) * 600;
      const resultado = Math.ceil(base + pessoasExtra);
      const recomendado = resultado < 7000 ? 7000 : resultado;
      document.getElementById('btuResult').textContent = 'BTU recomendado: ' + recomendado + ' BTU';
    });
  }

  // 2. Menu Mobile
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
          nav.classList.toggle('nav-open');
          const icon = menuToggle.querySelector('i');
          // Troca o ícone e controla o scroll da página
          if (nav.classList.contains('nav-open')) {
              icon.classList.remove('fa-bars');
              icon.classList.add('fa-times');
              document.body.style.overflow = 'hidden'; // Impede o scroll do fundo
          } else {
              icon.classList.remove('fa-times');
              icon.classList.add('fa-bars');
              document.body.style.overflow = ''; // Libera o scroll
          }
      });

      // Dropdown logic for mobile
      const dropdownLinks = document.querySelectorAll('#main-nav .dropdown > a');
      dropdownLinks.forEach(link => {
          link.addEventListener('click', function(e) {
              // Only run this on mobile view (when the toggle is visible)
              if (window.getComputedStyle(menuToggle).display !== 'none') {
                  e.preventDefault();
                  const content = this.nextElementSibling;
                  if (content) {
                      // Toggle display for the clicked dropdown
                      const isVisible = content.style.display === 'block';
                      content.style.display = isVisible ? 'none' : 'block';
                  }
              }
          });
      });
  }

  // 3. Carrossel Simples
  const track = document.getElementById('carouselTrack');
  if(track) {
    const slides = Array.from(track.children);
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    let index = 0;

    function updateCarousel() {
      index = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    if(next) next.onclick = () => { index++; updateCarousel(); };
    if(prev) prev.onclick = () => { index--; updateCarousel(); };
    
    // Auto play
    setInterval(() => {
      index++;
      updateCarousel();
    }, 5000);
  }
});