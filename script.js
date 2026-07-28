 (function() {
            "use strict";

            // ----- DOM refs -----
            const markdownInput = document.getElementById('markdown-input');
            const htmlOutput = document.getElementById('html-output');
            const preview = document.getElementById('preview');

            // ----- THE converter (pure function) -----
            function convertMarkdown() {
                const raw = markdownInput.value || '';

                // 1) escape HTML special chars to prevent XSS & preserve raw code display
              
                let html = raw;

                // ----- HEADINGS (level 1,2,3) -----
               

                // ----- BLOCK-LEVEL: headings (h1,h2,h3) -----
                // use multiline, match at start of line (with optional spaces)
                html = html.replace(/^[ \t]*(#{1,3})[ \t]+(.+)$/gm, function(match, hashes, content) {
                    const level = hashes.length; // 1,2,3
                    const tag = `h${level}`;
                    // content may contain inline markdown, but we'll process inline later
                    return `<${tag}>${content.trim()}</${tag}>`;
                });

                html = html.replace(/^[ \t]*>[ \t]+(.+)$/gm, function(match, content) {
                    return `<blockquote>${content.trim()}</blockquote>`;
                });

                // ----- INLINE: images ![...](...) -----
                // Must be done before links to avoid conflict
                html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, altText, src) {
                    // altText and src can have spaces, but we keep them as is
                    return `<img src="${src}" alt="${altText}">`;
                });

                // ----- INLINE: links [text](url) -----
                html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, linkText, url) {
                    return `<a href="${url}">${linkText}</a>`;
                });

                // ----- INLINE: bold (**text** or __text__) -----
              
                html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

                // ----- INLINE: italic (*text* or _text_) -----
              
                html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
                html = html.replace(/_(.+?)_/g, '<em>$1</em>');

              

                // Return the raw HTML string (to be displayed in #html-output)
                return html;
            }

            // ----- update UI (raw HTML + preview) -----
            function updateUI() {
                // get converted HTML
                const htmlString = convertMarkdown();

                // 1) raw HTML output (escaped for safe display in code block)
               
                const escaped = htmlString
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
               
                htmlOutput.innerHTML = escaped || '<span style="color: #5b7f8e;">// (empty)</span>';

                // 2) preview: render the HTML directly (safe because we control the conversion)
              
                if (htmlString.trim() === '') {
                    preview.innerHTML = `<span class="empty-state">✨ no markdown yet</span>`;
                } else {
                    preview.innerHTML = htmlString;
                }
            }

            // ----- attach events -----
            markdownInput.addEventListener('input', updateUI);

            // ----- initial render -----
            updateUI();

            // Expose convertMarkdown globally (for testing / user stories)
            window.convertMarkdown = convertMarkdown;

        })();