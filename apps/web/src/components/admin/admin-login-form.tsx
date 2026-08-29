"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm() {
  const formId = useId();
  const router = useRouter();
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const identifierId = `${formId}-identifier`;
  const passwordId = `${formId}-password`;
  const formErrorId = `${formId}-error`;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const next: typeof fieldErrors = {};
    if (!identifier.trim()) next.identifier = "اكتب معرف الدخول";
    if (!password) next.password = "اكتب كلمة المرور";
    setFieldErrors(next);
    setFormError(null);

    if (Object.keys(next).length > 0) {
      if (next.identifier) identifierRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await loginAdminAction({
        identifier: identifier.trim(),
        password,
      });
      if (!result.ok) {
        setFormError(result.message);
        setPassword("");
        passwordRef.current?.focus();
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setFormError("تعذر تسجيل الدخول. تحقق من بياناتك وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4" noValidate>
      <div>
        <label htmlFor={identifierId} className="typo-label text-text">
          معرف الدخول
        </label>
        <Input
          ref={identifierRef}
          id={identifierId}
          name="identifier"
          type="text"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          invalid={Boolean(fieldErrors.identifier)}
          aria-describedby={
            fieldErrors.identifier ? `${identifierId}-err` : undefined
          }
          disabled={submitting}
          className="mt-1.5"
        />
        {fieldErrors.identifier ? (
          <p
            id={`${identifierId}-err`}
            className="mt-1.5 text-sm text-danger"
            role="alert"
          >
            {fieldErrors.identifier}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={passwordId} className="typo-label text-text">
          كلمة المرور
        </label>
        <Input
          ref={passwordRef}
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? `${passwordId}-err` : undefined
          }
          disabled={submitting}
          className="mt-1.5"
        />
        {fieldErrors.password ? (
          <p
            id={`${passwordId}-err`}
            className="mt-1.5 text-sm text-danger"
            role="alert"
          >
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p
          id={formErrorId}
          className="rounded-md border border-danger/30 bg-danger-subtle px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={submitting}
        className="w-full"
      >
        تسجيل الدخول
      </Button>
    </form>
  );
}
