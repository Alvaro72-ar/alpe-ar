document.addEventListener('DOMContentLoaded', function() {
    // Utilitário para acesso seguro ao Storage (evita erro de Tracking Prevention)
    const safeStorage = {
        get: (key) => {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        },
        set: (key, value) => {
            try { localStorage.setItem(key, value); } catch (e) { return false; }
        }
    };

    // 1. Inicializa o carrinho recuperando dados salvos ou criando lista vazia
    const savedCart = safeStorage.get('alpe_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    updateBadge();

    // 2. Adiciona ação aos botões "COMPRAR AGORA"
    const addButtons = document.querySelectorAll('.btn-add-cart');
    addButtons.forEach(btn => btn.addEventListener('click', function(e) { e.preventDefault(); addToCart(this); }));

    // 3. Adiciona ação ao ícone do carrinho no menu
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) cartLink.addEventListener('click', function(e) { e.preventDefault(); showCartModal(); });

    // --- FUNÇÕES ---

    function addToCart(btn) {
        const card = btn.closest('.produto-card');
        if (!card) return;
        const product = {
            id: Date.now(),
            name: card.querySelector('h4').innerText,
            price: card.querySelector('.preco').innerText,
            image: card.querySelector('img').src
        };
        cart.push(product);
        safeStorage.set('alpe_cart', JSON.stringify(cart));
        updateBadge();

        const originalText = btn.innerText;
        btn.innerText = 'ADICIONADO!';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => { btn.innerText = originalText; btn.style.backgroundColor = ''; }, 1500);
    }

    function updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => b.innerText = cart.length);
    }

    function showCartModal() {
        let modal = document.getElementById('cart-modal');
        if (!modal) { createCartModal(); modal = document.getElementById('cart-modal'); }
        renderCartItems();
        modal.style.display = 'flex';
    }

    function createCartModal() {
        const modalHTML = `
            <div id="cart-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center;">
                <div style="background:white; width:90%; max-width:500px; padding:20px; border-radius:10px; position:relative; max-height:80vh; display:flex; flex-direction:column;">
                    <span id="close-cart" style="position:absolute; top:10px; right:15px; font-size:24px; cursor:pointer; font-weight:bold;">&times;</span>
                    <h2 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px; color:#333;">Seu Carrinho</h2>
                    <div id="cart-items" style="overflow-y:auto; flex:1; margin:10px 0;"></div>
                    <div style="border-top:1px solid #eee; padding-top:15px; display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 10px;">
                        <button type="button" id="clear-cart" style="background:#dc3545; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer;">Esvaziar</button>
                        <div style="display: flex; gap: 10px; margin-left: auto; flex-wrap: wrap;">
                            <a href="checkout.html" id="dashboard-checkout-btn" style="background:#007bff; color:white; text-decoration:none; padding:10px 15px; border-radius:5px; font-weight:bold; font-size: 14px;">Finalizar Pedido</a>
                            <a href="#" id="checkout-btn" target="_blank" style="background:#25d366; color:white; text-decoration:none; padding:10px 15px; border-radius:5px; font-weight:bold; font-size: 14px;">Via WhatsApp</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalEl = document.getElementById('cart-modal');
        modalEl.querySelector('#close-cart').addEventListener('click', () => modalEl.style.display = 'none');
        modalEl.addEventListener('click', (e) => { if (e.target === modalEl) modalEl.style.display = 'none'; });
        modalEl.querySelector('#clear-cart').addEventListener('click', () => {
            if (confirm('Esvaziar carrinho?')) { cart = []; safeStorage.set('alpe_cart', JSON.stringify(cart)); updateBadge(); renderCartItems(); }
        });
    }

    function renderCartItems() {
        const container = document.getElementById('cart-items');
        const checkoutBtn = document.getElementById('checkout-btn');
        const dashboardCheckoutBtn = document.getElementById('dashboard-checkout-btn');
        const clearCartBtn = document.getElementById('clear-cart');

        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666;">Seu carrinho está vazio.</p>';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            if (dashboardCheckoutBtn) dashboardCheckoutBtn.style.display = 'none';
            if (clearCartBtn) clearCartBtn.style.display = 'none';
            return;
        }
        if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
        if (dashboardCheckoutBtn) dashboardCheckoutBtn.style.display = 'inline-block';
        if (clearCartBtn) clearCartBtn.style.display = 'inline-block';

        let msg = 'Olá ALPE, gostaria de finalizar o pedido:%0A%0A';
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#f8f9fa; padding:10px; border-radius:5px;';
            div.innerHTML = `<img src="${item.image}" style="width:50px; height:50px; object-fit:contain; background:white; border: 1px solid #eee; border-radius: 4px;"><div style="flex:1;"><h4 style="margin:0; font-size:14px; color:#333;">${item.name}</h4><span style="color:#007bff; font-weight:bold;">${item.price}</span></div><button type="button" data-index="${index}" style="border:none; background:none; color:red; cursor:pointer; font-weight:bold; font-size: 18px; padding: 5px;">&times;</button>`;
            container.appendChild(div);
            div.querySelector('button').addEventListener('click', () => removeItem(index));
            msg += `* ${item.name} - ${item.price}%0A`;
        });

        const phone = (typeof WHATSAPP_NUMBER !== 'undefined') ? WHATSAPP_NUMBER : '5521980220417';
        const waHref = `https://api.whatsapp.com/send?phone=${phone}&text=${msg}`;
        if (checkoutBtn) checkoutBtn.href = waHref;
        if (dashboardCheckoutBtn) dashboardCheckoutBtn.href = waHref;

        // Função global auxiliar para remover item (necessária pois o onclick pode ser inline em alguns templates)
        window.removeItem = function(index) {
            cart.splice(index, 1);
            safeStorage.set('alpe_cart', JSON.stringify(cart));
            updateBadge();
            renderCartItems();
        };
    }
});
