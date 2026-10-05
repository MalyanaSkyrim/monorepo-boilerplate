import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import { db } from '../../src'

const SEED_USER_EMAIL = 'john.doe@example.com'
const SEED_USER_PASSWORD = 'password123'

/**
 * Local development seed (idempotent).
 * Creates or reuses one verified demo user you can sign in with.
 * Add your own seeders next to this file as your schema grows.
 */
async function main() {
  console.log('🌱 Starting seed...\n')

  const password = await bcrypt.hash(SEED_USER_PASSWORD, 10)

  const user = await db.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: {},
    create: {
      email: SEED_USER_EMAIL,
      password,
      firstName: 'John',
      lastName: 'Doe',
      phone: faker.phone.number(),
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Demo user ready: ${user.email} / ${SEED_USER_PASSWORD}`)
  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
