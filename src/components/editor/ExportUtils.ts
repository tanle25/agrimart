// Export utilities for PDF, Markdown, and Copy functionality

/**
'use client';
 * Convert HTML to Markdown (simplified version)
 */
export const htmlToMarkdown = (html: string): string => {
  let markdown = html;

  // Headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Bold and Italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Images
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');

  // Code blocks
  markdown = markdown.replace(/<pre><code[^>]*class=["']language-([^"']*)["'][^>]*>(.*?)<\/code><\/pre>/gis, '```$1\n$2\n```\n\n');
  markdown = markdown.replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gis) || [];
    return items.map((item: string) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/gis, '$1').trim();
      return `- ${text}\n`;
    }).join('') + '\n';
  });

  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gis) || [];
    return items.map((item: string, index: number) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/gis, '$1').trim();
      return `${index + 1}. ${text}\n`;
    }).join('') + '\n';
  });

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    const lines = content.trim().split('\n');
    return lines.map((line: string) => `> ${line.trim()}`).join('\n') + '\n\n';
  });

  // Horizontal rules
  markdown = markdown.replace(/<hr[^>]*>/gi, '---\n\n');

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  // Clean up multiple newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.replace(/^\s+|\s+$/g, '');

  return markdown;
};

/**
 * Export as Markdown file
 */
export const exportAsMarkdown = (content: string, filename: string = 'document.md') => {
  const markdown = htmlToMarkdown(content);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copy content as Markdown to clipboard
 */
export const copyAsMarkdown = async (content: string): Promise<boolean> => {
  try {
    const markdown = htmlToMarkdown(content);
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (err) {
    console.error('Failed to copy as markdown:', err);
    return false;
  }
};

/**
 * Export as PDF using html2pdf (requires html2pdf.js library)
 * Fallback to print if library not available
 */
export const exportAsPDF = async (content: string, filename: string = 'document.pdf') => {
  // Check if html2pdf is available
  if (typeof window !== 'undefined' && (window as any).html2pdf) {
    try {
      const opt = {
        margin: 1,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      };
      
      const element = document.createElement('div');
      element.innerHTML = content;
      element.style.padding = '20px';
      element.style.fontFamily = 'Arial, sans-serif';
      
      await (window as any).html2pdf().set(opt).from(element).save();
      return true;
    } catch (err) {
      console.error('PDF export failed:', err);
      // Fallback to print
      return exportAsPDFFallback(content);
    }
  } else {
    // Fallback: use print dialog
    return exportAsPDFFallback(content);
  }
};

/**
 * Fallback PDF export using print dialog
 */
const exportAsPDFFallback = (content: string): boolean => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return false;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Export PDF</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);

  return true;
};

