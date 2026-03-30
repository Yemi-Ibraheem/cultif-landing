export function renderMarkdown(text: string) {
  if (!text) return { __html: "" };
  
  let html = text
    // Escaping basic HTML to prevent injection
    .replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #20b2aa; text-decoration: underline;">$1</a>')
    // Line breaks to <br/> (for non-block elements)
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br />');

  // Wrap in p tags if no other block wrapper
  if (!html.startsWith('<h') && !html.startsWith('<p>')) {
    html = `<p>${html}</p>`;
  }

  return { __html: html };
}
