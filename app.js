// 1. Deklaratywne Źródło Prawdy (Stan aplikacji)
// Dane początkowe w przypadku braku zapisu w localStorage
const defaultItems = [
    { id: 1, name: "Kawa ziarnista Arabica", price: 65.00, qty: 2 },
    { id: 2, name: "Chleb żytni na zakwasie", price: 12.50, qty: 1 },
    { id: 3, name: "Mleko owsiane Barista", price: 9.00, qty: 3 }
];

let state = {
    items: JSON.parse(localStorage.getItem('cart_items')) || defaultItems,
    notes: localStorage.getItem('cart_notes') || ""
};

// Pomocniczy Formater Walut (czysta funkcja transformacji danych)
const formatPrice = (value) => value.toFixed(2).replace('.', ',') + ' zł';

// 2. Deklaratywny Opis Interfejsu (Mapowanie stanu na HTML)
const render = () => {
    const appContainer = document.getElementById('cart-app');

    // Obliczenia pochodne ze stanu – dzieją się automatycznie przy każdym renderze
    const totalItemsCount = state.items.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Jeśli koszyk jest pusty, deklarujemy zupełnie inny widok
    if (state.items.length === 0) {
        appContainer.innerHTML = `
            <header class="cart-header">
                <h1>Twój Koszyk</h1>
                <span class="cart-badge">0 produktów</span>
            </header>
            <p class="empty-cart-message">Twój koszyk jest pusty.</p>
        `;
        return;
    }

    // Pełny opis struktury interfejsu zintegrowany z aktualnymi danymi
    appContainer.innerHTML = `
        <header class="cart-header">
            <h1>Twój Koszyk</h1>
            <span class="cart-badge">${totalItemsCount} ${totalItemsCount === 1 ? 'produkt' : 'produkty'}</span>
        </header>

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
            <div class="summary-row">
                <span>Razem do zapłaty:</span>
                <span class="summary-total">${formatPrice(totalPrice)}</span>
            </div>
            
            <form action="/checkout" method="POST" class="checkout-form" onsubmit="handleCheckout(event)">
                <textarea 
                    class="order-notes" 
                    placeholder="Dodatkowe uwagi do zamówienia (opcjonalnie)..."
                    oninput="updateNotes(event)"
                >${state.notes}</textarea>
                <button type="submit" class="checkout-button">Przejdź do zamówienia</button>
            </form>
        </footer>
    `;
};

// 3. Czyste Mutacje Stanu (Brak efektów ubocznych wewnątrz logiki biznesowej)
const syncStorageAndRender = () => {
    localStorage.setItem('cart_items', JSON.stringify(state.items));
    localStorage.setItem('cart_notes', state.notes);
    render();
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
    localStorage.setItem('cart_notes', state.notes); // Zapis uwag na bieżąco, bez pełnego rerenderu pola tekstowego (aby nie zgubić focusu)
};

window.handleCheckout = (event) => {
    event.preventDefault();
    console.log("Wysyłanie zamówienia:", state);
    // Tutaj deklaratywna obsługa wysyłki danych dalej...
};

// 4. Pierwsze uruchomienie aplikacji
render();