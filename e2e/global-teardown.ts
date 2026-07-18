import { cleanupProductCartFixture } from './fixtures/product-cart';

export default async function globalTeardown() {
  await cleanupProductCartFixture();
}
