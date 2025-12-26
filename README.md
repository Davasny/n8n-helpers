# n8n-helpers

A collection of helper functions I needed in n8n but didn't want to write as code blocks and installing 3rd party
dependencies.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the server
pnpm start

# Or run in development mode with hot reload
pnpm dev
```

The server runs on `http://localhost:3000`.

## MCP (Model Context Protocol) Tools

Each feature is exposed as an MCP server, allowing AI assistants like Claude to use these tools directly.

### MCP Endpoints

| Endpoint | MCP Server Name | Description |
|----------|-----------------|-------------|
| `/mcp/convert` | convert-mcp | File format conversion tools |
| `/mcp/goto` | goto-mcp | Browser automation tools |
| `/mcp/simplify-html` | simplify-html-mcp | HTML content extraction |
| `/mcp/yoast-seo` | yoast-seo-mcp | SEO analysis tools |

### Connecting MCP Clients

To connect an MCP client (like Claude Desktop), add the server to your MCP configuration:

```json
{
  "mcpServers": {
    "n8n-helpers-convert": {
      "url": "http://localhost:3000/mcp/convert"
    },
    "n8n-helpers-goto": {
      "url": "http://localhost:3000/mcp/goto"
    },
    "n8n-helpers-simplify-html": {
      "url": "http://localhost:3000/mcp/simplify-html"
    },
    "n8n-helpers-yoast-seo": {
      "url": "http://localhost:3000/mcp/yoast-seo"
    }
  }
}
```

### Available MCP Tools

#### `/mcp/convert` - Convert MCP Server

**`convert-excel-to-csv`**

Convert an Excel file (xlsx) to CSV format.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fileName` | string | Original filename of the Excel file |
| `base64Content` | string | Base64-encoded content of the Excel file |

Returns: `{ csv: string, outputFileName: string }`

---

#### `/mcp/goto` - Goto MCP Server

**`fetch-page-html`**

Navigate to a URL using a real browser and return the page HTML content. Handles JavaScript-rendered pages.

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | The URL to navigate to |

Returns: `{ html: string }`

**`list-failure-screenshots`**

List all saved failure screenshots from browser navigation errors.

| Parameter | Type | Description |
|-----------|------|-------------|
| (none) | - | - |

Returns: `{ fileIds: string[] }`

**`get-failure-screenshot`**

Get a failure screenshot by its UUID.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fileId` | string (UUID) | UUID of the screenshot file |

Returns: `{ base64Png: string }`

---

#### `/mcp/simplify-html` - Simplify HTML MCP Server

**`simplify-html`**

Extract readable content from HTML using Mozilla Readability. Returns cleaned article content, title, excerpt, and metadata.

| Parameter | Type | Description |
|-----------|------|-------------|
| `html` | string | The HTML content to simplify |
| `sourceUrl` | string (optional) | Original URL of the HTML content (helps with relative link resolution) |

Returns:
```json
{
  "title": "string | null",
  "content": "string | null",
  "textContent": "string | null",
  "length": "number | null",
  "excerpt": "string | null",
  "byline": "string | null",
  "dir": "string | null",
  "siteName": "string | null",
  "lang": "string | null",
  "publishedTime": "string | null"
}
```

---

#### `/mcp/yoast-seo` - Yoast SEO MCP Server

**`analyze-seo`**

Analyze text content for SEO issues using Yoast SEO. Returns a list of SEO and readability errors/warnings.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | The main text content to analyze |
| `title` | string | The page/article title |
| `description` | string | Meta description |
| `keyword` | string | Focus keyword/keyphrase |
| `slug` | string | URL slug |

Returns: `{ errors: string[] }`

---

## HTTP REST Endpoints

The same functionality is also available via traditional HTTP REST endpoints.

### GET `/goto`

Getting client rendered HTML from a URL using chromium.

**Query Parameters:**
- `url` (required): The URL to navigate to

Implementation: [src/features/goto/router.ts](src/features/goto/router.ts)

### GET `/goto/screenshots`

List all failure screenshots captured when navigation fails.

Implementation: [src/features/goto/router.ts](src/features/goto/router.ts)

### GET `/goto/screenshots/:fileId`

Get a specific screenshot by its UUID.

Implementation: [src/features/goto/router.ts](src/features/goto/router.ts)

### POST `/simplify-html`

Simplifying HTML using [readability](https://github.com/mozilla/readability).

**Request Body:**
```json
{
  "content": "string (required)",
  "originalUrl": "string (optional)"
}
```

Implementation: [src/features/simplify-html/router.ts](src/features/simplify-html/router.ts)

### POST `/convert/base64`

Converting files from one format to another. Currently supports:
- Excel (xlsx) to CSV

**Request Body:**
```json
{
  "from": "xlsx",
  "to": "csv",
  "file": {
    "name": "string",
    "base64": "string"
  }
}
```

Implementation: [src/features/convert/router.ts](src/features/convert/router.ts)

### POST `/yoast-seo`

Run Yoast SEO analysis on provided text. Returns a list of SEO issues.

**Request Body:**
```json
{
  "text": "string",
  "title": "string",
  "description": "string",
  "keyword": "string",
  "slug": "string"
}
```

Implementation: [src/features/yoast-seo/router.ts](src/features/yoast-seo/router.ts)
