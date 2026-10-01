-- Restrict admin roles to MANAGER (مدير) and CASHIER (كاشير).
-- OWNER → MANAGER, STAFF → CASHIER.

ALTER TABLE "AdminUser" ALTER COLUMN "role" DROP DEFAULT;

CREATE TYPE "AdminRole_new" AS ENUM ('MANAGER', 'CASHIER');

ALTER TABLE "AdminUser"
  ALTER COLUMN "role" TYPE "AdminRole_new"
  USING (
    CASE
      WHEN "role"::text = 'OWNER' THEN 'MANAGER'::"AdminRole_new"
      WHEN "role"::text = 'MANAGER' THEN 'MANAGER'::"AdminRole_new"
      WHEN "role"::text = 'STAFF' THEN 'CASHIER'::"AdminRole_new"
      ELSE 'CASHIER'::"AdminRole_new"
    END
  );

DROP TYPE "AdminRole";

ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";

ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'CASHIER'::"AdminRole";
