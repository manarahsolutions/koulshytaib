"use client";

import { useId, useState, type FormEvent } from "react";
import {
  createAdminAccountAction,
  listAdminsAction,
  setAdminActiveAction,
  updateAdminRoleAction,
  updateRestaurantSettingsAction,
} from "@/app/actions/backend";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/ui/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminRole, AdminUser } from "@/features/admin-auth/types";
import { ADMIN_ROLE_LABELS } from "@/features/admin-auth/types";
import type { RestaurantSettings } from "@/features/settings/types";

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-text">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AdminSettingsClient({
  initialSettings,
  initialAdmins,
}: {
  initialSettings: RestaurantSettings;
  initialAdmins: AdminUser[];
}) {
  const formId = useId();
  const [settings, setSettings] = useState(initialSettings);
  const [admins, setAdmins] = useState(initialAdmins);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [newId, setNewId] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState<AdminRole>("STAFF");

  const saveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const result = await updateRestaurantSettingsAction({
        displayName: settings.displayName,
        kitchenPhone: settings.kitchenPhone,
        kitchenWhatsappE164: settings.kitchenWhatsappE164,
        hoursText: settings.hoursText,
        deliveryFeeIqd: settings.deliveryFeeIqd,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSettings(result.data);
      setOkMsg("تم حفظ إعدادات المطعم");
    } finally {
      setBusy(false);
    }
  };

  const refreshAdmins = async () => {
    const result = await listAdminsAction();
    if (result.ok) setAdmins(result.data);
  };

  const createAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOkMsg(null);
    try {
      const result = await createAdminAccountAction({
        identifier: newId,
        password: newPass,
        role: newRole,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setNewId("");
      setNewPass("");
      setNewRole("STAFF");
      await refreshAdmins();
      setOkMsg("تم إنشاء حساب الأدمن");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="الإعدادات"
        description="معلومات المطعم، رسوم التوصيل، وساعات العمل — للمالك فقط."
      />

      {error ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger-subtle px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {okMsg ? (
        <p
          className="rounded-lg border border-success/30 bg-success-subtle px-3 py-2 text-sm text-success"
          role="status"
        >
          {okMsg}
        </p>
      ) : null}

      <AdminPanel>
        <form onSubmit={(e) => void saveSettings(e)} className="space-y-3">
          <h2 className="text-base font-semibold text-brand-navy">
            المطعم والتوصيل
          </h2>
          <Field id={`${formId}-name`} label="اسم العرض">
            <Input
              id={`${formId}-name`}
              value={settings.displayName}
              onChange={(e) =>
                setSettings((s) => ({ ...s, displayName: e.target.value }))
              }
            />
          </Field>
          <Field id={`${formId}-phone`} label="هاتف المطبخ">
            <Input
              id={`${formId}-phone`}
              value={settings.kitchenPhone}
              onChange={(e) =>
                setSettings((s) => ({ ...s, kitchenPhone: e.target.value }))
              }
              dir="ltr"
            />
          </Field>
          <Field
            id={`${formId}-wa`}
            label="واتساب المطبخ (E.164 بدون +، مثل 9647…)"
          >
            <Input
              id={`${formId}-wa`}
              value={settings.kitchenWhatsappE164}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  kitchenWhatsappE164: e.target.value,
                }))
              }
              dir="ltr"
            />
          </Field>
          <Field id={`${formId}-hours`} label="ساعات العمل">
            <Input
              id={`${formId}-hours`}
              value={settings.hoursText}
              onChange={(e) =>
                setSettings((s) => ({ ...s, hoursText: e.target.value }))
              }
            />
          </Field>
          <Field
            id={`${formId}-fee`}
            label="رسوم التوصيل داخل الفلوجة (دينار)"
          >
            <Input
              id={`${formId}-fee`}
              type="number"
              min={0}
              value={String(settings.deliveryFeeIqd)}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  deliveryFeeIqd: Number(e.target.value) || 0,
                }))
              }
              dir="ltr"
            />
          </Field>
          <Button type="submit" loading={busy}>
            حفظ الإعدادات
          </Button>
        </form>
      </AdminPanel>

      <AdminPanel>
        <form onSubmit={(e) => void createAdmin(e)} className="space-y-3">
          <h2 className="text-base font-semibold text-brand-navy">
            حساب أدمن جديد
          </h2>
          <Field id={`${formId}-adm-id`} label="المعرّف (إيميل أو اسم مستخدم)">
            <Input
              id={`${formId}-adm-id`}
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              autoComplete="off"
              dir="ltr"
            />
          </Field>
          <Field id={`${formId}-adm-pass`} label="كلمة المرور">
            <Input
              id={`${formId}-adm-pass`}
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              autoComplete="new-password"
              dir="ltr"
            />
          </Field>
          <Field id={`${formId}-adm-role`} label="الدور">
            <Select
              id={`${formId}-adm-role`}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminRole)}
            >
              <option value="STAFF">موظف</option>
              <option value="MANAGER">مدير تشغيل</option>
              <option value="OWNER">مالك</option>
            </Select>
          </Field>
          <Button type="submit" loading={busy} variant="secondary">
            إنشاء حساب
          </Button>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-start text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-2 py-2 font-medium">المعرّف</th>
                <th className="px-2 py-2 font-medium">الدور</th>
                <th className="px-2 py-2 font-medium">الحالة</th>
                <th className="px-2 py-2 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-border-soft">
                  <td className="px-2 py-2" dir="ltr">
                    {a.identifier}
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className="rounded-md border border-border bg-surface px-2 py-1"
                      value={a.role}
                      aria-label={`دور ${a.identifier}`}
                      onChange={(e) => {
                        void (async () => {
                          setError(null);
                          const result = await updateAdminRoleAction(
                            a.id,
                            e.target.value as AdminRole,
                          );
                          if (!result.ok) setError(result.message);
                          else await refreshAdmins();
                        })();
                      }}
                    >
                      <option value="STAFF">{ADMIN_ROLE_LABELS.STAFF}</option>
                      <option value="MANAGER">
                        {ADMIN_ROLE_LABELS.MANAGER}
                      </option>
                      <option value="OWNER">{ADMIN_ROLE_LABELS.OWNER}</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    {a.isActive ? "نشط" : "معطّل"}
                  </td>
                  <td className="px-2 py-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        void (async () => {
                          setError(null);
                          const result = await setAdminActiveAction(
                            a.id,
                            !a.isActive,
                          );
                          if (!result.ok) setError(result.message);
                          else await refreshAdmins();
                        })();
                      }}
                    >
                      {a.isActive ? "تعطيل" : "تفعيل"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
