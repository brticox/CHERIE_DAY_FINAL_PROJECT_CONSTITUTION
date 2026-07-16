import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { safeNextPath } from '@/lib/validation/auth';

describe('kimlik yönlendirme güvenliği', () => {
  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/api/internal/notifications/process',
    '/auth/callback',
    `/hesap/${'a'.repeat(501)}`,
    '/hesap\u0000/sonraki',
  ])('güvenli olmayan sonraki adresi reddeder: %s', (value) => {
    expect(safeNextPath(value)).toBe('/hesap');
  });

  it('sorgu dizesi içeren iç rota adresini korur', () => {
    expect(safeNextPath('/hesap/siparisler?durum=hazirlaniyor')).toBe(
      '/hesap/siparisler?durum=hazirlaniyor',
    );
  });

  it.each(['app/auth/callback/route.ts', 'app/(site)/hesap/actions.ts'])(
    'Supabase RPC metodunu istemciden koparmadan çağırır: %s',
    (file) => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/(?:const|let|var)\s+\w+\s*=\s*supabase\.rpc\s+as/);
      expect(source).toContain('supabase.rpc.bind(supabase)');
    },
  );

  it('يحافظ على ربط جميع استدعاءات Supabase RPC بعميلها', () => {
    for (const directory of ['app', 'lib']) {
      for (const file of readdirSync(resolve(process.cwd(), directory), {
        recursive: true,
      })) {
        if (typeof file !== 'string' || !/\.(?:ts|tsx)$/.test(file)) continue;
        const source = readFileSync(resolve(process.cwd(), directory, file), 'utf8');
        expect(source, `${directory}/${file}`).not.toMatch(/\.rpc\s+as\s+unknown/);
      }
    }
  });

  it('kimlik e-postalarını sunucu tarafı token doğrulama rotasına bağlar', () => {
    const confirmRoute = readFileSync(
      resolve(process.cwd(), 'app/auth/confirm/route.ts'),
      'utf8',
    );
    expect(confirmRoute).toContain('supabase.auth.verifyOtp');
    expect(confirmRoute).toContain('safeNextPath');

    const templateTypes = {
      'confirmation.html': 'signup',
      'email-change.html': 'email_change',
      'invite.html': 'invite',
      'magic-link.html': 'magiclink',
      'recovery.html': 'recovery',
    } as const;

    for (const [file, type] of Object.entries(templateTypes)) {
      const source = readFileSync(
        resolve(process.cwd(), 'supabase/templates', file),
        'utf8',
      );
      expect(source).toContain('/auth/confirm?token_hash={{ .TokenHash }}');
      expect(source).toContain(`type=${type}`);
      expect(source).not.toContain('{{ .ConfirmationURL }}');
    }
  });
});
