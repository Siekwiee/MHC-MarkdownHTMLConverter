interface MarkdownConverter {
  toHTML(markdown: string): string;
  toMarkdown(html: string): string;
}

export class MarkdownParser implements MarkdownConverter {
  private htmlRules: Map<string, { pattern: RegExp; replacement: string | Function }>;
  private markdownRules: Map<string, { pattern: RegExp; replacement: string | Function }>;

  constructor() {
    this.htmlRules = new Map([
      // Headers first
      ['header', { 
        pattern: /^(#{1,6})\s(.+)$/gm,
        replacement: (match: string, hLevel: string, text: string) => {
          let content = this.processInlineElements(text);
          return `<h${hLevel.length}>${content}</h${hLevel.length}>`;
        }
      }],
      // Then process inline elements
      ['inline', {
        pattern: /^([*_].*[*_]|[*_]{2}.*[*_]{2})$/gm,
        replacement: (match: string) => {
          return this.processInlineElements(match);
        }
      }],
      // Handle line breaks
      ['linebreak', {
        pattern: /^(.+?)  \n(.+)$/gm,
        replacement: (match: string, line1: string, line2: string) => {
          return `${this.processInlineElements(line1)}<br>${this.processInlineElements(line2)}`;
        }
      }],
      // Handle remaining content
      ['content', {
        pattern: /^(?!#|<)(.+)$/gm,
        replacement: (match: string, text: string) => {
          return this.processInlineElements(text);
        }
      }],
      ['unorderedList', {
        pattern: /^(\s*)[-*]\s+(.+)$/gm,
        replacement: (match: string, indent: string, content: string) => {
          const processedContent = this.processInlineElements(content);
          return `<ul><li>${processedContent}</li></ul>`;
        }
      }],
      ['orderedList', {
        pattern: /^(\s*)\d+\.\s+(.+)$/gm,
        replacement: (match: string, indent: string, content: string) => {
          const processedContent = this.processInlineElements(content);
          return `<ol><li>${processedContent}</li></ol>`;
        }
      }]
    ]);

    this.markdownRules = new Map([
      ['header', {
        pattern: /<h([1-6])>(.*?)<\/h\1>/g,
        replacement: (match: string, level: string, text: string) =>
          `${'#'.repeat(parseInt(level))} ${text}`
      }],
      ['bold', {
        pattern: /<strong>(.*?)<\/strong>/g,
        replacement: '**$1**'
      }],
      ['italic', {
        pattern: /<em>(.*?)<\/em>/g,
        replacement: '*$1*'
      }],
      ['linebreak', {
        pattern: /<br>/g,
        replacement: '  \n'
      }],
      ['paragraph', {
        pattern: /<p>(.*?)<\/p>/g,
        replacement: '$1'
      }],
      ['unorderedList', {
        pattern: /<ul>(.*?)<\/ul>/g,
        replacement: (match: string, content: string) => {
          return content
            .replace(/<li>(.*?)<\/li>/g, (_, text) => `- ${text}\n`)
            .replace(/\n$/, '');
        }
      }],
      ['orderedList', {
        pattern: /<ol>(.*?)<\/ol>/g,
        replacement: (match: string, content: string) => {
          let index = 1;
          return content
            .replace(/<li>(.*?)<\/li>/g, (_, text) => `${index++}. ${text}\n`)
            .replace(/\n$/, '');
        }
      }]
    ]);
  }

  private processInlineElements(text: string): string {
    // Process bold with nested italic
    text = text.replace(/\*\*(.+?)\*\*/g, (match, content) => {
      content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return `<strong>${content}</strong>`;
    });
    
    // Process remaining standalone italic
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    return text;
  }

  private processLists(block: string): string {
    const lines = block.split('\n');
    let html = '';
    let currentIndent = 0;
    let listStack: { tag: string, indent: number }[] = [];

    lines.forEach((line, index) => {
      // Get the indentation level and content
      const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
      if (!match) return;

      const [_, indent, marker, content] = match;
      const indentLevel = indent.length;
      const isOrdered = /\d+\./.test(marker);
      const tag = isOrdered ? 'ol' : 'ul';

      // Handle indentation changes
      if (indentLevel > currentIndent) {
        // Starting a new nested list
        listStack.push({ tag, indent: indentLevel });
        html += `<${tag}><li>${this.processInlineElements(content)}`;
      } else if (indentLevel < currentIndent) {
        // Closing nested lists
        while (listStack.length > 0 && listStack[listStack.length - 1].indent > indentLevel) {
          html += `</li></${listStack.pop()?.tag}>`;
        }
        html += `</li><li>${this.processInlineElements(content)}`;
      } else {
        // Same level, new list item
        if (html === '') {
          // First item in the list
          listStack.push({ tag, indent: indentLevel });
          html += `<${tag}><li>${this.processInlineElements(content)}`;
        } else {
          html += `</li><li>${this.processInlineElements(content)}`;
        }
      }

      currentIndent = indentLevel;

      // Handle the last line
      if (index === lines.length - 1) {
        html += '</li>';
        while (listStack.length > 0) {
          html += `</${listStack.pop()?.tag}>`;
        }
      }
    });

    return html;
  }

  toHTML(markdown: string, wrapParagraphs: boolean = false): string {
    let html = markdown;
    
    // Split into blocks by double newlines
    let blocks = html.split(/\n\n+/);
    html = blocks.map(block => {
      // Check if this block is a list
      if (/^(\s*(?:[-*]|\d+\.)\s+)/.test(block)) {
        return this.processLists(block);
      }

      // Handle line breaks before splitting into lines
      block = block.replace(/(.+?)  \n(.+)/g, (_, line1, line2) => {
        return `<p>${this.processInlineElements(line1)}<br>${this.processInlineElements(line2)}</p>`;
      });

      // If no line breaks were processed, handle as normal block
      if (!block.includes('<br>')) {
        let lines = block.split('\n');
        let processedLines = lines.map(line => {
          let processed = line;
          
          // Process headers first
          const headerRule = this.htmlRules.get('header');
          if (headerRule) {
            processed = processed.replace(headerRule.pattern, headerRule.replacement as any);
          }

          // If it's not a header and we want paragraphs, process the rest
          if (!processed.startsWith('<h') && wrapParagraphs) {
            processed = this.processInlineElements(processed);
            if (!processed.startsWith('<')) {
              processed = `<p>${processed}</p>`;
            }
          } else if (!processed.startsWith('<h')) {
            processed = this.processInlineElements(processed);
          }

          return processed;
        });

        return processedLines.join('');
      }

      return block;
    }).join('');

    // Clean up any extra spaces between tags
    return html.replace(/>\s+</g, '><')
               .replace(/\s+/g, ' ')
               .trim();
  }

  toMarkdown(html: string): string {
    let markdown = html;
    
    for (const [_, rule] of this.markdownRules) {
      markdown = markdown.replace(rule.pattern, rule.replacement as any);
    }

    return markdown.trim();
  }
}

// Example usage
//const parser = new MarkdownParser();

// Current test behavior (no paragraphs)
//parser.toHTML("Some text with **bold**");
// -> "Some text with <strong>bold</strong>"

// Spec-compliant behavior
//parser.toHTML("Some text with **bold**", true);
// -> "<p>Some text with <strong>bold</strong></p>"

//--------------------------------
// Convert Markdown to HTML

//const markdownText = "# Hello World\n**This is bold** and *this is italic*";
//console.log(parser.toHTML(testText, true));
//--------------------------------
// Convert HTML to Markdown
// const htmlText = "<h1>Hello World</h1><strong>This is bold</strong> and <em>this is italic</em>";
// console.log(parser.toMarkdown(htmlText));
