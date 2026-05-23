// 1. Domyślne dane (jeśli koszyk w localStorage jest pusty lub aplikacja jest uruchamiana pierwszy raz)
const defaultItems = [
    { id: 1, name: "Kawa ziarnista Arabica", price: 65.00, qty: 2 },
    { id: 2, name: "Chleb żytni na zakwasie", price: 12.50, qty: 1 },
    { id: 3, name: "Mleko owsiane Barista", price: 9.00, qty: 3 }
];

// 2. Inicjalizacja stanu: Odczyt z localStorage
let state = {
    items: JSON.parse(localStorage.getItem('cart_items')) || defaultItems,
    notes: localStorage.getItem('cart_notes') || "",
    isOrdered: false // Nowa właściwość flagująca stan ukończenia zamówienia
};

// Pomocnicza funkcja do formatowania waluty (np. 65.00 -> 65,00 zł)
const formatPrice = (value) => value.toFixed(2).replace('.', ',') + ' zł';

// 3. Logika wyświetlania (Renderowanie interfejsu)
const render = () => {
    const appContainer = document.getElementById('cart-app');

    // Przypadek A: Zamówienie zostało właśnie sfinalizowane i koszyk wyczyszczony
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

    // Obliczenia na bieżąco: łączna liczba produktów i całkowita cena
    const totalItemsCount = state.items.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Przypadek B: Koszyk jest pusty (standardowo)
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

    // Przypadek C: W koszyku są produkty (standardowy widok)
    appContainer.innerHTML = `
        <header class="cart-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1>Twój Koszyk</h1>
                <span class="cart-badge">${totalItemsCount} ${totalItemsCount === 1 ? 'produkt' : 'produkty'}</span>
            </div>
            <!-- Przycisk deklaratywnego czyszczenia koszyka w nagłówku -->
            <button type="button" class="clear-cart-btn" onclick="clearCart()" style="background: none; border: 1px solid #e74c3c; color: #e74c3c; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                Wyczyść koszyk
            </button>
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
            <!-- Rozbudowane podsumowanie kosztów -->
            <div class="summary-details" style="margin-bottom: 15px; border-bottom: 1px dashed #e0e0e0; padding-bottom: 15px;">
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #7f8c8d;">
                    <span>Suma częściowa (${totalItemsCount} szt.):</span>
                    <span>${formatPrice(totalPrice)}</span>
                </div>
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #7f8c8d;">
                    <span>Dostawa:</span>
                    <span style="color: #2e7d32; font-weight: bold;">Darmowa</span>
                </div>
            </div>

            <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <span style="font-weight: bold; font-size: 18px;">Razem do zapłaty:</span>
                <span class="summary-total" style="font-weight: bold; font-size: 22px; color: #2c3e50;">${formatPrice(totalPrice)}</span>
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

// 4. Logika modyfikacji stanu i zapisu do localStorage
const syncStorageAndRender = () => {
    localStorage.setItem('cart_items', JSON.stringify(state.items));
    localStorage.setItem('cart_notes', state.notes);
    render();
};

// Funkcja całkowitego czyszczenia koszyka
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

// Finalizacja zamówienia: Czyścimy magazyn i podnosimy flagę sukcesu
window.handleCheckout = (event) => {
    event.preventDefault();
    
    // Logika biznesowa wysyłki zamówienia na podstawie obecnego stanu
    const totalOrderValue = state.items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    alert("Zamówienie na kwotę: " + formatPrice(totalOrderValue) + " zostało wysłane!");

    // Deklaratywne czyszczenie struktur danych po zakupie
    state.items = [];
    state.notes = "";
    state.isOrdered = true; // Zmiana stanu wywoła ekran sukcesu w funkcji render()

    // Czyszczenie fizycznego localStorage
    localStorage.removeItem('cart_items');
    localStorage.removeItem('cart_notes');

    render();
};

// 5. Uruchomienie aplikacji po załadowaniu skryptu
render();