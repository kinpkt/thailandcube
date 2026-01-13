-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" INTEGER NOT NULL,
    "wca_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "competition_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "time_limit" DOUBLE PRECISION NOT NULL,
    "cutoff" DOUBLE PRECISION,
    "proceed" DOUBLE PRECISION,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "competitor_id" INTEGER NOT NULL,
    "display" TEXT,
    "attempts" DOUBLE PRECISION[],
    "result" DOUBLE PRECISION,
    "best" DOUBLE PRECISION,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Competitor_wca_id_key" ON "Competitor"("wca_id");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_proposal_id_key" ON "Competition"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_name_key" ON "Competition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Round_competition_id_key" ON "Round"("competition_id");

-- CreateIndex
CREATE UNIQUE INDEX "Result_competitor_id_round_id_key" ON "Result"("competitor_id", "round_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "Competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
