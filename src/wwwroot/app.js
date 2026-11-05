"use strict";
const $ = (q) => document.querySelector(q);
const escape = (s) =>
    String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[c],
    );
const money = (n) =>
    new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
    }).format(n);
const date = (value) =>
    new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
const category = {
    materials: "Materials",
    expense: "Expense",
    access: "Access",
};
const state = {
    page: "overview",
    token: "demo-alice",
    items: [],
    filter: "all",
    query: "",
    key: null,
    detail: null,
    loading: false,
    epoch: 0,
    detailEpoch: 0,
};
const pages = {
    overview: [
        "Your operations, in view",
        "A clearer path for every request.",
        "Submit, follow up, and keep decisions moving with the right people.",
    ],
    requests: [
        "Employee workspace",
        "Every request, accounted for.",
        "Find your requests and follow their progress from submission to decision.",
    ],
    approvals: [
        "Approval workspace",
        "Make a considered decision.",
        "Review the request, record your reasoning, and leave a traceable decision.",
    ],
    activity: [
        "Accountability in practice",
        "A record of what happened.",
        "Submission and decision events from the records this identity can access.",
    ],
    policies: [
        "Published local guidance",
        "Know the route before you submit.",
        "A transparent guide to the rules used by this demonstration.",
    ],
    portfolio: [
        "Noordwerk transformation case",
        "Decide. Deliver. Govern.",
        "Three complementary projects, one fictional enterprise scenario.",
    ],
};
const isApprover = () => state.token === "demo-manager";
const status = (item) =>
    `<span class="status ${escape(item.status)}">${escape(item.status)}</span>`;
