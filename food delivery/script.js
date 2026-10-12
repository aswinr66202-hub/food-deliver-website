/* ---------- Data ---------- */
const MENU = [
  { id: 1,  name: "Chicken Biryani",    cat: "Biryani", veg: false, price: 249, time: "30 min", emoji: "🍛", bg: "#FFE3B0", desc: "Long-grain basmati, slow-cooked with spiced chicken and fried onions." },
  { id: 2,  name: "Veg Dum Biryani",    cat: "Biryani", veg: true,  price: 199, time: "30 min", emoji: "🍚", bg: "#D9F2DC", desc: "Seasonal vegetables layered with saffron rice and mint." },
  { id: 3,  name: "Mutton Biryani",     cat: "Biryani", veg: false, price: 329, time: "40 min", emoji: "🥘", bg: "#FFD6CF", desc: "Tender mutton on the bone with fragrant masala rice." },
  { id: 4,  name: "Masala Dosa",        cat: "South Indian", veg: true, price: 99,  time: "20 min", emoji: "🥞", bg: "#FFF0B8", desc: "Crisp golden dosa with potato masala, sambar and two chutneys." },
  { id: 5,  name: "Idli Sambar (4 pcs)",cat: "South Indian", veg: true, price: 79,  time: "15 min", emoji: "🍥", bg: "#E8E4FA", desc: "Soft steamed idlis with hot sambar and coconut chutney." },
  { id: 6,  name: "Filter Coffee",      cat: "Drinks",  veg: true,  price: 49,  time: "10 min", emoji: "☕", bg: "#F3DCC8", desc: "Strong decoction coffee with frothy milk, the traditional way." },
  { id: 7,  name: "Margherita Pizza",   cat: "Pizza",   veg: true,  price: 229, time: "25 min", emoji: "🍕", bg: "#FFD6CF", desc: "Stone-baked crust, tomato sauce and plenty of mozzarella." },
  { id: 8,  name: "Chicken Tikka Pizza",cat: "Pizza",   veg: false, price: 299, time: "25 min", emoji: "🍕", bg: "#FFE3B0", desc: "Smoky tikka chicken, onions and capsicum on a cheesy base." },
  { id: 9,  name: "Classic Burger",     cat: "Burgers", veg: false, price: 159, time: "20 min", emoji: "🍔", bg: "#FFF0B8", desc: "Juicy chicken patty, lettuce, tomato and house sauce." },
  { id: 10, name: "Paneer Burger",      cat: "Burgers", veg: true,  price: 149, time: "20 min", emoji: "🍔", bg: "#D9F2DC", desc: "Crispy paneer patty with mint mayo and pickled onions." },
  { id: 11, name: "Paneer Butter Masala",cat: "Curries",veg: true,  price: 219, time: "30 min", emoji: "🍲", bg: "#FFD6CF", desc: "Soft paneer in a rich, creamy tomato gravy." },
  { id: 12, name: "Butter Chicken",     cat: "Curries", veg: false, price: 269, time: "30 min", emoji: "🍗", bg: "#FFE3B0", desc: "Tandoori chicken simmered in buttery tomato-cashew sauce." },
  { id: 13, name: "Hakka Noodles",      cat: "Chinese", veg: true,  price: 139, time: "20 min", emoji: "🍜", bg: "#E8E4FA", desc: "Wok-tossed noodles with crunchy vegetables and soy." },
  { id: 14, name: "Chicken Fried Rice", cat: "Chinese", veg: false, price: 169, time: "20 min", emoji: "🍳", bg: "#FFF0B8", desc: "Smoky fried rice with egg, chicken and spring onion." },
  { id: 15, name: "Gulab Jamun (3 pcs)",cat: "Desserts",veg: true,  price: 89,  time: "10 min", emoji: "🍡", bg: "#F3DCC8", desc: "Warm milk dumplings soaked in cardamom sugar syrup." },
  { id: 16, name: "Chocolate Brownie",  cat: "Desserts",veg: true,  price: 119, time: "10 min", emoji: "🍫", bg: "#E5D3C8", desc: "Fudgy brownie with a gooey centre." },
];

const COUPONS = { TIFFIN20: 0.20, FIRST10: 0.10 };
const FREE_DELIVERY_ABOVE = 499;
const DELIVERY_FEE = 40;
const GST_RATE = 0.05;

