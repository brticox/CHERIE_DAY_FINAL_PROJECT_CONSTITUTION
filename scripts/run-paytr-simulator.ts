import {
  simulatePaytrCallback,
  assertPaytrSimulatorEnvironment,
  type PaytrSimulatorScenario,
} from '../lib/payments/paytr-simulator';

async function main() {
  assertPaytrSimulatorEnvironment();
  const target = new URL(
    process.env.PAYTR_SIMULATOR_TARGET_URL ??
      'http://localhost:3000/api/payments/paytr/callback',
  );
  if (!['localhost', '127.0.0.1', '::1'].includes(target.hostname)) {
    throw new Error('PAYTR_SIMULATOR_LOCAL_TARGET_REQUIRED');
  }
  const scenario = (process.argv[2] ?? 'success') as PaytrSimulatorScenario;
  const merchantOrderId = process.env.PAYTR_SIMULATOR_MERCHANT_OID ?? 'LOCALORDERA1';
  const amountMinor = Number(process.env.PAYTR_SIMULATOR_AMOUNT_MINOR ?? '10000');
  const credentials = {
    merchantId: process.env.PAYTR_MERCHANT_ID ?? 'local-merchant',
    merchantKey: process.env.PAYTR_MERCHANT_KEY ?? 'local-key',
    merchantSalt: process.env.PAYTR_MERCHANT_SALT ?? 'local-salt',
  };
  const body = simulatePaytrCallback({
    credentials,
    scenario,
    merchantOrderId,
    paymentAmountMinor: amountMinor,
  });
  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  process.stdout.write(
    JSON.stringify({
      scenario,
      status: response.status,
      acknowledgement: await response.text(),
    }) + '\n',
  );
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : 'SIMULATOR_FAILED'}\n`,
  );
  process.exitCode = 1;
});