function message(text) {
    $("#notice").textContent = text;
}
function error(text) {
    $("#error").textContent = text;
    $("#error").hidden = !text;
}
async function api(path, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(path, {
            ...options,
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${state.token}`,
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok)
            throw new Error(
                response.status === 409
                    ? "This request changed or the retry details differ. Refresh and review it before trying again."
                    : body.error ||
                          `Request failed (${response.status}). Refresh or try again.`,
            );
        return body;
    } catch (e) {
        if (e.name === "AbortError")
            throw new Error(
                "The API did not respond in time. Submission may have succeeded. Retry unchanged details with the same key.",
            );
        throw e;
    } finally {
        clearTimeout(timer);
    }
}
async function load() {
    const epoch = ++state.epoch;
    state.loading = true;
    $("#loading").hidden = false;
    error("");
    try {
        const items = await api("/requests");
        if (epoch === state.epoch) {
            state.items = items;
            render();
        }
    } catch (e) {
        if (epoch === state.epoch) {
            error(`${e.message} Check that the local .NET API is running.`);
            $("#content").replaceChildren();
        }
    } finally {
        if (epoch === state.epoch) {
            state.loading = false;
            $("#loading").hidden = true;
        }
    }
}
function navigate(page) {
    state.page = page;
    state.filter = "all";
    state.query = "";
    message("");
    render();
}
function stats() {
    const pending = state.items.filter((i) => i.status === "pending").length;
    const approved = state.items.filter((i) => i.status === "approved").length;
    const decided = state.items.filter((i) => i.status !== "pending");
    const times = decided.map(
        (i) =>
            (new Date(i.events.at(-1).at) - new Date(i.events[0].at)) / 60000,
    );
    const avg = times.length
        ? times.reduce((a, b) => a + b, 0) / times.length
        : null;
    const cards = [
        [
            "Visible requests",
            state.items.length,
            isApprover()
                ? "Across all demo queues"
                : "Only this employee’s records",
            "▤",
        ],
        ["Awaiting review", pending, "Human decision required", "◷"],
        ["Approved", approved, "Recorded human decisions", "✓"],
        [
            "Mean decision time",
            avg === null ? "—" : avg < 1 ? "<1m" : `${Math.round(avg)}m`,
            avg === null
                ? "No completed decisions yet"
                : "Demo timestamps · not a business KPI",
            "↗",
        ],
    ];
    return `<section class="stats" aria-label="Workspace metrics">${cards.map((c) => `<div class="stat"><span class="stat-icon" aria-hidden="true">${c[3]}</span><p class="stat-label">${c[0]}</p><p class="stat-value">${c[1]}</p><p class="stat-detail">${c[2]}</p></div>`).join("")}</section>`;
}
function rows(items) {
    return items
        .map(
            (i) =>
                `<tr><td><button class="request-link" data-request="${escape(i.id)}">${escape(i.title)}</button><p class="request-sub">${escape(i.id.slice(0, 8).toUpperCase())} · ${escape(i.owner)}</p></td><td>${escape(category[i.category])}</td><td>${money(i.amount)}</td><td>${status(i)}</td><td>${escape(i.queue)}</td></tr>`,
        )
        .join("");
}
function requestTable(items, overview = false) {
    return `<section class="panel"><div class="panel-heading"><div><h2>${overview ? "Recent requests" : state.page === "approvals" ? "Pending decisions" : "Request register"}</h2><p>${overview ? "The latest work, with a clear next step." : `${items.length} matching records · Select a title to inspect the history.`}</p></div>${overview ? '<button class="text-button" data-go="requests">View all</button>' : '<button class="text-button" id="refresh">Refresh</button>'}</div>${overview ? "" : `<div class="filters"><label class="sr-only" for="search">Search requests</label><input id="search" type="search" placeholder="Search title, category or queue" value="${escape(state.query)}"><label class="sr-only" for="status-filter">Status</label><select id="status-filter"><option value="all">All statuses</option>${["pending", "approved", "rejected"].map((s) => `<option value="${s}" ${state.filter === s ? "selected" : ""}>${s[0].toUpperCase() + s.slice(1)}</option>`).join("")}</select></div>`}${items.length ? `<div class="table-wrap" role="region" aria-label="Scrollable request register" tabindex="0"><table><thead><tr><th scope="col">Request</th><th scope="col">Category</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col">Queue</th></tr></thead><tbody>${rows(items)}</tbody></table></div>` : `<div class="empty"><h3>${state.query || state.filter !== "all" ? "No matching requests" : state.page === "approvals" ? "Nothing waiting for review" : "Your workspace is ready"}</h3><p>${state.query || state.filter !== "all" ? "Try a different search or status." : state.page === "approvals" ? "New submissions appear here when an employee creates a request." : "Create your first request. Its route, status and history will appear here."}</p>${!isApprover() && !state.query ? '<button class="primary" data-new>New request</button>' : ""}</div>`}<div class="table-footer"><span>${overview ? "Most recent " + items.length : items.length} of ${state.items.length} visible requests</span><span>EUR · Synthetic demonstration data</span></div></section>`;
}
function overview() {
    const items = [...state.items]
        .sort((a, b) => new Date(b.events[0].at) - new Date(a.events[0].at))
        .slice(0, 5);
    const pending = state.items.filter((i) => i.status === "pending");
    return (
        stats() +
        `<div class="overview-grid"><div>${requestTable(items, true)}<section class="panel flow"><div class="flow-head"><h2>The request journey</h2><p>Automate the handoffs. Keep human control.</p></div><div class="flow-track">${[
            ["1", "Submit", "Employee confirms"],
            ["2", "Route", "Rules choose a queue"],
            ["3", "Review", "A person decides"],
            ["4", "Record", "Status & audit history"],
        ]
            .map(
                (s, i) =>
                    `${i ? '<span class="connector" aria-hidden="true">›</span>' : ""}<div class="flow-step"><span>${s[0]}</span><div>${s[1]}<small>${s[2]}</small></div></div>`,
            )
            .join(
                "",
            )}</div></section></div><aside class="rail" aria-label="Operational context"><section class="panel queue-card"><h2>Work awaiting review</h2><p>${isApprover() ? "All demo queues" : "Your requests by destination"}</p>${[
            "Operations",
            "Finance",
            "IT",
        ]
            .map((q) => {
                const count = pending.filter((i) => i.queue === q).length;
                return `<div class="queue-row"><div><span>${q}</span><strong>${count}</strong></div><progress class="sr-only" value="${count}" max="${Math.max(1, pending.length)}" aria-label="${q} pending requests">${count}</progress><div class="bar" aria-hidden="true"><span data-width="${pending.length ? (100 * count) / pending.length : 0}"></span></div></div>`;
            })
            .join(
                "",
            )}</section><section class="panel integrity"><h2>Built for accountable work</h2><p>Every decision has an owner and a reason.</p><div class="rule"><span aria-hidden="true">✓</span> Human approval on every request</div><div class="rule"><span aria-hidden="true">✓</span> Server-enforced record access</div><div class="rule"><span aria-hidden="true">✓</span> Safe retries with the same key</div><div class="rule"><span aria-hidden="true">✓</span> Versioned decision history</div></section></aside></div>`
    );
}
function audit() {
    const events = state.items
        .flatMap((i) => i.events.map((e) => ({ ...e, item: i })))
        .sort((a, b) => new Date(b.at) - new Date(a.at));
    return `<section class="panel"><div class="panel-heading"><div><h2>Request audit history</h2><p>Persisted locally. A file administrator can modify this store.</p></div><button class="text-button" id="refresh">Refresh</button></div><div class="audit-list">${events.length ? events.map((e) => `<div class="audit-row"><span class="status ${escape(e.action === "submitted" ? "pending" : e.action)}">${escape(e.action)}</span><div><button class="request-link" data-request="${escape(e.item.id)}">${escape(e.item.title)}</button><small>${escape(e.actor)} · ${escape(e.item.queue)}</small>${e.reason ? `<p>${escape(e.reason)}</p>` : ""}</div><time datetime="${escape(e.at)}">${date(e.at)}</time></div>`).join("") : '<div class="empty"><h3>No events yet</h3><p>Create a request to start its audit history.</p></div>'}</div></section>`;
}
function policies() {
    return `<div class="wide-note"><strong>Rule-based policy guide</strong><br>This screen explains the implemented routing rules. It does not call a language model. The separate Agent Governance project contains the model experiment and source validation.</div><div class="policy-grid">${[
        [
            "▥",
            "Materials",
            "Request equipment and site supplies.",
            [
                "Up to €250 → Operations",
                "Above €250 → Finance",
                "Human review in every case",
            ],
        ],
        [
            "▤",
            "Expenses",
            "Submit business expenses for review.",
            [
                "Up to €250 → Operations",
                "Above €250 → Finance",
                "Policy reference: receipt within 30 days¹",
            ],
        ],
        [
            "◇",
            "Application access",
            "Request access with a clear business need.",
            [
                "Amount must be €0",
                "Routes to IT",
                "This app does not grant access",
            ],
        ],
    ]
        .map(
            (s) =>
                `<article class="panel policy"><span class="policy-symbol" aria-hidden="true">${s[0]}</span><h2>${s[1]}</h2><p>${s[2]}</p><ul>${s[3].map((x) => `<li>${x}</li>`).join("")}</ul></article>`,
        )
        .join(
            "",
        )}</div><section class="panel content-section flow"><h2>When information is uncertain</h2><p>Ask the process owner before submitting. The application routes a request using its category and amount; it does not verify receipts, entitlement or budget availability.</p><p>¹ The 30-day receipt guidance is a published fictional policy in the <a href="https://github.com/phlppgdfry/enterprise-ai-agent-governance/blob/main/knowledge/expense-policy.md">agent knowledge source</a>. It is not an API date-validation rule. Document upload, extraction, notifications and Microsoft tenant execution remain pending.</p></section>`;
}
function portfolio() {
    return `<div class="wide-note"><strong>A fictional engagement, with inspectable engineering.</strong><br>Noordwerk is a 140-person technical services company. Its employees need a reliable route for material, expense and access requests. All records and economics are synthetic.</div><section class="panel">${[
        [
            "Decide",
            "AI Transformation Consulting Playbook",
            "Discovery, use-case gates, adoption and a reproducible business case. The baseline economics are negative in year one; the recommendation is a bounded pilot.",
            "ai-transformation-consulting-playbook",
        ],
        [
            "Deliver",
            "Enterprise AI Automation Hub",
            "This application runs on the existing .NET API. Ownership, human decisions, concurrency control and durable request history are exercised through real HTTP tests.",
            "enterprise-ai-automation-hub",
        ],
        [
            "Govern",
            "Enterprise AI Agent Governance",
            "A deterministic reference plus a separate local model path. Published sources, bounded structured output and explicit evaluation evidence keep claims inspectable.",
            "enterprise-ai-agent-governance",
        ],
    ]
        .map(
            (s) =>
                `<article class="portfolio-stage"><strong>${s[0]}</strong><div><h2>${s[1]}</h2><p>${s[2]}</p></div><a href="https://github.com/phlppgdfry/${s[3]}">Source</a></article>`,
        )
        .join(
            "",
        )}</section><section class="panel content-section flow"><h2>Microsoft integration boundary</h2><p>Power Apps, Power Automate, Dataverse and Copilot Studio are specified as a target deployment. This local application does not claim to be those products. Entra authentication, connector licensing, cloud ingress and a separate Test import must be validated before tenant use.</p></section>`;
}
function render() {
    const [eyebrow, title, description] = pages[state.page];
    $("#eyebrow").textContent = eyebrow;
    $("#page-title").textContent = title;
    $("#page-description").textContent = description;
    $("#breadcrumb").textContent =
        state.page[0].toUpperCase() + state.page.slice(1);
    $("#new-request").hidden = isApprover();
    $("#nav-count").textContent = state.items.length;
    document.querySelectorAll("[data-page]").forEach((b) => {
        b.classList.toggle("active", b.dataset.page === state.page);
        if (b.dataset.page === state.page)
            b.setAttribute("aria-current", "page");
        else b.removeAttribute("aria-current");
    });
    const [name, initials, role] = isApprover()
        ? ["Maria Vermeulen", "MV", "Approver"]
        : state.token === "demo-alice"
          ? ["Alice Laurent", "AL", "Employee"]
          : ["Bob Peeters", "BP", "Employee"];
    $("#identity-label").replaceChildren(document.createTextNode(name));
    const small = document.createElement("small");
    small.textContent = role + " demo identity";
    $("#identity-label").append(small);
    $(".sidebar-footer .avatar").textContent = initials;
    let html = "";
    if (state.page === "overview") html = overview();
    else if (state.page === "requests" || state.page === "approvals") {
        if (state.page === "approvals" && !isApprover())
            html =
                '<section class="panel empty"><h2>Approver identity required</h2><p>Employees submit and track requests. Select Maria in the demo identity switcher to explore human review. Public fixtures are not production authentication.</p></section>';
        else {
            const items = [...state.items]
                .filter(
                    (i) =>
                        (state.page !== "approvals" ||
                            i.status === "pending") &&
                        (state.filter === "all" || i.status === state.filter) &&
                        `${i.title} ${i.category} ${i.queue}`
                            .toLowerCase()
                            .includes(state.query.toLowerCase()),
                )
                .reverse();
            html = requestTable(items);
        }
    } else if (state.page === "activity") html = audit();
    else if (state.page === "policies") html = policies();
    else html = portfolio();
    $("#content").innerHTML = html;
    // Use native progress instead of inline styles (strict CSP).
    document.querySelectorAll(".bar").forEach((el) => {
        const p = document.createElement("progress");
        p.max = 100;
        p.value = Number(el.firstElementChild.dataset.width);
        p.setAttribute("aria-hidden", "true");
        el.replaceChildren(p);
    });
}
function newRequest() {
    if (isApprover()) return;
    state.key = crypto.randomUUID();
    $("#request-form").reset();
    $("#form-error").hidden = true;
    routePreview();
    $("#request-dialog").showModal();
}
function routePreview() {
    const form = $("#request-form");
    const access = form.category.value === "access";
    if (access) form.amount.value = 0;
    form.amount.readOnly = access;
    $("#route-label").textContent =
        "Routes to " +
        (access
            ? "IT"
            : Number(form.amount.value) > 250
              ? "Finance"
              : "Operations");
}
async function detail(id) {
    error("");
    const detailEpoch = ++state.detailEpoch;
    try {
        const item = await api("/requests/" + encodeURIComponent(id));
        if (detailEpoch !== state.detailEpoch) return;
        state.detail = item;
        $("#detail-content").innerHTML =
            `<div class="dialog-heading"><div><p>${escape(item.id.slice(0, 8).toUpperCase())} · ${escape(category[item.category])}</p><h2 id="detail-title">${escape(item.title)}</h2></div><button class="icon-button" data-close="detail-dialog" aria-label="Close request details">×</button></div>${status(item)}<div class="detail-meta"><div><small>Requested by</small>${escape(item.owner)}</div><div><small>Amount</small>${money(item.amount)}</div><div><small>Review queue</small>${escape(item.queue)}</div></div><h3>Decision history</h3><ol class="timeline">${item.events.map((e) => `<li><strong>${escape(e.action[0].toUpperCase() + e.action.slice(1))}</strong><small>${escape(e.actor)} · ${date(e.at)}</small>${e.reason ? `<p>${escape(e.reason)}</p>` : ""}</li>`).join("")}</ol>${isApprover() && item.status === "pending" ? `<form id="decision-form" class="decision-form"><label>Decision reason<textarea name="reason" required maxlength="500" placeholder="Record the budget, policy or access checks you performed."></textarea></label><label class="checkbox"><input type="checkbox" name="confirm" required> I reviewed the information and am making this decision.</label><div id="decision-error" role="alert" class="error" hidden></div><div class="dialog-actions"><button class="danger" type="submit" name="outcome" value="rejected">Reject request</button><button class="primary" type="submit" name="outcome" value="approved">Approve request</button></div></form>` : '<p class="muted small">Decisions require a separate approver identity, a reason and the current record version.</p>'}`;
        if (!$("#detail-dialog").open) $("#detail-dialog").showModal();
    } catch (e) {
        error(e.message);
    }
}
document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.page) navigate(b.dataset.page);
    if (b.dataset.go) navigate(b.dataset.go);
    if (b.dataset.request) detail(b.dataset.request);
    if (b.id === "new-request" || b.hasAttribute("data-new")) newRequest();
    if (b.dataset.close) document.getElementById(b.dataset.close).close();
    if (b.id === "refresh") load();
});
$("#identity").addEventListener("change", () => {
    state.detailEpoch++;
    state.token = $("#identity").value;
    state.items = [];
    state.detail = null;
    state.key = null;
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    message("");
    render();
    load();
});
$("#content").addEventListener("input", (e) => {
    if (e.target.id === "search") {
        const position = e.target.selectionStart;
        state.query = e.target.value;
        render();
        $("#search").focus();
        $("#search").setSelectionRange(position, position);
    }
});
$("#content").addEventListener("change", (e) => {
    if (e.target.id === "status-filter") {
        state.filter = e.target.value;
        render();
        $("#status-filter").focus();
    }
});
$("#request-form").addEventListener("input", routePreview);
$("#request-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
        title: form.title.value.trim(),
        category: form.category.value,
        amount: Number(form.amount.value),
    };
    $("#submit-request").disabled = true;
    $("#form-error").hidden = true;
    try {
        const item = await api("/requests", {
            method: "POST",
            headers: { "Idempotency-Key": state.key },
            body: JSON.stringify(payload),
        });
        $("#request-dialog").close();
        await load();
        message(
            `Request submitted to ${item.queue}. A human reviewer will decide.`,
        );
        await detail(item.id);
    } catch (e) {
        $("#form-error").textContent = e.message;
        $("#form-error").hidden = false;
    } finally {
        $("#submit-request").disabled = false;
    }
});
$("#detail-dialog").addEventListener("submit", async (e) => {
    if (e.target.id !== "decision-form") return;
    e.preventDefault();
    const form = e.target;
    const outcome = e.submitter.value;
    form.querySelectorAll("button").forEach((b) => (b.disabled = true));
    $("#decision-error").hidden = true;
    try {
        await api(
            "/requests/" + encodeURIComponent(state.detail.id) + "/decision",
            {
                method: "POST",
                body: JSON.stringify({
                    outcome,
                    reason: form.reason.value.trim(),
                    version: state.detail.version,
                }),
            },
        );
        $("#detail-dialog").close();
        await load();
        message(
            `Request ${outcome}. Your reason is saved in the decision history.`,
        );
    } catch (e) {
        $("#decision-error").textContent = e.message;
        $("#decision-error").hidden = false;
        form.querySelectorAll("button").forEach((b) => (b.disabled = false));
    }
});
render();
load();
