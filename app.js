// 1. Domyślne dane i konfiguracja sklepu
const defaultItems = [
    { id: 1, name: "Kawa ziarnista Arabica", price: 65.00, qty: 2 },
    { id: 2, name: "Chleb żytni na zakwasie", price: 12.50, qty: 1 },
    { id: 3, name: "Mleko owsiane Barista", price: 9.00, qty: 3 }
];

// NOWOŚĆ: Konfiguracja kosztów dostawy
const FREE_SHIPPING_THRESHOLD = 150.00;
const STANDARD_SHIPPING_COST = 15.00;

let state = {
    items: JSON.parse(localStorage.getItem('cart_items')) || defaultItems,
    notes: localStorage.getItem('cart_notes') || "",
    isOrdered: false
};

const formatPrice = (value) => value.toFixed(2).replace('.', ',') + ' zł';

// 3. Logika wyświetlania
const render = () => {
    const appContainer = document.getElementById('cart-app');

    if (state.isOrdered) {
        appContainer.innerHTML = `
            <header class="cart-header">
                <h1>Dziękujemy za zamówienie!</h1>
            </header>
            <div class="order-success-message" style="text-align: center; padding: 30px; color: #2e7d32;">
                <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Twoje zamówienie zostało pomyślnie przyjęte.</p>
                <p style="color: #7f8c8d;">Koszyk został opróżniony, a dane przesłane do realizacji.</p>
            </div>
        `;
        return;
    }

    // Obliczenia na bieżąco
    const totalItemsCount = state.items.reduce((acc, item) => acc + item.qty, 0);
    const itemsTotalValue = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

    if (state.items.length === 0) {
        appContainer.innerHTML = `
            <header class="cart-header">
                <h1>Twój Koszyk</h1>
                <span class="cart-badge">0 produktów</span>
            </header>
            <p class="empty-cart-message" style="text-align: center; padding: 20px; color: #7f8c8d;">
                Twój koszyk jest pusty.
            </p>
        `;
        return; 
    }

    // NOWOŚĆ: Logika dynamicznej dostawy
    const isShippingFree = itemsTotalValue >= FREE_SHIPPING_THRESHOLD;
    const shippingCost = isShippingFree ? 0 : STANDARD_SHIPPING_COST;
    const totalOrderValue = itemsTotalValue + shippingCost;
    const amountMissingForFreeShipping = FREE_SHIPPING_THRESHOLD - itemsTotalValue;
    const progressPercentage = Math.min((itemsTotalValue / FREE_SHIPPING_THRESHOLD) * 100, 100);

    appContainer.innerHTML = `
        <header class="cart-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1>Twój Koszyk</h1>
                <span class="cart-badge">${totalItemsCount} ${totalItemsCount === 1 ? 'produkt' : 'produkty'}</span>
            </div>
            <button type="button" class="clear-cart-btn" onclick="clearCart()" style="background: none; border: 1px solid #e74c3c; color: #e74c3c; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                Wyczyść koszyk
            </button>
        </header>

        <div class="free-shipping-tracker" style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin-bottom: 8px; font-size: 14px; color: #2e7d32; font-weight: bold; text-align: center;">
                ${isShippingFree 
                    ? '🎉 Masz darmową dostawę!' 
                    : `Brakuje Ci jeszcze <span style="font-size: 16px;">${formatPrice(amountMissingForFreeShipping)}</span> do darmowej dostawy!`}
            </p>
            <div style="background: #c8e6c9; height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="width: ${progressPercentage}%; background: #4caf50; height: 100%; transition: width 0.3s ease;"></div>
            </div>
        </div>

        <ul class="cart-list">
            ${state.items.map(item => `
                <li class="cart-item">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-unit-price">${formatPrice(item.price)} / szt.</span>
                    </div>
                    
                    <div class="item-actions">
                        <div class="quantity-controls">
                            <button type="button" class="qty-btn" onclick="updateQty(${item.id}, -1)" aria-label="Zmniejsz">−</button>
                            <input type="number" class="qty-input" value="${item.qty}" min="1" readonly>
                            <button type="button" class="qty-btn" onclick="updateQty(${item.id}, 1)" aria-label="Zwiększ">+</button>
                        </div>
                        <span class="item-total-price">${formatPrice(item.price * item.qty)}</span>
                        <button type="button" class="delete-button" onclick="deleteItem(${item.id})" aria-label="Usuń z koszyka">✕</button>
                    </div>
                </li>
            `).join('')}
        </ul>

        <footer class="cart-summary">
            <div class="summary-details" style="margin-bottom: 15px; border-bottom: 1px dashed #e0e0e0; padding-bottom: 15px;">
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #7f8c8d;">
                    <span>Suma częściowa (${totalItemsCount} szt.):</span>
                    <span>${formatPrice(itemsTotalValue)}</span>
                </div>
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #7f8c8d;">
                    <span>Dostawa:</span>
                    <span style="${isShippingFree ? 'color: #2e7d32; font-weight: bold;' : ''}">
                        ${isShippingFree ? 'Darmowa' : formatPrice(shippingCost)}
                    </span>
                </div>
            </div>

            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span style="font-weight: bold; font-size: 18px;">Razem do zapłaty:</span>
                <span class="summary-total" style="font-weight: bold; font-size: 22px; color: #2c3e50;">${formatPrice(totalOrderValue)}</span>
            </div>
            
            <form action="/checkout" method="POST" class="checkout-form" onsubmit="handleCheckout(event)">
                <textarea 
                    class="order-notes" 
                    placeholder="Dodatkowe uwagi do zamówienia (opcjonalnie)..."
                    oninput="updateNotes(event)"
                >${state.notes}</textarea>
                <button type="submit" class="checkout-button">Złóż zamówienie i zapłać</button>
            </form>
        </footer>
    `;
};

const syncStorageAndRender = () => {
    localStorage.setItem('cart_items', JSON.stringify(state.items));
    localStorage.setItem('cart_notes', state.notes);
    render();
};

window.clearCart = () => {
    state.items = [];
    state.notes = "";
    syncStorageAndRender();
};

window.updateQty = (id, change) => {
    state.items = state.items.map(item => {
        if (item.id === id) {
            const newQty = item.qty + change;
            return { ...item, qty: newQty < 1 ? 1 : newQty };
        }
        return item;
    });
    syncStorageAndRender();
};

window.deleteItem = (id) => {
    state.items = state.items.filter(item => item.id !== id);
    syncStorageAndRender();
};

window.updateNotes = (event) => {
    state.notes = event.target.value;
    localStorage.setItem('cart_notes', state.notes);
};

window.handleCheckout = (event) => {
    event.preventDefault();
    
    // Używamy tych samych obliczeń co w render, by znać finalną cenę przy kasie
    const itemsTotalValue = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shippingCost = itemsTotalValue >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
    const finalOrderTotal = itemsTotalValue + shippingCost;

    alert("Zamówienie na kwotę: " + formatPrice(finalOrderTotal) + " zostało wysłane!");

    state.items = [];
    state.notes = "";
    state.isOrdered = true; 

    localStorage.removeItem('cart_items');
    localStorage.removeItem('cart_notes');

    render();
};

render();