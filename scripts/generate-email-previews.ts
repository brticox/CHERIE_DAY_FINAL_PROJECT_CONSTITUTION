import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { renderTemplate, templateDefinitions } from '../lib/notifications/templates';

const output = resolve('artifacts/email-previews');
await mkdir(output, { recursive: true });

const links: string[] = [];
for (const key of Object.keys(templateDefinitions)) {
  const rendered = renderTemplate(key, {
    customer_name: 'Şule & Çağrı',
    order_number: 'CD-260714-001234',
    lead_id: 'lead-preview',
  });
  const fileName = `${key}.html`;
  await writeFile(resolve(output, fileName), rendered.html, 'utf8');
  await writeFile(resolve(output, `${key}.txt`), rendered.text, 'utf8');
  links.push(`<li><a href="${fileName}">${key}</a> — ${rendered.subject}</li>`);
}

await writeFile(
  resolve(output, 'index.html'),
  `<!doctype html><html lang="tr"><meta charset="utf-8"><title>CHERIE DAY e-posta önizlemeleri</title><body><h1>E-posta önizlemeleri</h1><ul>${links.join('')}</ul></body></html>`,
  'utf8',
);

console.info(`Generated ${links.length} email previews in ${output}`);
