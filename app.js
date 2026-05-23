// 1. Domyślne dane (jeśli koszyk w localStorage jest pusty lub aplikacja jest uruchamiana pierwszy raz)
const defaultItems = [
    { id: 1, name: "Kawa ziarnista Arabica", price: 65.00, qty: 2 },
    { id: 2, name: "Chleb żytni na zakwasie", price: 12.50, qty: 1 },
    { id: 3, name: "Mleko owsiane Barista", price: 9.00, qty: 3 }
];

// 2. Inicjalizacja stanu: Odczyt z localStorage
let state = {
    // Próbujemy pobrać zapisane przedmioty, jeśli ich nie ma - używamy defaultItems
    items: JSON.parse(localStorage.getItem('cart_items')) || defaultItems,
    notes: localStorage.getItem('cart_notes') || ""
};

// Pomocnicza funkcja do formatowania waluty (np. 65.00 -> 65,00 zł)
const formatPrice = (value) => value.toFixed(2).replace('.', ',') + ' zł';

// 3. Logika wyświetlania (Renderowanie interfejsu)
const render = () => {
    const appContainer = document.getElementById('cart-app');

    // Obliczenia na bieżąco: łączna liczba produktów i całkowita cena
    const totalItemsCount = state.items.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Przypadek: Koszyk jest pusty
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
        return; // Zatrzymujemy dalsze renderowanie
    }

    // Przypadek: W koszyku są produkty
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

// 4. Logika modyfikacji stanu i zapisu do localStorage
const syncStorageAndRender = () => {
    localStorage.setItem('cart_items', JSON.stringify(state.items));
    render();
};

window.updateQty = (id, change) => {
    state.items = state.items.map(item => {
        if (item.id === id) {
            const newQty = item.qty + change;
            return { ...item, qty: newQty < 1 ? 1 : newQty }; // Nie pozwalamy na ilość mniejszą niż 1
        }
        return item;
    });
    syncStorageAndRender(); // Zapis i odświeżenie widoku
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
    alert("Zamówienie na kwotę: " + formatPrice(state.items.reduce((acc, item) => acc + (item.price * item.qty), 0)) + " zostało złożone!");
};

// 5. Uruchomienie aplikacji po załadowaniu skryptu
render();