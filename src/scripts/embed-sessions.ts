import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { InferenceClient } from '@huggingface/inference';

const pool = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter: pool,
});

const hf = new InferenceClient(process.env.HF_TOKEN!);

async function run() {
  console.log("HF_TOKEN:", process.env.HF_TOKEN?.slice(0, 6));

  // 1️⃣ Get sessions without embeddings
  const sessions = await prisma.$queryRaw<
    { id: string; title: string; abstract: string }[]
  >`
    SELECT id, title, abstract
    FROM sessions
    WHERE embedding IS NULL
      AND deleted_at IS NULL
  `;

  console.log(`Found ${sessions.length} sessions to embed`);

  for (const session of sessions) {
    try {
      const text = `passage: ${session.title} ${session.abstract}`;

      // 2️⃣ Generate embedding
      const result = await hf.featureExtraction({
        model: "intfloat/e5-small-v2",
        inputs: text,
      });

      const vector = result as number[];

      // 3️⃣ Convert to pgvector string format
      const vectorString = `[${vector.join(',')}]`;

      // 4️⃣ Store in database
      await prisma.$executeRawUnsafe(`
        UPDATE sessions
        SET embedding = '${vectorString}'::vector
        WHERE id = '${session.id}'
      `);

      console.log(`Embedded session ${session.id}`);
    } catch (err) {
      console.error(`Failed embedding session ${session.id}`, err);
    }
  }

  await prisma.$disconnect();
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

async function runFeatureExtraction() {
    console.log("HF_TOKEN:", process.env.HF_TOKEN?.slice(0, 6));
    console.log(process.env.HF_TOKEN);
  const result = await hf.featureExtraction({
    model: "intfloat/e5-small-v2",
    inputs: "That is a very happy person",
  });

  console.log(result);
}
