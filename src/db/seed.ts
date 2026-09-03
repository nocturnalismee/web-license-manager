import "dotenv/config";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed the database");
  }
  console.log("Seed placeholder: add idempotent development fixtures after Supabase config is provided.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
