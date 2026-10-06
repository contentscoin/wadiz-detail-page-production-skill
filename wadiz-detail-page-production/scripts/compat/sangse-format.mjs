// Adapted from sangse's cut sheet format, MIT, Copyright (c) 2026 fivetaku.
export const PURCHASE_QUESTIONS = {
  Q1: '이게 나를 위한 건가?', Q2: '그래서 나는 뭘 얻나?',
  Q3: '왜 이 방식이어야 하나?', Q4: '정말 나도 가능할까?',
  Q5: '얼마나 힘들고 오래 해야 하나?', Q6: '정확히 뭘 받나?',
  Q7: '실패하면 어떡하지?', Q8: '왜 지금 결제해야 하나?',
};

/** Read sangse YAML-like fields without evaluating YAML or rewriting copy. */
export function parseFields(lines) {
  const fields = {};
  const unmapped = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^([\w-]+):[ \t]*(.*)$/);
    if (!match) { if (lines[i].trim()) unmapped.push(lines[i]); continue; }
    const [, key, initial] = match;
    let value = initial;
    if (initial === '|') {
      const block = [];
      while (i + 1 < lines.length && (/^[ \t]+/.test(lines[i + 1]) || !lines[i + 1].trim())) {
        block.push(lines[++i]);
      }
      while (block.length && !block.at(-1).trim()) block.pop();
      const indents = block.filter(line => line.trim()).map(line => line.match(/^[ \t]*/)[0].length);
      const indent = indents.length ? Math.min(...indents) : 0;
      value = block.map(line => line.slice(indent)).join('\n');
    }
    if (Object.hasOwn(fields, key)) unmapped.push({ duplicate_field: key, previous_value: fields[key] });
    fields[key] = value;
  }
  return { fields, unmapped };
}

export function parseCuts(markdown) {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);
  const heads = lines.flatMap((line, index) => /^##\s+C\d+\b/.test(line) ? [{ line, index }] : []);
  if (!heads.length) throw new Error('cuts.md contains no sangse cut headers (## C01 · K2 · Q1 · h=...).');
  const metadata = parseFields(lines.slice(0, heads[0].index));
  const title = lines.find(line => /^#\s+/.test(line))?.replace(/^#\s+/, '') ?? '';
  const cuts = heads.map((head, index) => {
    const id = head.line.match(/^##\s+(C\d+)/)[1];
    const tokens = head.line.replace(/^##\s+/, '').split(/\s*[·|]\s*/).slice(1);
    const template = tokens.find(token => /^[A-Z]+\d+$/.test(token) && !/^Q\d+$/.test(token));
    const questions = [...new Set(head.line.match(/\bQ[1-8]\b/g) ?? [])];
    const heightText = tokens.find(token => /^h\s*=/.test(token));
    const height = heightText ? Number(heightText.replace(/^h\s*=\s*/, '')) : null;
    const parsed = parseFields(lines.slice(head.index + 1, heads[index + 1]?.index ?? lines.length));
    const known = tokens.filter(token => token !== template && !/^Q[1-8]$/.test(token) && !/^h\s*=/.test(token));
    return { id, template: template ?? null, questions, height, header: head.line, ...parsed, unmapped: [...known, ...parsed.unmapped] };
  });
  if (new Set(cuts.map(cut => cut.id)).size !== cuts.length) throw new Error('Duplicate sangse cut IDs.');
  return { title, metadata: metadata.fields, unmapped: metadata.unmapped.filter(line => typeof line !== 'string' || !line.startsWith('# ')), cuts };
}

export function parseLegal(markdown) {
  const blocks = [];
  let title = '';
  let lines = [];
  const flush = () => { if (title || lines.some(line => line.trim())) blocks.push({ title, text: lines.join('\n').trim() }); };
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) { flush(); title = heading[1]; lines = []; } else lines.push(line);
  }
  flush();
  return blocks;
}

export function stripQuantitativeBlocks(text) {
  return text.replace(/^```quantitative-facts[ \t]*\r?\n[\s\S]*?^```[ \t]*$/gm, '');
}

export function parseQuantitativeDeclarations(text) {
  const blocks = [...text.matchAll(/^```quantitative-facts[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm)];
  const errors = [];
  const declarations = [];
  if ((text.match(/```quantitative-facts/g) ?? []).length !== blocks.length) errors.push('Unterminated quantitative-facts block.');
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1]);
      if (!Array.isArray(value)) throw new Error('Expected declaration array.');
      for (const declaration of value) {
        if (!declaration || typeof declaration.at !== 'string' || !declaration.at || typeof declaration.claim !== 'string' || !declaration.claim.trim() || !Array.isArray(declaration.sources) || !declaration.sources.length) {
          throw new Error('Each quantitative declaration needs at, claim, and nonempty sources.');
        }
        declarations.push(declaration);
      }
    } catch (error) { errors.push(error.message); }
  }
  return { declarations, errors };
}
