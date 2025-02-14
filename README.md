# Markdown-HTML Converter

A lightweight TypeScript library for converting between Markdown and HTML formats. This library supports converting in both directions, handling headers, emphasis, nested formatting, line breaks, and paragraphs (with optional wrapping).

## Features

- **Bidirectional conversion** between Markdown and HTML
- **Markdown to HTML** supports:
  - Headers (using 1 to 6 `#` symbols, converted to `<h1>`–`<h6>`)
  - Bold text (using `**bold**` converted to `<strong>bold</strong>`)
  - Italic text (using `*italic*` converted to `<em>italic</em>`)
  - Nested formatting (for example, `**bold with *italic* inside**`)
  - Line breaks (two or more spaces at the end of a line become `<br>`)
  - Optional paragraph wrapping: When enabled, blocks of text that are not headers are wrapped in `<p>` tags.
- **HTML to Markdown** supports:
  - Headers (`<h1>`–`<h6>` become Markdown headers with the corresponding number of `#`)
  - Bold text (`<strong>` → `**bold**`)
  - Italic text (`<em>` → `*italic*`)
  - Line breaks (`<br>` → two spaces followed by a newline)
  - Removal of paragraph tags (`<p>...</p>` → content without extra wrapping)

## Installation


```bash
npm install mhc-markdownhtmlconverter
```

## Usage

```typescript
import { MarkdownParser } from 'mhc-markdownhtmlconverter';
const parser = new MarkdownParser();
// Convert Markdown to HTML
const markdown = "# Hello World\nThis is bold and italic text.\n\nThis is a new paragraph with a line break \nSecond line.";
const html = parser.toHTML(markdown); // Converts without wrapping non-header text in <p> tags
const htmlWithParagraphs = parser.toHTML(markdown, true); // Converts with paragraph wrapping
// Convert HTML to Markdown
const htmlInput = "<h1>Hello World</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p>";
const markdownOutput = parser.toMarkdown(htmlInput);
```

## API Reference

### MarkdownParser

#### toHTML(markdown: string, wrapParagraphs?: boolean): string

Converts Markdown text to HTML.

- `markdown`: The input Markdown string.
- `wrapParagraphs`: Optional boolean; if set to `true`, normal text blocks (i.e. ones that do not begin with a header) are wrapped in `<p>` tags. Line breaks (created by two or more trailing spaces) are converted to `<br>` tags.

#### toMarkdown(html: string): string

Converts HTML text back to Markdown.

- `html`: The input HTML string.  
  The conversion includes:
  - Converting `<h1>`–`<h6>` tags to Markdown headers.
  - Converting `<strong>` and `<em>` tags to Markdown bold and italic respectively.
  - Converting `<br>` tags to two spaces followed by a newline.
  - Removing `<p>` wrappers from paragraphs.

## Supported Syntax

### Markdown to HTML

- **Headers:**  
  Markdown headers using 1 to 6 `#` symbols are converted into corresponding `<h1>`–`<h6>` elements.  
  _Example:_  
  `## Sample Header` → `<h2>Sample Header</h2>`

- **Bold Text:**  
  `**text**` is converted to `<strong>text</strong>`.

- **Italic Text:**  
  `*text*` is converted to `<em>text</em>`.

- **Nested Formatting:**  
  Nested Markdown is supported.  
  _Example:_  
  `This is **bold with *italic* inside**` → `<strong>bold with <em>italic</em> inside</strong>`

- **Line Breaks:**  
  Two or more spaces at the end of a line trigger a line break conversion to `<br>`.

- **Paragraphs:**  
  When the `wrapParagraphs` option is enabled, blocks of text separated by empty lines are wrapped in `<p>` tags.

### HTML to Markdown

- **Headers:**  
  `<h1>`–`<h6>` elements are converted to Markdown headers with the corresponding number of `#` symbols.  
  _Example:_  
  `<h2>Sample Header</h2>` → `## Sample Header`

- **Bold Text:**  
  `<strong>text</strong>` becomes `**text**`.

- **Italic Text:**  
  `<em>text</em>` becomes `*text*`.

- **Line Breaks:**  
  `<br>` is replaced by two spaces followed by a newline (`  \n`).

- **Paragraphs:**  
  `<p>text</p>` elements are stripped of their tags, outputting just the text content.

## Testing

Run the tests with:

```bash
npm test
```

## Development

Start the development process with:

```bash
npm run dev
```

## Build

Build the project with:

```bash
npm run build
```

## License

ISC
