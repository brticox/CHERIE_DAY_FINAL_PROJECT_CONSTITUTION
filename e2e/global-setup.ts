import { setupProductCartFixture } from './fixtures/product-cart';

export default async function globalSetup() {
  await setupProductCartFixture();
}
