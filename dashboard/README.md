# ClimaERP AI - Dashboard

Este é o painel de controle e gestão para a loja ALPE.

## Como Funciona a "Área do Cliente"

A "Área do Cliente" é uma visualização especial dentro do dashboard, projetada para simular a tela que um cliente veria ao rastrear seu pedido.

### Ativação

Existem duas maneiras de acessar esta área:

1.  **Pelo Botão "Ver como Cliente"**: No topo do Dashboard, há um botão que alterna a visualização para a área do cliente.
2.  **Via URL**: Acessando a URL do dashboard com a hash `#/cliente` (ex: `.../dashboard/index.html#/cliente`).

### Sincronização de Dados

-   **Pedido Exibido**: A página mostra os detalhes do **pedido mais recente** registrado na seção "Pedidos" do dashboard.
-   **Fonte dos Dados**: Os pedidos são carregados do `localStorage` do navegador, que é onde a loja virtual salva as compras finalizadas. Isso garante a sincronia entre a loja e o painel.

### Progresso do Pedido

O gráfico de progresso (em formato de anel) é atualizado dinamicamente com base no status do pedido:

-   **Pendente**: 10%
-   **Pago**: 40%
-   **Enviado**: 75%
-   **Entregue**: 100%
-   **Cancelado**: 0%

### Ações do Cliente

-   **Agendar Instalação**: Quando o status do pedido muda para "Entregue", um botão **"Agendar Instalação"** aparece.
-   **Funcionalidade**: Este botão abre uma conversa no WhatsApp com uma mensagem pré-preenchida, incluindo o número do pedido, facilitando para o cliente solicitar o serviço de instalação.