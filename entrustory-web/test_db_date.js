const original = new Date().toISOString();
console.log("Original: ", original);

// simulate postgres converting it
// e.g. "2026-04-22T17:15:33.456Z" -> "2026-04-22T17:15:33.456000+00:00"
const dbReturned = original.replace("Z", "000+00:00");
console.log("DB returned:", dbReturned);

// Re-normalize when verifying
const normalized = new Date(dbReturned).toISOString();
console.log("Normalized: ", normalized);
console.log("Match?", original === normalized);
