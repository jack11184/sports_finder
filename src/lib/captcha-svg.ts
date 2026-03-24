function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Simple noisy SVG captcha (server-only; code never sent to client as text).
 */
export function captchaToSvg(code: string): string {
  const w = 200;
  const h = 64;
  const chars = [...code];
  let texts = "";
  const baseX = 18;
  const gap = 32;

  chars.forEach((ch, i) => {
    const x = baseX + i * gap + (i % 2 === 0 ? 2 : -2);
    const y = 42 + (i % 3) * 2;
    const rot = -12 + (i * 7) % 24;
    const fill = i % 2 === 0 ? "#e2e8f0" : "#cbd5e1";
    texts += `<text x="${x}" y="${y}" font-family="ui-monospace, monospace" font-size="26" font-weight="700" fill="${fill}" transform="rotate(${rot} ${x} ${y})">${escapeXml(ch)}</text>`;
  });

  let lines = "";
  for (let i = 0; i < 6; i++) {
    const x1 = (i * 37) % w;
    const y1 = (i * 19) % h;
    const x2 = (x1 + 40 + i * 11) % w;
    const y2 = (y1 + 25 + i * 7) % h;
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#475569" stroke-width="0.8" opacity="0.35"/>`;
  }

  for (let i = 0; i < 20; i++) {
    const cx = (i * 53) % w;
    const cy = (i * 31 + 7) % h;
    lines += `<circle cx="${cx}" cy="${cy}" r="1.2" fill="#64748b" opacity="0.4"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#0f1117"/>
  ${lines}
  ${texts}
</svg>`;
}
