import { currentUser } from '@clerk/nextjs/server'
import { prisma } from './db'
import type { User } from '@prisma/client'

export async function getOrSyncCurrentUser(): Promise<User | null> {
  const clerk = await currentUser()
  if (!clerk) return null

  const email = clerk.emailAddresses[0]?.emailAddress ?? ''

  return prisma.user.upsert({
    where: { id: clerk.id },
    update: { email },
    create: { id: clerk.id, email, isAdmin: false },
  })
}
