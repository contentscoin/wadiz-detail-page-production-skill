// Quantitative source-link checks adapted from sangse/numerical_provenance.py.
// MIT, Copyright (c) 2026 fivetaku. This checks linkage, not truth/calculation.
import { readFileSync } from 'node:fs';
import { parseQuantitativeDeclarations, stripQuantitativeBlocks } from './sangse-format.mjs';

const templates = JSON.parse(readFileSync(new URL('../../assets/sangse/cut-templates.json', import.meta.url), 'utf8')).templates;
const banned = JSON.parse(readFileSync(new URL('../../assets/sangse/banned-words.json', import.meta.url), 'utf8'));
const placeholders = /\[(자료 필요|선택|이미지 생성 실패)[^\]]*\]/g;
const nonCopy = new Set(['image', 'visual', 'text_pos', 'bg']);

export function normalizeClaim(value) {
  return String(value).replace(placeholders, '').replace(/\*\*/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/(?<=\d),(?=\d{3}(?:\D|$))/g, '')
    .replace(/(?<=\d)\s+(?=(?:mg|g|kg|mL|L|cm|mm|mAh|kcal|dB|원|%)(?![A-Za-z]))/g, '')
    .trim().split(/\r?\n/).map(line => line.replace(/[ \t]+/g, ' ').trim()).join('\n');
}

function hasQuantity(text) {
  return /\d/.test(text.replace(placeholders, '').replace(/(?:^|\|)[ \t]*(?:point|step)[ \t]+\d+[ \t]*(?=$|\|)/gim, ''));
}

export function checkQuantitativeLinks(cuts, legal, sourceFiles) {
  const plain = Object.fromEntries(Object.entries(sourceFiles).map(([name, content]) => [name, stripQuantitativeBlocks(content)]));
  const { declarations, errors } = parseQuantitativeDeclarations(sourceFiles['intake-checklist.md'] ?? '');
  const approvals = new Set();
  const sourceLinks = [];
  for (const declaration of declarations) {
    const details = [];
    for (const link of declaration.sources) {
      if (!link || !['raw-input.md', 'intake-checklist.md'].includes(link.file) || typeof link.quote !== 'string' || !link.quote.trim() || !plain[link.file]?.includes(link.quote)) {
        details.push(`${declaration.at}: source quote missing from ${link?.file ?? '(missing file)'}`);
      }
    }
    errors.push(...details);
    if (!details.length) approvals.add(`${declaration.at}\u0000${normalizeClaim(declaration.claim)}`);
    sourceLinks.push({ ...declaration, linkage_status: details.length ? 'invalid' : 'linked', semantic_status: 'not_verified', arithmetic_status: 'not_verified' });
  }
  const statements = new Set(Object.values(plain).flatMap(content => content.split(/\r?\n/).filter(line => line.trim()).map(normalizeClaim)));
  const checks = [];
  for (const cut of cuts) {
    for (const [field, raw] of Object.entries(cut.fields)) {
      if (!nonCopy.has(field) && hasQuantity(raw)) checks.push([`${cut.id}.${field}`, raw]);
    }
  }
  let section = '';
  for (const line of legal.split(/\r?\n/)) {
    if (line.startsWith('## ')) section = line.slice(3).trim();
    if (hasQuantity(line)) checks.push([`legal:${section}`, line]);
  }
  const haveSources = Object.values(plain).some(content => content.trim());
  if (!haveSources) return { status: errors.length ? 'FAIL' : 'WARN', errors, source_links: sourceLinks, semantic_verification: 'not_performed', arithmetic_verification: 'not_performed', warnings: ['No source documents; quantitative source tracing unavailable.'] };
  for (const [at, claim] of checks) {
    if (!approvals.has(`${at}\u0000${normalizeClaim(claim)}`) && !statements.has(normalizeClaim(claim))) errors.push(`${at}: unlinked quantitative statement: ${claim}`);
  }
  return { status: errors.length ? 'FAIL' : haveSources ? 'PASS' : 'WARN', errors, source_links: sourceLinks, semantic_verification: 'not_performed', arithmetic_verification: 'not_performed' };
}

export function checkCopySlots(pagePlan) {
  const errors = [];
  const warnings = [];
  for (const section of pagePlan.sections) {
    const rule = templates[section.template];
    if (!rule) { if (section.template) warnings.push(`${section.id}: unknown template ${section.template}`); continue; }
    const slots = { headline: rule.headline_max, subcopy: rule.sub_max };
    for (const [slot, max] of Object.entries(slots)) {
      for (const line of String(section.copy[slot] ?? '').split(/[|\n]/)) if ([...line].length > max) errors.push(`${section.id}.${slot}: ${[...line].length} characters exceeds ${max}`);
    }
    const lines = String(section.copy.body ?? '').split(/\n/).filter(line => line.trim());
    if (lines.length > rule.body_lines_max) errors.push(`${section.id}.body: ${lines.length} lines exceeds ${rule.body_lines_max}`);
    for (const line of lines) if ([...line].length > rule.line_max) errors.push(`${section.id}.body: line exceeds ${rule.line_max} characters`);
  }
  return { status: errors.length ? 'FAIL' : warnings.length ? 'WARN' : 'PASS', errors, warnings, measurement: 'sangse_template_at_1000px_not_rendered_fit' };
}

export function checkCopyLanguage(pagePlan, category = pagePlan.category) {
  const matches = [];
  const group = category === 'beauty' ? 'cosmetics' : category;
  for (const section of pagePlan.sections) {
    const text = Object.values(section.copy).filter(value => typeof value === 'string').join('\n').replace(placeholders, '');
    const groups = ['common', group, ...(section.questions.includes('Q1') ? ['q1_hero'] : [])];
    for (const key of new Set(groups)) {
      for (const severity of ['ban', 'warn']) {
        for (const expression of banned[key]?.[severity] ?? []) {
          for (const line of text.split('\n')) {
            if (severity === 'ban' && /아닙니다|아님|오인|금지|하지 (마|않)/.test(line)) continue;
            const match = new RegExp(expression, 'i').exec(line);
            if (match) matches.push({ section_id: section.id, group: key, severity, expression, match: match[0] });
          }
        }
      }
    }
  }
  return { status: matches.some(match => match.severity === 'ban') ? 'FAIL' : matches.length ? 'WARN' : 'PASS', matches, legal_review: 'not_performed' };
}
