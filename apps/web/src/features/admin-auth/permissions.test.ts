import { describe, expect, it } from "vitest";
import {
  canDeleteSensitive,
  canManageAdmins,
  canManageSettings,
  canOperate,
  OPERATE_ROLES,
  OWNER_ONLY,
} from "@/features/admin-auth/permissions";

describe("admin permissions (1b)", () => {
  it("allows all roles to operate", () => {
    expect(canOperate("STAFF")).toBe(true);
    expect(canOperate("MANAGER")).toBe(true);
    expect(canOperate("OWNER")).toBe(true);
    expect(OPERATE_ROLES).toEqual(["OWNER", "MANAGER", "STAFF"]);
  });

  it("restricts settings/admins/delete to OWNER", () => {
    expect(canManageSettings("OWNER")).toBe(true);
    expect(canManageSettings("MANAGER")).toBe(false);
    expect(canManageSettings("STAFF")).toBe(false);
    expect(canManageAdmins("OWNER")).toBe(true);
    expect(canManageAdmins("STAFF")).toBe(false);
    expect(canDeleteSensitive("OWNER")).toBe(true);
    expect(canDeleteSensitive("MANAGER")).toBe(false);
    expect(OWNER_ONLY).toEqual(["OWNER"]);
  });
});
