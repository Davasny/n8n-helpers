# n8n-helpers

A collection of helper functions I needed in n8n but didn't want to write as code blocks and installing 3rd party
dependencies.

## Available endpoints

### GET `/goto`

Getting client rendered HTML from a URL using chromium

Implementation: [src/features/goto/router.ts](src/features/goto/router.ts)

### POST `/simplify-html`

Simplifying HTML using [readability](https://github.com/mozilla/readability)

Implementation: [src/features/simplify-html/router.ts](src/features/simplify-html/router.ts)

### POST `/convert/base64`

Converting files from one format to another. Currently supports:
- Excel (xlsx) to CSV

Implementation: [src/features/convert/router.ts](src/features/convert/router.ts)
