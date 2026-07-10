import { PrismaClient } from '@prisma/client'
import { FOODS } from '../../src/data/foods'
import { getFoodNutrition } from '../../src/data/nutrition'

const prisma = new PrismaClient()

for (const f of FOODS) {
  const n = getFoodNutrition(f.id)
  const data = {
    name: f.name,
    emoji: f.emoji,
    tint: f.tint,
    iconId: f.iconId,
    usualMeal: f.usualMeal,
    calories: n.calories,
    carbs: n.carbs,
    protein: n.protein,
    fats: n.fats,
    fiber: n.fiber,
    portionUnit: n.portionUnit,
  }
  await prisma.food.upsert({ where: { id: f.id }, create: { id: f.id, ...data }, update: data })
}

console.log(`Seeded ${FOODS.length} foods`)
await prisma.$disconnect()
