import "dotenv/config";
import { getDb } from "@/db";
import { platformPlans } from "@/db/schema";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed the database");
  }
  const plans = [
    { name: "Free", priceIdr: 0, limits: { products: 1, licenses: 100, activations: 100, api_validations: 10000 } },
    { name: "Starter", priceIdr: 99000, limits: { products: 3, licenses: 1000, activations: 1000, api_validations: 100000 } },
    { name: "Pro", priceIdr: 299000, limits: { products: 20, licenses: 10000, activations: 10000, api_validations: 1000000 } },
    { name: "Agency", priceIdr: 799000, limits: { products: 100, licenses: 100000, activations: 100000, api_validations: 5000000 } },
  ];
  const db = getDb();
  for (const plan of plans) {
    await db.insert(platformPlans).values({ name: plan.name, priceIdr: plan.priceIdr, limits: JSON.stringify(plan.limits) }).onConflictDoUpdate({ target: platformPlans.name, set: { priceIdr: plan.priceIdr, limits: JSON.stringify(plan.limits), updatedAt: new Date() } });
  }
  console.log(`Seeded ${plans.length} platform plans.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