/* ---------- State ---------- */
let cart = JSON.parse(localStorage.getItem("tiffin_cart") || "{}");   // { id: qty }
let activeCat = "All";
let query = "";
let couponRate = 0;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const save = () => localStorage.setItem("tiffin_cart", JSON.stringify(cart));
const findItem = (id) => MENU.find((m) => m.id === Number(id));

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------- Menu ---------- */
function renderChips() {
  const cats = ["All", ...new Set(MENU.map((m) => m.cat))];
  $("chips").innerHTML = cats
    .map((c) => `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderMenu() {
  const list = MENU.filter(
    (m) =>
      (activeCat === "All" || m.cat === activeCat) &&
      (m.name + m.cat + m.desc).toLowerCase().includes(query)
  );
  $("empty").hidden = list.length > 0;
  $("grid").innerHTML = list
    .map(
      (m) => `
    <article class="card">
      <div class="card-art" style="background:${m.bg}">
        <span class="tag ${m.veg ? "veg" : "nonveg"}">${m.veg ? "Veg" : "Non-veg"}</span>
        ${m.emoji}
      </div>
      <div class="card-body">
        <h3>${m.name}</h3>
        <p>${m.desc}</p>
        <span class="meta">${m.time} · ${m.cat}</span>
        <div class="card-foot">
          <span class="price">${money(m.price)}</span>
          <button class="add" data-add="${m.id}">Add</button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

/* ---------- Cart ---------- */
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  save();
  renderCart();
  toast(`${findItem(id).name} added to cart`);
  const b = $("cartCount");
  b.classList.remove("bump");
  void b.offsetWidth;
  b.classList.add("bump");
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  save();
  renderCart();
}

function totals() {
  const subtotal = Object.entries(cart).reduce((s, [id, q]) => s + findItem(id).price * q, 0);
  const discount = subtotal * couponRate;
  const after = subtotal - discount;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const gst = after * GST_RATE;
  return { subtotal, discount, delivery, gst, total: after + delivery + gst };
}

function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((s, [, q]) => s + q, 0);
  $("cartCount").textContent = count;

  if (!entries.length) {
    $("cartItems").innerHTML = `
      <div class="empty-cart"><span class="big">🛒</span>
      <b>Your cart is empty</b><p>Add a dish from the menu to get started.</p></div>`;
    $("cartFoot").hidden = true;
    return;
  }
  $("cartFoot").hidden = false;
  $("cartItems").innerHTML = entries
    .map(([id, q]) => {
      const m = findItem(id);
      return `
      <div class="line">
        <div class="line-art" style="background:${m.bg}">${m.emoji}</div>
        <div class="line-info"><b>${m.name}</b><small>${money(m.price)} × ${q} = ${money(m.price * q)}</small></div>
        <div class="qty">
          <button data-minus="${id}" aria-label="Decrease">−</button>
          <span>${q}</span>
          <button data-plus="${id}" aria-label="Increase">+</button>
        </div>
      </div>`;
    })
    .join("");

  const t = totals();
  $("subTotal").textContent = money(t.subtotal);
  $("discountRow").hidden = t.discount === 0;
  $("discount").textContent = "-" + money(t.discount);
  $("delivery").textContent = t.delivery === 0 ? "Free" : money(t.delivery);
  $("gst").textContent = money(t.gst);
  $("grandTotal").textContent = money(t.total);
}

function openCart() { $("drawer").classList.add("open"); $("overlay").classList.add("show"); }
function closeCart() { $("drawer").classList.remove("open"); $("overlay").classList.remove("show"); }

function applyCoupon() {
  const code = $("couponInput").value.trim().toUpperCase();
  if (!code) return toast("Enter a coupon code first");
  if (COUPONS[code]) {
    couponRate = COUPONS[code];
    toast(`${code} applied: ${couponRate * 100}% off`);
  } else {
    couponRate = 0;
    toast("That code isn't valid. Try TIFFIN20");
  }
  renderCart();
}

/* ---------- Checkout ---------- */
function openCheckout() {
  if (!Object.keys(cart).length) return toast("Add something to your cart first");
  closeCart();
  $("checkoutView").hidden = false;
  $("successView").hidden = true;
  $("modal").hidden = false;
}

function placeOrder(e) {
  e.preventDefault();
  const form = new FormData($("checkoutForm"));
  const t = totals();
  const orderId = "TF" + Math.floor(100000 + Math.random() * 900000);

  $("orderMsg").textContent =
    `Thanks ${form.get("name")}! Order ${orderId} of ${money(t.total)} (${form.get("pay")}) is confirmed.`;
  $("checkoutView").hidden = true;
  $("successView").hidden = false;

  // Fake live tracking
  const steps = [...document.querySelectorAll("#tracker li")];
  steps.forEach((li) => li.classList.remove("done"));
  steps.forEach((li, i) => setTimeout(() => li.classList.add("done"), i * 1500));

  cart = {};
  couponRate = 0;
  $("couponInput").value = "";
  save();
  renderCart();
  $("checkoutForm").reset();
}

/* ---------- Events ---------- */
$("chips").addEventListener("click", (e) => {
  const c = e.target.closest("[data-cat]");
  if (!c) return;
  activeCat = c.dataset.cat;
  renderChips();
  renderMenu();
});

$("grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-add]");
  if (b) addToCart(b.dataset.add);
});

$("cartItems").addEventListener("click", (e) => {
  const p = e.target.closest("[data-plus]");
  const m = e.target.closest("[data-minus]");
  if (p) changeQty(p.dataset.plus, 1);
  if (m) changeQty(m.dataset.minus, -1);
});

$("search").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); renderMenu(); });
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("applyCoupon").addEventListener("click", applyCoupon);
$("checkoutBtn").addEventListener("click", openCheckout);
$("cancelCheckout").addEventListener("click", () => { $("modal").hidden = true; openCart(); });
$("checkoutForm").addEventListener("submit", placeOrder);
$("doneBtn").addEventListener("click", () => { $("modal").hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); $("modal").hidden = true; } });

/* ---------- Init ---------- */
renderChips();
renderMenu();
renderCart();
