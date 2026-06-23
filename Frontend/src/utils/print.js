export function escapeHtml(value) {
  const s = String(value ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function openPrintWindow({ title, bodyHtml, cssText, autoPrint = true }) {
  if (typeof window === "undefined") return;

  const safeTitle = escapeHtml(title || "Print");
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      ${cssText || ""}
    </style>
  </head>
  <body>
    ${bodyHtml || ""}
  </body>
</html>`;

  // Try opening a new tab/window (best UX when allowed).
  const w = window.open("", "_blank");

  if (w) {
    try {
      w.document.open();
      w.document.write(html);
      w.document.close();

      if (autoPrint) {
        const tryPrint = () => {
          try {
            w.focus();
            w.print();
          } catch {
            // ignore
          }
        };

        // Some browsers need a little extra time for layout/fonts.
        w.addEventListener?.("load", () => window.setTimeout(tryPrint, 200));
        window.setTimeout(tryPrint, 500);
      }

      return;
    } catch {
      // Fall through to iframe-based printing.
    }
  }

  // Fallback: print via an in-page hidden iframe (avoids popup blockers).
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  if (autoPrint) {
    const doPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        // ignore
      } finally {
        window.setTimeout(() => iframe.remove(), 500);
      }
    };

    // Wait a moment to ensure the iframe has rendered.
    window.setTimeout(doPrint, 500);
  }
}
