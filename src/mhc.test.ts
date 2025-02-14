import { describe, it, expect } from 'vitest';
import { MarkdownParser } from './mhc';

describe('MarkdownParser', () => {
    const parser = new MarkdownParser();

    describe('Markdown to HTML conversion', () => {
        it('converts headers correctly', () => {
            const markdown = "# Header 1\n## Header 2\n### Header 3";
            const expected = "<h1>Header 1</h1><h2>Header 2</h2><h3>Header 3</h3>";
            expect(parser.toHTML(markdown).replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''));
        });

        it('converts bold text correctly', () => {
            const markdown = "**Bold text**";
            const expected = "<strong>Bold text</strong>";
            expect(parser.toHTML(markdown)).toBe(expected);
        });

        it('converts italic text correctly', () => {
            const markdown = "*Italic text*";
            const expected = "<em>Italic text</em>";
            expect(parser.toHTML(markdown)).toBe(expected);
        });

        it('converts combined markdown elements in a sentence - without paragraphs', () => {
            const markdown = "# Main Title\nThis is a **bold statement** with some *italic emphasis*.";
            const expected = "<h1>Main Title</h1>This is a <strong>bold statement</strong> with some <em>italic emphasis</em>.";
            expect(parser.toHTML(markdown).replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''));
        });

        it('converts combined markdown elements in a sentence - with paragraphs', () => {
            const markdown = "# Main Title\nThis is a **bold statement** with some *italic emphasis*.";
            const expected = "<h1>Main Title</h1><p>This is a <strong>bold statement</strong> with some <em>italic emphasis</em>.</p>";
            expect(parser.toHTML(markdown, true).replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''));
        });
    });

    describe('HTML to Markdown conversion', () => {
        it('converts headers correctly', () => {
            const html = "<h1>Header 1</h1><h2>Header 2</h2><h3>Header 3</h3>";
            const expected = "# Header 1\n## Header 2\n### Header 3";
            expect(parser.toMarkdown(html).replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''));
        });

        it('converts bold text correctly', () => {
            const html = "<strong>Bold text</strong>";
            const expected = "**Bold text**";
            expect(parser.toMarkdown(html)).toBe(expected);
        });

        it('converts italic text correctly', () => {
            const html = "<em>Italic text</em>";
            const expected = "*Italic text*";
            expect(parser.toMarkdown(html)).toBe(expected);
        });

        it('converts combined HTML elements in a sentence', () => {
            const html = "<h1>Main Title</h1>This is a <strong>bold statement</strong> with some <em>italic emphasis</em>.";
            const expected = "# Main Title\nThis is a **bold statement** with some *italic emphasis*.";
            expect(parser.toMarkdown(html).replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''));
        });
    });

    describe('MarkdownParser Nesting', () => {
        it('handles nested formatting - without paragraphs', () => {
            const markdown = "This is **bold with *italic* inside**";
            const expectedHtml = "This is <strong>bold with <em>italic</em> inside</strong>";
            expect(parser.toHTML(markdown).trim()).toBe(expectedHtml);
            expect(parser.toMarkdown(expectedHtml).trim()).toBe(markdown);
        });

        it('handles nested formatting - with paragraphs', () => {
            const markdown = "This is **bold with *italic* inside**";
            const expectedHtml = "<p>This is <strong>bold with <em>italic</em> inside</strong></p>";
            expect(parser.toHTML(markdown, true).trim()).toBe(expectedHtml);
        });

        it('handles multiple levels of nesting - with paragraphs', () => {
            const markdown = "# Main Title\nThis is a **bold paragraph with *italic* and more** normal text";
            const expectedHtml = "<h1>Main Title</h1><p>This is a <strong>bold paragraph with <em>italic</em> and more</strong> normal text</p>";
            expect(parser.toHTML(markdown, true).replace(/\s+/g, ' ').trim())
                .toBe(expectedHtml.replace(/\s+/g, ' ').trim());
        });
    });

    describe('MarkdownParser Line Breaks and Paragraphs', () => {
        it('handles single line breaks', () => {
            const markdown = "Line 1  \nLine 2";
            const expectedHtml = "<p>Line 1<br>Line 2</p>";
            expect(parser.toHTML(markdown, true).trim()).toBe(expectedHtml);
        });

        it('handles paragraphs', () => {
            const markdown = "Paragraph 1\n\nParagraph 2";
            const expectedHtml = "<p>Paragraph 1</p><p>Paragraph 2</p>";
            expect(parser.toHTML(markdown, true).trim()).toBe(expectedHtml);
        });

        it('handles mixed content', () => {
            const markdown = "# Header\nParagraph with **bold**\n\nNew paragraph";
            const expectedHtml = "<h1>Header</h1><p>Paragraph with <strong>bold</strong></p><p>New paragraph</p>";
            expect(parser.toHTML(markdown, true).trim()).toBe(expectedHtml);
        });
    });
});
