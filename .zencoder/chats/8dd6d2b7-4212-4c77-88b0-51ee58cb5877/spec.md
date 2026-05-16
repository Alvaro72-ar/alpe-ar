# Technical Specification — Correção do Checkout e Página de Confirmação de Pedido

## Complexity Assessment
**Medium** — Bug fix + new page creation. Involves debugging silent form submission failure, creating a confirmation page, and wiring up the redirect flow.

---

## Technical Context

- **Language/Stack**: Vanilla HTML, CSS, JavaScript (no build tools, no framework)
- **Storage**: `localStorage` key `alpe_cart` (array of `{id, name, price, image}`)
- **Email service**: Formspree (`https://formspree.io/f/xpwzgvqr`)
- **No backend/database** — purely static site

---

## Root Cause Analysis

### Bug 1 — Silent failure in the form's error handler
In `checkout.html`, the `else` branch calls `response.json().then(...)` without a `.catch()`. If Formspree returns a non-JSON body (e.g. an HTML error page for an unconfigured/expired form), the JSON parsing throws, but since there's no `.catch()` on that inner promise, **nothing happens** — the button stays in "ENVIANDO..." state indefinitely and the user sees no feedback.

### Bug 2 — No redirect / "dashboard" after success
On success, the code hides the form and shows a `<div id="thank-you-message">`. The user expects to be taken to a dedicated confirmation page (called "dashboard"), which doesn't exist yet. The current in-page div is easily missed.

---

## Implementation Approach

### 1. Fix the silent error in `checkout.html`
Add a `.catch()` to the inner `response.json()` promise so that non-JSON error responses are handled gracefully and the user always gets feedback.

### 2. Create `pedido-confirmado.html` (Confirmation / "Dashboard" page)
A new page that:
- Reads the last submitted order from `localStorage` (we'll save it there before submission)
- Displays: order items, total, customer name, delivery address
- Shows a WhatsApp follow-up button
- Shows a "Voltar ao Início" link
- Clears `alpe_cart` from localStorage on load (since the order was placed)

### 3. Update `checkout.html` submit flow
On successful Formspree response:
1. Save order snapshot to `localStorage` key `alpe_last_order` (items + total + customer data)
2. Redirect to `pedido-confirmado.html` (instead of showing the hidden div)

---

## Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `checkout.html` | **Modify** | Fix silent error + save order snapshot + redirect on success |
| `pedido-confirmado.html` | **Create** | New confirmation/dashboard page |

---

## Data Model

### `alpe_last_order` (localStorage)
```json
{
  "items": [{ "name": "...", "price": "...", "image": "..." }],
  "total": "R$ 4.485,72",
  "cliente": {
    "nome": "...",
    "email": "...",
    "telefone": "...",
    "endereco": "..."
  },
  "data": "10/03/2026 15:24"
}
```

---

## Verification Steps

1. Add products to cart and navigate to `checkout.html`
2. Fill out form and submit — button should show "ENVIANDO..."
3. On success: browser redirects to `pedido-confirmado.html`
4. `pedido-confirmado.html` shows all order items, total, and customer info
5. `alpe_cart` is cleared from localStorage (cart badge resets to 0)
6. WhatsApp button pre-fills the message with order details
7. If Formspree returns an error (e.g. simulate with network block), user sees an alert — button re-enables
