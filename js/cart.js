document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicializa o carrinho recuperando dados salvos ou criando lista vazia
    let cart = JSON.parse(localStorage.getItem('alpe_cart')) || [];
    updateBadge();

    // 2. Adiciona ação aos botões "COMPRAR AGORA"
    const addButtons = document.querySelectorAll('.btn-add-cart');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que a página pule para o topo
            addToCart(this);
        });
    });

    // 3. Adiciona ação ao ícone do carrinho no menu
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            showCartModal();
        });
    }

    // --- FUNÇÕES ---

    function addToCart(btn) {
        // Encontra o cartão do produto pai do botão clicado
        const card = btn.closest('.produto-card');
        if (!card) return;

        // Pega as informações do produto
        const product = {
            id: Date.now(), // Gera um ID único
            name: card.querySelector('h4').innerText,
            price: card.querySelector('.preco').innerText,
            image: card.querySelector('img').src
        };

        // Salva na lista e no navegador
        cart.push(product);
        localStorage.setItem('alpe_cart', JSON.stringify(cart));
        updateBadge();
        
        // Efeito visual no botão para confirmar
        const originalText = btn.innerText;
        btn.innerText = "ADICIONADO!";
        btn.style.backgroundColor = "#28a745"; // Verde
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = ""; // Volta a cor original
        }, 1500);
    }

    function updateBadge() {
        // Atualiza a bolinha vermelha com a quantidade
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => b.innerText = cart.length);
    }

    function showCartModal() {
        // Cria o modal se ele não existir
        let modal = document.getElementById('cart-modal');
        if (!modal) {
            createCartModal();
            modal = document.getElementById('cart-modal');
        }
        renderCartItems();
        modal.style.display = 'flex';
    }

    function createCartModal() {
        // HTML da janela do carrinho
        const modalHTML = `
            <div id="cart-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center;">
                <div style="background:white; width:90%; max-width:500px; padding:20px; border-radius:10px; position:relative; max-height:80vh; display:flex; flex-direction:column;">
                    <span id="close-cart" style="position:absolute; top:10px; right:15px; font-size:24px; cursor:pointer; font-weight:bold;">&times;</span>
                    <h2 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; color:#333;">Seu Carrinho</h2>
                    <div id="cart-items" style="overflow-y:auto; flex:1; margin:10px 0;"></div>
                    <div style="border-top:1px solid #eee; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
                        <button type="button" id="clear-cart" style="background:#dc3545; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Limpar</button>
                        <a href="#" id="checkout-btn" target="_blank" style="background:#25d366; color:white; text-decoration:none; padding:10px 20px; border-radius:5px; font-weight:bold;">Finalizar no WhatsApp</a>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Fechar modal
        document.getElementById('close-cart').addEventListener('click', () => document.getElementById('cart-modal').style.display = 'none');
        document.getElementById('cart-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('cart-modal')) document.getElementById('cart-modal').style.display = 'none';
        });
        // Limpar carrinho
        document.getElementById('clear-cart').addEventListener('click', () => {
            if(confirm('Esvaziar carrinho?')) { cart = []; localStorage.setItem('alpe_cart', JSON.stringify(cart)); updateBadge(); renderCartItems(); }
        });
    }

    function renderCartItems() {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666;">Seu carrinho está vazio.</p>';
            document.getElementById('checkout-btn').style.display = 'none';
            return;
        }
        document.getElementById('checkout-btn').style.display = 'block';
        
        let msg = "Olá ALPE, gostaria de finalizar o pedido:%0A%0A";
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = "display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#f8f9fa; padding:10px; border-radius:5px;";
            div.innerHTML = `<img src="${item.image}" style="width:50px; height:50px; object-fit:contain; background:white;"><div style="flex:1;"><h4 style="margin:0; font-size:14px; color:#333;">${item.name}</h4><span style="color:#007bff; font-weight:bold;">${item.price}</span></div><button type="button" onclick="removeItem(${index})" style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;">X</button>`;
            container.appendChild(div);
            msg += `* ${item.name} - ${item.price}%0A`;
        });
        document.getElementById('checkout-btn').href = `https://api.whatsapp.com/send?phone=5521980220417&text=${msg}`;
        
        // Função global auxiliar para remover item (necessária pois o onclick é inline)
        window.removeItem = function(index) {
            cart.splice(index, 1);
            localStorage.setItem('alpe_cart', JSON.stringify(cart));
            updateBadge();
            renderCartItems();
        };
    }
});
