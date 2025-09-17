const form = document.querySelector('#orderForm');
const orderItems = document.querySelector('#orderItems');
const orderTotal = document.querySelector('#orderTotal');
const submitOrderButton = document.querySelector('#submitOrder');
const modal = document.querySelector('#modal');
const modalMessage = document.querySelector('#modalMessage');
const closeModalButton = document.querySelector('#closeModal');

let currentOrder = [];

const drinkMap = {
  latte: '拿铁 Latte',
  americano: '美式 Americano',
  caramel: '焦糖玛奇朵',
  coldbrew: '冷萃 Cold Brew',
};

function calculateItemTotal(basePrice, sizeMultiplier, milkExtra, addonsExtra, quantity) {
  const single = (basePrice * sizeMultiplier + milkExtra + addonsExtra).toFixed(2);
  const total = (single * quantity).toFixed(2);
  return { single: Number(single), total: Number(total) };
}

function renderOrder() {
  orderItems.innerHTML = '';

  if (!currentOrder.length) {
    orderItems.innerHTML = '<li class="empty">还没有选择饮品</li>';
    submitOrderButton.disabled = true;
    orderTotal.textContent = '¥0';
    return;
  }

  currentOrder.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'order__item';

    const description = document.createElement('div');
    description.innerHTML = `
      <strong>${item.name}</strong>
      <div class="order__meta">
        <span>${item.size} / ${item.milk}</span>
        ${item.addons.length ? `<span>加料：${item.addons.join('、')}</span>` : ''}
        <span>单价 ¥${item.single.toFixed(2)} × ${item.quantity}</span>
      </div>
    `;

    const total = document.createElement('div');
    total.innerHTML = `
      <strong>¥${item.total.toFixed(2)}</strong>
      <button class="order__remove" aria-label="移除 ${item.name}">×</button>
    `;

    total.querySelector('button').addEventListener('click', () => {
      currentOrder.splice(index, 1);
      renderOrder();
    });

    li.appendChild(description);
    li.appendChild(total);
    orderItems.appendChild(li);
  });

  const grandTotal = currentOrder
    .reduce((sum, item) => sum + item.total, 0)
    .toFixed(2);

  orderTotal.textContent = `¥${grandTotal}`;
  submitOrderButton.disabled = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const drinkOption = form.drink.options[form.drink.selectedIndex];
  const basePrice = Number(drinkOption.dataset.price);
  const name = drinkMap[form.drink.value];

  const sizeOption = form.querySelector('input[name="size"]:checked');
  const sizeMultiplier = Number(sizeOption.dataset.multiplier);
  const sizeLabel = sizeOption.value;

  const milkOption = form.milk.options[form.milk.selectedIndex];
  const milkLabel = milkOption.value;
  const milkExtra = Number(milkOption.dataset.extra || 0);

  const addonCheckboxes = [...form.querySelectorAll('input[name="addons"]:checked')];
  const addons = addonCheckboxes.map((checkbox) => checkbox.value);
  const addonsExtra = addonCheckboxes.reduce(
    (sum, checkbox) => sum + Number(checkbox.dataset.extra || 0),
    0
  );

  const quantity = Number(form.quantity.value) || 1;
  const { single, total } = calculateItemTotal(
    basePrice,
    sizeMultiplier,
    milkExtra,
    addonsExtra,
    quantity
  );

  currentOrder.push({
    name,
    size: sizeLabel,
    milk: milkLabel,
    addons,
    quantity,
    single,
    total,
    note: form.note.value.trim(),
  });

  form.reset();
  form.querySelector('input[name="size"][value="小杯"]').checked = true;
  form.quantity.value = 1;
  renderOrder();
});

submitOrderButton.addEventListener('click', () => {
  if (!currentOrder.length) return;

  const noteSummary = currentOrder
    .map((item, index) => {
      const noteText = item.note ? `（备注：${item.note}）` : '';
      const addonText = item.addons.length ? `加料：${item.addons.join('、')}；` : '';
      return `${index + 1}. ${item.name}（${item.size}，${item.milk}）${addonText}数量：${item.quantity}${noteText}`;
    })
    .join('\n');

  modalMessage.textContent = `您的咖啡正在制作中！\n\n${noteSummary}`;
  modal.hidden = false;

  currentOrder = [];
  renderOrder();
});

closeModalButton.addEventListener('click', () => {
  modal.hidden = true;
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.hidden = true;
  }
});

renderOrder();
