using System.Security.Cryptography;
using System.Globalization;
using System.Text;
using System.Text.Json;

// Deliberately local: these demo identities must never become production credentials.
var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    // Also works when launched from the repository root or a published directory.
    WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
});
builder.WebHost.UseUrls("http://127.0.0.1:5088");
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 16_384);
var app = builder.Build();
using var store = new RequestStore(Environment.GetEnvironmentVariable("HUB_DATA") ?? "data/requests.json");
var identities = new Dictionary<string, Identity>
{
    ["demo-alice"] = new("alice", "employee"),
    ["demo-bob"] = new("bob", "employee"),
    ["demo-manager"] = new("maria", "approver")
};
app.Use(async (context, next) =>
{
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers.CacheControl = "no-store";
    await next();
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "no-store";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    if (context.Request.Path == "/health") { await next(); return; }
    var header = context.Request.Headers.Authorization.ToString();
    if (!header.StartsWith("Bearer ", StringComparison.Ordinal) ||
        !identities.TryGetValue(header[7..], out var identity))
    { context.Response.StatusCode = 401; return; }
    context.Items["identity"] = identity;
    try { await next(); }
    catch (RuleException e) { context.Response.StatusCode = e.Status; await context.Response.WriteAsJsonAsync(new { error = e.Message }); }
});
Identity Current(HttpContext c) => (Identity)c.Items["identity"]!;
app.MapGet("/health", () => new { status = "ok", mode = "local-simulation" });
app.MapGet("/requests", (HttpContext c) => store.List(Current(c)));
app.MapGet("/requests/{id:guid}", (Guid id, HttpContext c) => store.Get(id, Current(c)));
app.MapPost("/requests", (NewRequest input, HttpContext c) =>
{
    var result = store.Create(input, Current(c), c.Request.Headers["Idempotency-Key"].ToString());
    return Results.Created($"/requests/{result.Id}", result);
});
app.MapPost("/requests/{id:guid}/decision", (Guid id, Decision input, HttpContext c) => store.Decide(id, input, Current(c)));
app.Run();

record Identity(string User, string Role);
record NewRequest(string? Title, string? Category, decimal? Amount);
record Decision(string? Outcome, string? Reason, int Version);
record AuditEvent(DateTimeOffset At, string Actor, string Action, string? Reason);
record RequestItem(Guid Id, string Owner, string Title, string Category, decimal Amount,
    string Status, string Queue, int Version, string IdempotencyKey, string Fingerprint,
    List<AuditEvent> Events);
class RuleException(int status, string message) : Exception(message) { public int Status => status; }

