-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL DEFAULT 'avatar-avocado',
    "setupComplete" BOOLEAN NOT NULL DEFAULT false,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "foodPreference" TEXT,
    "mealReminders" JSONB,
    "hydrationReminders" JSONB,
    "motivationalReminders" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "tint" TEXT NOT NULL,
    "iconId" TEXT NOT NULL,
    "usualMeal" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "fats" INTEGER NOT NULL,
    "fiber" INTEGER NOT NULL,
    "portionUnit" TEXT NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "dbId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "customName" TEXT,
    "iconId" TEXT NOT NULL,
    "quantity" TEXT,
    "note" TEXT,
    "loggedAt" TIMESTAMP(3),

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "MealMeta" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "mood" INTEGER,
    "mealNote" TEXT,

    CONSTRAINT "MealMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MealItem_userId_date_idx" ON "MealItem"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MealItem_userId_itemId_mode_key" ON "MealItem"("userId", "itemId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "MealMeta_userId_date_mealType_key" ON "MealMeta"("userId", "date", "mealType");

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealMeta" ADD CONSTRAINT "MealMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
