# Markdown-HTML Converter

A lightweight TypeScript library for converting between Markdown and HTML formats.

## Features

- Converts Markdown to HTML and vice versa
- Supports common Markdown elements:
  - Headers (h1-h3)
  - Bold text
  - Italic text
- Handles nested formatting (e.g., bold text containing italic text)
- Optional paragraph wrapping for HTML output

## Installation

```bash
npm install mhc-markdownhtmlconverter
```

## Usage

```typescript
import { MarkdownParser } from 'mhc-markdownhtmlconverter';
const parser = new MarkdownParser();

// Convert Markdown to HTML
const markdown = "# Hello World\nThis is bold and italic text.";
const html = parser.toHTML(markdown); // Without paragraph wrapping
const htmlWithParagraphs = parser.toHTML(markdown, true); // With paragraph wrapping

// Convert HTML to Markdown
const htmlInput = "<h1>Hello World</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p>";
const markdownOutput = parser.toMarkdown(htmlInput);
```

## API Reference

### MarkdownParser

#### `toHTML(markdown: string, wrapParagraphs: boolean = false): string`

Converts Markdown to HTML.

Converts Markdown text to HTML.

- `markdown`: The input Markdown string
- `wrapParagraphs`: Optional boolean to wrap non-header text in paragraph tags

#### `toMarkdown(html: string): string`

Converts HTML text to Markdown.

- `html`: The input HTML string

## Supported Syntax

### Markdown to HTML

- Headers: `# H1` → `<h1>H1</h1>`
- Bold: `**text**` → `<strong>text</strong>`
- Italic: `*text*` → `<em>text</em>`
- Line breaks: `text  \n` → `text<br>`
- Paragraphs: Blank line between text (when enabled)

### HTML to Markdown

- Headers: `<h1>H1</h1>` → `# H1`
- Bold: `<strong>text</strong>` → `**text**`
- Italic: `<em>text</em>` → `*text*`
- Line breaks: `<br>` → `  \n`
- Paragraphs: `<p>text</p>` → `text`

## Testing

```bash
npm test
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT
