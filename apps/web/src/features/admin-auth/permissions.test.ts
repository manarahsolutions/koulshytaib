import { describe, expect, it } from "vitest";
import {
  canAccessAdminPath,
  canDeleteSensitive,
  canManageAdmins,
  canManageBeyondFloor,
  canManageSettings,
  canOperate,
  CASHIER_HOME_HREF,
  MANAGER_ONLY,
  OPERATE_ROLES,
} from "./permissions";

describe("admin permissions", () => {
  it("allows both roles to operate at floor level", () => {
    expect(canOperate("CASHIER")).toBe(true);
    expect(canOperate("MANAGER")).toBe(true);
    expect(OPERATE_ROLES).toEqual(["MANAGER", "CASHIER"]);
  });

  it("restricts settings/admins/delete/beyond-floor to MANAGER", () => {
    expect(canManageSettings("MANAGER")).toBe(true);
    expect(canManageSettings("CASHIER")).toBe(false);
    expect(canManageAdmins("MANAGER")).toBe(true);
    expect(canManageAdmins("CASHIER")).toBe(false);
    expect(canDeleteSensitive("MANAGER")).toBe(true);
    expect(canDeleteSensitive("CASHIER")).toBe(false);
    expect(canManageBeyondFloor("MANAGER")).toBe(true);
    expect(canManageBeyondFloor("CASHIER")).toBe(false);
    expect(MANAGER_ONLY).toEqual(["MANAGER"]);
  });

  it("limits cashier paths to orders and catalog products/categories", () => {
    expect(canAccessAdminPath("CASHIER", "/admin/orders")).toBe(true);
    expect(canAccessAdminPath("CASHIER", "/admin/orders/abc")).toBe(true);
    expect(canAccessAdminPath("CASHIER", "/admin/products")).toBe(true);
    expect(canAccessAdminPath("CASHIER", "/admin/products/new")).toBe(true);
    expect(canAccessAdminPath("CASHIER", "/admin/products/categories")).toBe(
      true,
    );
    expect(canAccessAdminPath("CASHIER", "/admin")).toBe(false);
    expect(canAccessAdminPath("CASHIER", "/admin/offers")).toBe(false);
    expect(canAccessAdminPath("CASHIER", "/admin/customers")).toBe(false);
    expect(canAccessAdminPath("CASHIER", "/admin/settings")).toBe(false);
    expect(canAccessAdminPath("MANAGER", "/admin/settings")).toBe(true);
    expect(CASHIER_HOME_HREF).toBe("/admin/orders");
  });
});
