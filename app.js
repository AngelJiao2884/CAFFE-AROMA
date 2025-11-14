document.getElementById('y').textContent = new Date().getFullYear()

function scrollToSection(id){
  const element = document.getElementById(id);
  if (!element) return;
  const headerHeight = document.querySelector('header')?.offsetHeight || 72;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerHeight;
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
}
window.scrollToSection = scrollToSection;

function updateHeaderHeightVar(){
  const header = document.querySelector('header');
  if (!header) return;
  const h = header.offsetHeight || 72;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}

const basePrices = {
  'Drip Coffee': { hot: 3.5, iced: 4.5 },
  'Espresso': { hot: 4, iced: 4 },
  'Americano': { hot: 4, iced: 4.5 },
  'Cappuccino': { hot: 4.25, iced: 4.25 },
  'Latte': { hot: 4.25, iced: 4.75 },
  'Lavender Latte': { hot: 6, iced: 6.5 },
  'Mocha': { hot: 6.5, iced: 7.5 },
  'Cold Brew': { hot: 7.5, iced: 7.5 },
  'Nitro': { hot: 8.5, iced: 8.5 },
  'Matcha Latte': { hot: 6, iced: 6.5 },
  'Matcha Strawberry Latte': { hot: 6.5, iced: 7 },
  'Chai Latte': { hot: 6.5, iced: 7 },
  'Hot Chocolate': { hot: 5.5, iced: 6 }
};
const sizeModifiers = { S: 0, M: 0.5, L: 1 };
const syrupPrice = 0.5;
const additionPrices = { 'Espresso Shot': 2, 'Matcha Shot': 2, 'Protein Boost': 1 };

function getSelected(name){
  const nodes = document.querySelectorAll(`[name="${name}"]`);
  for (const n of nodes) if (n.checked) return n.value;
  return null;
}
function getCheckedValues(container){
  return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(el => el.value);
}
function formatCurrency(n){ return `$${n.toFixed(2)}` }

function computeTotal(){
  const drink = document.getElementById('drink')?.value;
  if (!drink) return { total: 0, qty: 1, syrups: [], adds: [] };
  const temp = getSelected('temp');
  const size = getSelected('size');
  const milk = document.getElementById('milk').value;
  const qty = Math.max(1, parseInt(document.getElementById('qty').value || '1', 10));
  const syrupContainer = document.querySelector('.order-field .choices[aria-label="Syrups"]') || document;
  const addContainer = document.querySelector('.order-field .choices[aria-label="Additions"]') || document;
  const syrups = getCheckedValues(syrupContainer);
  const adds = getCheckedValues(addContainer);

  const base = (basePrices[drink] ? basePrices[drink][temp] : 0) + (sizeModifiers[size] || 0);
  const extras = syrups.length * syrupPrice + adds.reduce((sum, a) => sum + (additionPrices[a] || 0), 0);
  const total = (base + extras) * qty;

  document.getElementById('sum-drink').textContent = drink;
  document.getElementById('sum-size').textContent = size;
  document.getElementById('sum-temp').textContent = temp;
  document.getElementById('sum-milk').textContent = milk;
  document.getElementById('sum-syrups').textContent = syrups.length ? syrups.join(', ') : '—';
  document.getElementById('sum-adds').textContent = adds.length ? adds.join(', ') : '—';
  document.getElementById('sum-qty').textContent = String(qty);
  document.getElementById('sum-total').textContent = formatCurrency(total);

  return { drink, temp, size, milk, qty, syrups, adds, total };
}

function updateTempAvailability(){
  const drink = document.getElementById('drink')?.value;
  if (!drink) return;
  const icedAllowed = basePrices[drink] && typeof basePrices[drink].iced === 'number';
  const icedRadio = document.querySelector('input[name="temp"][value="iced"]');
  if (!icedAllowed) {
    icedRadio.disabled = true;
    document.querySelector('input[name="temp"][value="hot"]').checked = true;
  } else {
    icedRadio.disabled = false;
  }
}

function buildMailto(order){
  const subject = encodeURIComponent(`Order for ${order.qty} × ${order.drink} (${order.size}, ${order.temp})`);
  const lines = [
    `Drink: ${order.drink}`,
    `Size: ${order.size}`,
    `Temperature: ${order.temp}`,
    `Milk: ${order.milk}`,
    `Syrups: ${order.syrups.length ? order.syrups.join(', ') : 'None'}`,
    `Additions: ${order.adds.length ? order.adds.join(', ') : 'None'}`,
    `Quantity: ${order.qty}`,
    `Total: ${formatCurrency(order.total)}`,
    `Pickup: ${document.getElementById('time').value || 'ASAP'}`,
    `Name: ${document.getElementById('name').value || '-'}`,
    `Contact: ${document.getElementById('contact').value || '-'}`
  ];
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:orders@caffearoma.example?subject=${subject}&body=${body}`;
}


function wireOrderUI(){
  const ids = ['drink','milk','qty','name','time','contact'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { updateTempAvailability(); computeTotal(); });
  });
  document.querySelectorAll('input[name="temp"]').forEach(el => el.addEventListener('change', computeTotal));
  document.querySelectorAll('input[name="size"]').forEach(el => el.addEventListener('change', computeTotal));
  document.querySelectorAll('.order-field .choices input[type="checkbox"]').forEach(el => el.addEventListener('change', computeTotal));

  const upd = document.getElementById('update-summary');
  if (upd) upd.addEventListener('click', computeTotal);

  updateTempAvailability();
  computeTotal();
}

function init(){
  updateHeaderHeightVar();
  wireOrderUI();
  window.addEventListener('resize', updateHeaderHeightVar);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


