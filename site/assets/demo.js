// Mirrors RequestStore.Create in src/Program.cs: the same validation messages, queue rule and idempotency.
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let items = [];
class RuleException extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const fp = (t, c, a) => `${t}\u0000${c}\u0000${a.toFixed(2)}`;
function create(title, category, amountRaw, key) {
  title = (title ?? '').trim();
  if (!title || title.length > 160 || /[\u0000-\u001f\u007f]/.test(title)) throw new RuleException(400, 'Title must contain 1–160 printable characters');
  if (!['materials', 'expense', 'access'].includes(category)) throw new RuleException(400, 'Unknown category');
  if (amountRaw === '' || amountRaw == null) throw new RuleException(400, 'Amount is required');
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000 || Math.round(amount * 100) / 100 !== amount) throw new RuleException(400, 'Amount must be EUR 0–100000, with at most two decimal places');
  if (category === 'access' && amount !== 0) throw new RuleException(400, 'Access requests have no amount');
  if (!key.trim() || key.length > 80 || /[\u0000-\u001f\u007f]/.test(key)) throw new RuleException(400, 'Idempotency-Key required (1–80 printable characters)');
  const prev = items.find(i => i.key === key);
  if (prev) { if (prev.fp !== fp(title, category, amount)) throw new RuleException(409, 'Idempotency key reused with different input'); return { item: prev, replay: true }; }
  // Automation routes the work. Only a human identity may decide it.
  const queue = category === 'access' ? 'IT' : amount > 250 ? 'Finance' : 'Operations';
  const item = { id: crypto.randomUUID().slice(0, 8), title, category, amount, queue, key, fp: fp(title, category, amount), status: 'Pending' };
  items.push(item); return { item, replay: false };
}
function render() {
  $('ah-list').innerHTML = items.map(i => `<li><b>${esc(i.title)}</b><span class="dim small">${i.category} · €${i.amount.toFixed(2)} · key ${esc(i.key)}</span><span><span class="pill info">${i.queue}</span> <span class="pill warn">${i.status}</span></span></li>`).join('') || '<li class="dim small">Nothing submitted yet.</li>';
}
$('ah-form').addEventListener('submit', e => {
  e.preventDefault();
  try {
    const { item, replay } = create($('ah-title').value, $('ah-cat').value, $('ah-amount').value, $('ah-key').value);
    $('ah-result').innerHTML = `<div class="pill ok">${replay ? 'HTTP 200 · replay' : 'HTTP 201 · created'}</div><p>${replay ? 'Same key and same input: the original request is returned, no duplicate is created.' : `Routed to <b>${item.queue}</b>. It stays <b>pending</b> until a human approver records a decision with a reason.`}</p><p class="small dim">${item.category === 'access' ? 'Access requests always go to IT.' : item.amount > 250 ? 'Above €250 goes to Finance.' : 'Up to €250 goes to Operations.'} Try the same key with another amount.</p>`;
  } catch (err) {
    $('ah-result').innerHTML = `<div class="pill bad">HTTP ${err.status}</div><p>${esc(err.message)}</p>`;
  }
  render();
});
$('ah-cat').addEventListener('change', () => { if ($('ah-cat').value === 'access') $('ah-amount').value = 0; });
$('ah-reset').addEventListener('click', () => { items = []; $('ah-result').innerHTML = ''; render(); });
render();
