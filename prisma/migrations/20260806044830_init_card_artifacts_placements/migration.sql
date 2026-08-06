-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CANDIDATE', 'RECRUITER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GITHUB', 'GITLAB', 'STACKOVERFLOW', 'LEETCODE', 'LINKEDIN', 'X', 'WEBSITE', 'ONCHAIN');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('DISCOVERED', 'CLAIMED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ConsentScope" AS ENUM ('PUBLIC_INGEST', 'PROFILE_DISPLAY', 'CONTACT', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('GRANTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ArtifactKind" AS ENUM ('PROJECT', 'REPO', 'WRITEUP', 'REVIEW', 'CREDENTIAL');

-- CreateEnum
CREATE TYPE "PlacementOutcome" AS ENUM ('INTRODUCED', 'INTERVIEWING', 'HIRED', 'DECLINED', 'LEFT_EARLY', 'STUCK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'RECRUITER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "claimedProfileId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "TalentProfile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT,
    "headline" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "avatarUrl" TEXT,
    "websiteUrl" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'DISCOVERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "origin" TEXT,
    "latestOverall" DOUBLE PRECISION,
    "latestConfidence" DOUBLE PRECISION,
    "latestScoredAt" TIMESTAMP(3),

    CONSTRAINT "TalentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "source" "SourceType" NOT NULL,
    "externalId" TEXT,
    "username" TEXT NOT NULL,
    "url" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "scopes" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalSnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "source" "SourceType",
    "signals" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignalSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "overall" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "weightsUsed" JSONB NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "source" "SourceType" NOT NULL DEFAULT 'GITHUB',
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "isFork" BOOLEAN NOT NULL DEFAULT false,
    "pushedAt" TIMESTAMP(3),

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "scope" "ConsentScope" NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'GRANTED',
    "source" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "kind" "ArtifactKind" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "issuer" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "closesStat" TEXT,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "slot" TEXT,
    "outcome" "PlacementOutcome" NOT NULL DEFAULT 'INTRODUCED',
    "predictedFit" DOUBLE PRECISION,
    "predictedOverall" DOUBLE PRECISION,
    "modelVersion" TEXT,
    "feeAmount" INTEGER,
    "feeCurrency" TEXT DEFAULT 'USD',
    "introducedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileTag" (
    "profileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ProfileTag_pkey" PRIMARY KEY ("profileId","tagId")
);

-- CreateTable
CREATE TABLE "Spotlight" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spotlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistEntry" (
    "watchlistId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "note" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistEntry_pkey" PRIMARY KEY ("watchlistId","profileId")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_claimedProfileId_key" ON "User"("claimedProfileId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "TalentProfile_handle_key" ON "TalentProfile"("handle");

-- CreateIndex
CREATE INDEX "TalentProfile_latestOverall_idx" ON "TalentProfile"("latestOverall");

-- CreateIndex
CREATE INDEX "TalentProfile_status_idx" ON "TalentProfile"("status");

-- CreateIndex
CREATE INDEX "TalentProfile_location_idx" ON "TalentProfile"("location");

-- CreateIndex
CREATE INDEX "TalentProfile_origin_idx" ON "TalentProfile"("origin");

-- CreateIndex
CREATE INDEX "ConnectedAccount_profileId_idx" ON "ConnectedAccount"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_source_username_key" ON "ConnectedAccount"("source", "username");

-- CreateIndex
CREATE INDEX "SignalSnapshot_profileId_capturedAt_idx" ON "SignalSnapshot"("profileId", "capturedAt");

-- CreateIndex
CREATE INDEX "Score_profileId_computedAt_idx" ON "Score"("profileId", "computedAt");

-- CreateIndex
CREATE INDEX "Score_overall_idx" ON "Score"("overall");

-- CreateIndex
CREATE INDEX "Repository_profileId_idx" ON "Repository"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_profileId_source_name_key" ON "Repository"("profileId", "source", "name");

-- CreateIndex
CREATE INDEX "ConsentRecord_profileId_scope_idx" ON "ConsentRecord"("profileId", "scope");

-- CreateIndex
CREATE INDEX "Artifact_profileId_createdAt_idx" ON "Artifact"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "Artifact_verified_idx" ON "Artifact"("verified");

-- CreateIndex
CREATE INDEX "Placement_profileId_introducedAt_idx" ON "Placement"("profileId", "introducedAt");

-- CreateIndex
CREATE INDEX "Placement_outcome_idx" ON "Placement"("outcome");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Spotlight_featured_idx" ON "Spotlight"("featured");

-- CreateIndex
CREATE INDEX "Watchlist_ownerId_idx" ON "Watchlist"("ownerId");

-- CreateIndex
CREATE INDEX "WatchlistEntry_profileId_idx" ON "WatchlistEntry"("profileId");

-- CreateIndex
CREATE INDEX "SavedSearch_ownerId_idx" ON "SavedSearch"("ownerId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_claimedProfileId_fkey" FOREIGN KEY ("claimedProfileId") REFERENCES "TalentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalSnapshot" ADD CONSTRAINT "SignalSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "SignalSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileTag" ADD CONSTRAINT "ProfileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spotlight" ADD CONSTRAINT "Spotlight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "Watchlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TalentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