sealed class RequestStore : IDisposable
{
    readonly object gate = new();
    readonly string path;
    readonly FileStream lease;
    List<RequestItem> items;
    public RequestStore(string file)
    {
        path = Path.GetFullPath(file);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        // A second local process must not race a read/replace cycle on this store.
        lease = new FileStream(path + ".lock", FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
        // Corrupt persisted data fails startup; never silently erase history.
        items = File.Exists(path) ? JsonSerializer.Deserialize<List<RequestItem>>(File.ReadAllText(path))
            ?? throw new InvalidDataException("Invalid request store") : [];
        ValidateRestored(items);
    }
    public void Dispose() => lease.Dispose();
    static string Fingerprint(string title, string category, decimal amount)
    {
        var canonical = new { title, Category = category, amount = amount.ToString("0.00", CultureInfo.InvariantCulture) };
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(canonical))));
    }
    static void ValidateRestored(List<RequestItem> records)
    {
        var ids = new HashSet<Guid>();
        var keys = new HashSet<(string, string)>();
        foreach (var i in records)
        {
            if (i is null || i.Id == Guid.Empty || !ids.Add(i.Id) || i.Owner is not ("alice" or "bob") ||
                string.IsNullOrWhiteSpace(i.Title) || i.Title.Length > 160 || i.Title.Any(char.IsControl) ||
                i.Category is not ("materials" or "expense" or "access") || i.Amount < 0 || i.Amount > 100_000 ||
                decimal.Round(i.Amount, 2) != i.Amount || (i.Category == "access" && i.Amount != 0) ||
                string.IsNullOrWhiteSpace(i.IdempotencyKey) || i.IdempotencyKey.Length > 80 || i.IdempotencyKey.Any(char.IsControl) ||
                !keys.Add((i.Owner, i.IdempotencyKey)) || i.Fingerprint != Fingerprint(i.Title, i.Category, i.Amount) ||
                i.Queue != (i.Category == "access" ? "IT" : i.Amount > 250 ? "Finance" : "Operations") ||
                i.Status is not ("pending" or "approved" or "rejected") ||
                i.Version != (i.Status == "pending" ? 1 : 2) || i.Events is null || i.Events.Count != i.Version)
                throw new InvalidDataException("Stored request violates the local workflow contract");
            var first = i.Events[0];
            if (first is null || first.Actor != i.Owner || first.Action != "submitted" || first.Reason != null || first.At == default)
                throw new InvalidDataException("Invalid submission audit event");
            if (i.Version == 2)
            {
                var decision = i.Events[1];
                if (decision is null || decision.Actor != "maria" || decision.Action != i.Status ||
                    string.IsNullOrWhiteSpace(decision.Reason) || decision.Reason.Length > 500 ||
                    decision.Reason.Any(char.IsControl) || decision.At < first.At)
                    throw new InvalidDataException("Invalid decision audit event");
            }
        }
    }
    void Commit(List<RequestItem> next)
    {
        var temp = path + ".tmp";
        try
        {
            using (var stream = new FileStream(temp, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                JsonSerializer.Serialize(stream, next, new JsonSerializerOptions { WriteIndented = true });
                stream.Flush(true);
            }
            File.Move(temp, path, true);
        }
        catch (Exception e) when (e is IOException or UnauthorizedAccessException)
        {
            // Catch storage failures here, not response/network failures after a committed write.
            throw new RuleException(503, "Storage unavailable. Check status and retry unchanged details with the same key.");
        }
        items = next;
    }
    static void Visible(RequestItem item, Identity actor)
    {
        if (actor.Role != "approver" && item.Owner != actor.User) throw new RuleException(404, "Request not found");
    }
    public RequestItem[] List(Identity actor)
    {
        lock (gate) return items.Where(i => actor.Role == "approver" || i.Owner == actor.User).ToArray();
    }
    public RequestItem Get(Guid id, Identity actor)
    {
        lock (gate)
        {
            var item = items.Find(i => i.Id == id) ?? throw new RuleException(404, "Request not found");
            Visible(item, actor);
            return item;
        }
    }
    public RequestItem Create(NewRequest input, Identity actor, string key)
    {
        if (actor.Role != "employee") throw new RuleException(403, "Employee identity required");
        var title = input.Title?.Trim();
        if (string.IsNullOrEmpty(title) || title.Length > 160 || title.Any(char.IsControl))
            throw new RuleException(400, "Title must contain 1–160 printable characters");
        if (input.Category is not ("materials" or "expense" or "access")) throw new RuleException(400, "Unknown category");
        if (input.Amount is null) throw new RuleException(400, "Amount is required");
        var amount = input.Amount.Value;
        if (amount < 0 || amount > 100_000 || decimal.Round(amount, 2) != amount)
            throw new RuleException(400, "Amount must be EUR 0–100000, with at most two decimal places");
        if (input.Category == "access" && amount != 0) throw new RuleException(400, "Access requests have no amount");
        if (string.IsNullOrWhiteSpace(key) || key.Length > 80 || key.Any(char.IsControl))
            throw new RuleException(400, "Idempotency-Key required (1–80 printable characters)");
        var hash = Fingerprint(title, input.Category, amount);
        lock (gate)
        {
            var previous = items.Find(i => i.Owner == actor.User && i.IdempotencyKey == key);
            if (previous != null)
            {
                if (previous.Fingerprint != hash) throw new RuleException(409, "Idempotency key reused with different input");
                return previous;
            }
            // Automation routes the work. Only a human identity may decide it.
            var queue = input.Category == "access" ? "IT" : amount > 250 ? "Finance" : "Operations";
            var item = new RequestItem(Guid.NewGuid(), actor.User, title, input.Category, amount,
                "pending", queue, 1, key, hash, [new(DateTimeOffset.UtcNow, actor.User, "submitted", null)]);
            Commit([.. items, item]);
            return item;
        }
    }
    public RequestItem Decide(Guid id, Decision decision, Identity actor)
    {
        if (actor.Role != "approver") throw new RuleException(403, "Human approver identity required");
        if (decision.Outcome is not ("approved" or "rejected")) throw new RuleException(400, "Invalid outcome");
        if (string.IsNullOrWhiteSpace(decision.Reason) || decision.Reason.Length > 500 || decision.Reason.Any(char.IsControl))
            throw new RuleException(400, "Decision reason required (1–500 printable characters)");
        lock (gate)
        {
            var previous = items.Find(i => i.Id == id) ?? throw new RuleException(404, "Request not found");
            if (previous.Owner == actor.User) throw new RuleException(403, "Self approval forbidden");
            if (previous.Version != decision.Version) throw new RuleException(409, "Stale version; refresh before deciding");
            if (previous.Status != "pending") throw new RuleException(409, "Request already decided");
            var next = previous with { Status = decision.Outcome, Version = previous.Version + 1,
                Events = [.. previous.Events, new(DateTimeOffset.UtcNow, actor.User, decision.Outcome, decision.Reason.Trim())] };
            Commit(items.Select(i => i.Id == id ? next : i).ToList());
            return next;
        }
    }
}
