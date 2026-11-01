"use strict";

/*
 * ArchersHub Account Management local development server.
 * - GET  /api/account-management : reads admin/account-management-data.txt
 * - POST /api/account-management : validates and writes that TXT file
 * - Other GET requests serve static project files from this folder
 *
 * Run from the project root: node server.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, "admin", "account-management-data.txt");
const PORT = Number(process.env.PORT || 3000);
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
};

const ALLOWED_TYPES = new Set(["Student", "Teacher", "Officer", "Provost", "Admin"]);
const ALLOWED_STATUSES = new Set(["Active", "LOA", "Discontinued", "Expulsion", "Graduate"]);

function sendJson(res, statusCode, value) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
    });
    res.end(JSON.stringify(value));
}

function readAccountsFile() {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.accounts)) {
        throw new Error("TXT must contain a JSON object with an accounts array.");
    }
    return parsed.accounts;
}

function validateAndNormalizeAccounts(input) {
    if (!input || !Array.isArray(input.accounts)) {
        throw new Error("Request body must contain an accounts array.");
    }

    const seenIds = new Set();
    const accounts = input.accounts.map((source, index) => {
        if (!source || typeof source !== "object" || Array.isArray(source)) {
            throw new Error(`Account at position ${index + 1} is invalid.`);
        }

        const account = {
            id: String(source.id ?? "").trim(),
            name: String(source.name ?? "").trim(),
            email: String(source.email ?? "").trim(),
            type: String(source.type ?? "").trim(),
            status: String(source.status ?? "").trim(),
            createdDate: String(source.createdDate ?? "").trim(),
            address: String(source.address ?? "").trim(),
            contactNumber: String(source.contactNumber ?? "").trim(),
            timeline: String(source.timeline ?? "").trim(),
            enlistment: Array.isArray(source.enlistment) ? source.enlistment : [],
            grades: Array.isArray(source.grades) ? source.grades : []
        };

        if (!account.id || !account.name || !account.email || !account.type || !account.status) {
            throw new Error(`Account ${index + 1} is missing a required field (ID, name, email, type, or status).`);
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
            throw new Error(`Account ${account.id} has an invalid email address.`);
        }
        if (!ALLOWED_TYPES.has(account.type)) {
            throw new Error(`Account ${account.id} has an unsupported account type.`);
        }
        if (!ALLOWED_STATUSES.has(account.status)) {
            throw new Error(`Account ${account.id} has an unsupported account status.`);
        }
        if (seenIds.has(account.id)) {
            throw new Error(`Duplicate ID found: ${account.id}.`);
        }
        seenIds.add(account.id);
        return account;
    });

    return accounts;
}

function writeAccountsFile(accounts) {
    const contents = `${JSON.stringify({ accounts }, null, 2)}\n`;
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, contents, "utf8");
    fs.renameSync(tempFile, DATA_FILE);
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];

        req.on("data", chunk => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                reject(new Error("Request body is too large."));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch (_) {
                reject(new Error("Request body is not valid JSON."));
            }
        });
        req.on("error", reject);
    });
}

async function handleApi(req, res) {
    if (req.method === "GET") {
        try {
            sendJson(res, 200, { accounts: readAccountsFile() });
        } catch (error) {
            sendJson(res, 500, { error: `Could not read the TXT data: ${error.message}` });
        }
        return;
    }

    if (req.method === "POST") {
        try {
            const body = await readRequestBody(req);
            const accounts = validateAndNormalizeAccounts(body);
            writeAccountsFile(accounts);
            sendJson(res, 200, { ok: true, accounts });
        } catch (error) {
            const status = /too large/i.test(error.message) ? 413 : 400;
            sendJson(res, status, { error: error.message || "Could not save account data." });
        }
        return;
    }

    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { error: "Method not allowed." });
}

function serveStatic(req, res, pathname) {
    if (req.method !== "GET" && req.method !== "HEAD") {
        sendJson(res, 405, { error: "Method not allowed." });
        return;
    }

    let requestedPath;
    try {
        requestedPath = decodeURIComponent(pathname);
    } catch (_) {
        res.writeHead(400);
        res.end("Bad request");
        return;
    }

    if (requestedPath === "/") requestedPath = "/index.html";

    const absolutePath = path.resolve(ROOT_DIR, `.${requestedPath}`);
    if (absolutePath !== ROOT_DIR && !absolutePath.startsWith(ROOT_DIR + path.sep)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.stat(absolutePath, (statError, stat) => {
        if (statError || !stat.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("File not found");
            return;
        }

        const extension = path.extname(absolutePath).toLowerCase();
        res.writeHead(200, {
            "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
            "Cache-Control": extension === ".txt" || extension === ".html" || extension === ".js" || extension === ".css"
                ? "no-store"
                : "public, max-age=3600",
            "X-Content-Type-Options": "nosniff"
        });

        if (req.method === "HEAD") {
            res.end();
            return;
        }
        fs.createReadStream(absolutePath).pipe(res);
    });
}

const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    if (requestUrl.pathname === "/api/account-management") {
        handleApi(req, res);
        return;
    }
    serveStatic(req, res, requestUrl.pathname);
});

server.listen(PORT, "127.0.0.1", () => {
    console.log(`ArchersHub is running at http://localhost:${PORT}`);
    console.log(`Account data file: ${DATA_FILE}`);
    console.log("Press Ctrl+C to stop the server.");
});
