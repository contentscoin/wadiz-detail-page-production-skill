#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const imageDir = process.argv[2];
const outputHtml = process.argv[3] || (imageDir ? path.join(imageDir, "index.html") : null);

if (!imageDir || !outputHtml) {
  console.error("Usage: node build-image-gallery.mjs <image-dir> [output-html]");
  process.exit(1);
}

const absImageDir = path.resolve(imageDir);
const absOutputHtml = path.resolve(outputHtml);
const files = (await fs.readdir(absImageDir))
  .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

if (!files.length) {
  console.error(`No images found in ${absImageDir}`);
  process.exit(1);
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const imageItems = files.map((file, index) => {
  const label = `cut-${String(index + 1).padStart(2, "0")}`;
  const rel = path.relative(path.dirname(absOutputHtml), path.join(absImageDir, file));
  const src = rel.startsWith(".") ? rel : `./${rel}`;
  return { label, file, src };
});

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>상세페이지 이미지 리뷰</title>
  <style>
    :root { color-scheme: light; --ink:#171717; --muted:#6b7280; --line:#e5e7eb; --bg:#f8fafc; }
    body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard",sans-serif; background:var(--bg); color:var(--ink); }
    header { position:sticky; top:0; z-index:2; background:rgba(255,255,255,.94); border-bottom:1px solid var(--line); padding:16px 20px; backdrop-filter:blur(12px); }
    h1 { margin:0 0 8px; font-size:20px; }
    .actions { display:flex; gap:8px; flex-wrap:wrap; }
    button, a.download { border:1px solid #111827; background:#111827; color:#fff; border-radius:8px; padding:9px 12px; font-size:14px; text-decoration:none; cursor:pointer; }
    a.download { background:#fff; color:#111827; }
    main { max-width:980px; margin:0 auto; padding:24px 14px 72px; }
    article { background:#fff; border:1px solid var(--line); border-radius:10px; margin:0 0 22px; overflow:hidden; box-shadow:0 10px 26px rgba(15,23,42,.05); }
    .meta { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:14px 16px; border-bottom:1px solid var(--line); }
    h2 { margin:0; font-size:16px; }
    .qa { color:var(--muted); font-size:13px; }
    img { display:block; width:100%; height:auto; background:#fff; }
    .links { padding:12px 16px; border-top:1px solid var(--line); }
  </style>
</head>
<body>
  <header>
    <h1>상세페이지 이미지 리뷰</h1>
    <div class="actions">
      <button type="button" id="downloadAll">전체 다운로드</button>
      <span class="qa">총 ${imageItems.length}개 컷</span>
    </div>
  </header>
  <main>
    ${imageItems.map((item) => `
      <article>
        <div class="meta">
          <h2>${esc(item.label)}</h2>
          <span class="qa">QA: 확인 필요</span>
        </div>
        <img src="${esc(item.src)}" alt="${esc(item.label)}" />
        <div class="links">
          <a class="download" href="${esc(item.src)}" download="${esc(item.label)}-${esc(item.file)}">이 컷 다운로드</a>
        </div>
      </article>
    `).join("")}
  </main>
  <script>
    const links = [...document.querySelectorAll("a.download")];
    document.getElementById("downloadAll").addEventListener("click", () => {
      links.forEach((link, index) => {
        setTimeout(() => link.click(), index * 160);
      });
    });
  </script>
</body>
</html>
`;

await fs.mkdir(path.dirname(absOutputHtml), { recursive: true });
await fs.writeFile(absOutputHtml, html, "utf8");
console.log(absOutputHtml);
