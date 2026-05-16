const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'sobre-nos/sobre-nos.html',
  'marcas.index/daikin.html',
  'marcas.index/elgin.html',
  'marcas.index/electrolux.html',
  'marcas.index/fujitsu.html',
  'marcas.index/lg.html',
  'marcas.index/hitachi.html',
  'marcas.index/tcl.html',
  'marcas.index/samsung.html',
  'marcas.index/philco.html',
  'marcas.index/hisense.html',
  'marcas.index/midea.html',
  'marcas.index/gree.html'
];

const newCss = `.top-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #000;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s ease;
}
.top-item:hover {
    color: var(--cor-principal);
}
.top-item div {`;

function getNewBar(relPath = '') {
  const imgPath = relPath + 'images/icone/';
  const rastreioPath = relPath + 'rastreio.html';
  const contatoPath = (relPath || './') + 'index.html#contato';
  
  return `    <div class="top-bar-container">
        <a href="https://api.whatsapp.com/send?phone=5521980220417&text=Olá%20ALPE,%20visitei%20o%20site%20e%20gostaria%20de%20falar%20com%20um%20especialista." target="_blank" class="top-item">
            <img src="${imgPath}Fale_conosco.png" alt="Chat">
            <div><strong>FALE CONOSCO</strong></div>
        </a>
        <a href="tel:21980220417" class="top-item">
            <img src="${imgPath}Televendas.png" alt="Telefone">
            <div><strong>TELEVENDAS</strong></div>
        </a>
        <a href="https://api.whatsapp.com/send?phone=5521980220417&text=Olá%20ALPE,%20visitei%20o%20site%20e%20gostaria%20de%20comprar." target="_blank" class="top-item">
            <img src="${imgPath}whatsapp-logo-.png" alt="WhatsApp">
            <div><strong>Compre pelo WhatsApp</strong></div>
        </a>
        <a href="${rastreioPath}" class="top-item">
            <img src="${imgPath}entrega.png" alt="Entrega">
            <div><strong>Entrega em todo o Brasil</strong><span>verifique as modalidades</span></div>
        </a>
        <a href="${contatoPath}" class="top-item">
            <img src="${imgPath}Cartao_parc.png" alt="Cartão">
            <div><strong>Parcele em até 8x</strong><span>sem juros</span></div>
        </a>
        <a href="${contatoPath}" class="top-item">
            <img src="${imgPath}Pix.png" alt="Pix">
            <div><strong>5% OFF no PIX</strong><span>pagamento à vista</span></div>
        </a>
    </div>`;
}

const barRegex = /<div class="top-bar-container">[\s\S]*?<\/div>/;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update CSS if it matches the old pattern
  if (!content.includes('cursor: pointer') || !content.includes('text-decoration: none')) {
      // Find the .top-item block and inject properties
      content = content.replace(/\.top-item\s*\{[\s\S]*?\}/, (match) => {
          if (match.includes('cursor: pointer')) return match;
          return `.top-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #000;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s ease;
}
.top-item:hover {
    color: var(--cor-principal);
}`;
      });
  }

  const isSubDir = file.includes('/');
  const relPath = isSubDir ? '../' : '';
  
  content = content.replace(barRegex, getNewBar(relPath));
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
