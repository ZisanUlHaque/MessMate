-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BazarCategory" AS ENUM ('GROCERY', 'GAS', 'UTILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BKASH', 'BANK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REMINDER', 'BILL', 'APPROVAL', 'ALERT');

-- CreateTable
CREATE TABLE "bazars" (
    "id" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "category" "BazarCategory" NOT NULL DEFAULT 'GROCERY',
    "receiptUrl" VARCHAR(500),
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bazars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bazar_items" (
    "id" TEXT NOT NULL,
    "bazarId" TEXT NOT NULL,
    "itemName" VARCHAR(100) NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "bazar_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalMeals" INTEGER NOT NULL DEFAULT 0,
    "mealRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalBazarShare" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fixedCostShare" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "BillStatus" NOT NULL DEFAULT 'UNPAID',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "breakfast" BOOLEAN NOT NULL DEFAULT false,
    "lunch" BOOLEAN NOT NULL DEFAULT false,
    "dinner" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messes" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "inviteCode" VARCHAR(6) NOT NULL,
    "managerId" TEXT NOT NULL,
    "address" VARCHAR(200),
    "monthlyGasBill" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monthlyUtilityBill" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_members" (
    "id" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mess_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "note" VARCHAR(200),
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "profileImage" VARCHAR(500),
    "expoPushToken" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bazars_messId_date_idx" ON "bazars"("messId", "date");

-- CreateIndex
CREATE INDEX "bazars_category_idx" ON "bazars"("category");

-- CreateIndex
CREATE INDEX "bazar_items_bazarId_idx" ON "bazar_items"("bazarId");

-- CreateIndex
CREATE INDEX "bills_messId_month_year_idx" ON "bills"("messId", "month", "year");

-- CreateIndex
CREATE INDEX "bills_userId_idx" ON "bills"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bills_messId_userId_month_year_key" ON "bills"("messId", "userId", "month", "year");

-- CreateIndex
CREATE INDEX "meals_messId_date_idx" ON "meals"("messId", "date");

-- CreateIndex
CREATE INDEX "meals_userId_date_idx" ON "meals"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meals_messId_userId_date_key" ON "meals"("messId", "userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "messes_inviteCode_key" ON "messes"("inviteCode");

-- CreateIndex
CREATE INDEX "messes_managerId_idx" ON "messes"("managerId");

-- CreateIndex
CREATE INDEX "mess_members_messId_idx" ON "mess_members"("messId");

-- CreateIndex
CREATE INDEX "mess_members_userId_idx" ON "mess_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mess_members_messId_userId_key" ON "mess_members"("messId", "userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "payments_billId_idx" ON "payments"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "bazars" ADD CONSTRAINT "bazars_messId_fkey" FOREIGN KEY ("messId") REFERENCES "messes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bazars" ADD CONSTRAINT "bazars_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bazar_items" ADD CONSTRAINT "bazar_items_bazarId_fkey" FOREIGN KEY ("bazarId") REFERENCES "bazars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_messId_fkey" FOREIGN KEY ("messId") REFERENCES "messes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_messId_fkey" FOREIGN KEY ("messId") REFERENCES "messes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messes" ADD CONSTRAINT "messes_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_members" ADD CONSTRAINT "mess_members_messId_fkey" FOREIGN KEY ("messId") REFERENCES "messes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_members" ADD CONSTRAINT "mess_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_messId_fkey" FOREIGN KEY ("messId") REFERENCES "messes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
