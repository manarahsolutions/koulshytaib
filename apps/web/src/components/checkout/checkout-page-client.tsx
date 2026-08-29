"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { Field, fieldDescribedBy } from "@/components/checkout/field";
import { FormSection } from "@/components/checkout/form-section";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Radio } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  selectCartSubtotal,
  useCartStore,
} from "@/features/cart/cart-store";
import { useCartHydrated } from "@/features/cart/use-cart-hydrated";
import { IRAQ_GOVERNORATES } from "@/features/checkout/governorates";
import {
  normalizeIraqiPhone,
  sanitizePhoneInput,
} from "@/lib/format/phone";
import {
  calcCheckoutTotals,
  DELIVERY_FEE_IQD,
} from "@/features/checkout/pricing";
import {
  databaseStatusAction,
  placeGuestOrderAction,
} from "@/app/actions/backend";
import {
  placeGuestOrder,
  saveActiveOrder,
} from "@/features/orders/order-store";
import { getProductById } from "@/features/products/product-repository";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";
import type {
  CheckoutData,
  OrderLineSnapshot,
  PaymentMethodId,
} from "@/types/order";

type FormValues = {
  name: string;
  phone: string;
  governorate: string;
  area: string;
  address: string;
  landmark: string;
  deliveryNotes: string;
  paymentMethod: PaymentMethodId;
};

type FieldKey = keyof Omit<FormValues, "landmark" | "deliveryNotes">;

type FormErrors = Partial<Record<FieldKey, string>> & {
  form?: string;
};

const INITIAL: FormValues = {
  name: "",
  phone: "",
  governorate: "",
  area: "",
  address: "",
  landmark: "",
  deliveryNotes: "",
  paymentMethod: "cash",
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "اكتب اسمك";
  }

  if (!normalizeIraqiPhone(values.phone)) {
    errors.phone = "تأكد من رقم الهاتف";
  }

  if (!values.governorate) {
    errors.governorate = "اختار المحافظة";
  }

  if (!values.area.trim()) {
    errors.area = "اكتب المنطقة";
  }

  if (!values.address.trim()) {
    errors.address = "اكتب عنوان التوصيل";
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = "اختار طريقة الدفع";
  }

  return errors;
}

const FIELD_ORDER: FieldKey[] = [
  "name",
  "phone",
  "governorate",
  "area",
  "address",
  "paymentMethod",
];

export function CheckoutPageClient() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const formId = useId();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const governorateRef = useRef<HTMLSelectElement>(null);
  const areaRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const paymentRef = useRef<HTMLInputElement>(null);

  const lines = useMemo((): OrderLineSnapshot[] => {
    return items.flatMap((item) => {
      const product = getProductById(item.productId);
      if (!product) return [];
      return [
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
          notes: item.notes,
        },
      ];
    });
  }, [items]);

  const totals = calcCheckoutTotals(subtotal, DELIVERY_FEE_IQD);

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      if (touchedSubmit) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[key as FieldKey];
          delete next.form;
          return next;
        });
      }
    },
    [touchedSubmit],
  );

  const focusFirstInvalid = useCallback((errs: FormErrors) => {
    for (const key of FIELD_ORDER) {
      if (!errs[key]) continue;
      const map = {
        name: nameRef,
        phone: phoneRef,
        governorate: governorateRef,
        area: areaRef,
        address: addressRef,
        paymentMethod: paymentRef,
      } as const;
      map[key].current?.focus();
      return;
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setTouchedSubmit(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    const phone = normalizeIraqiPhone(values.phone);
    if (!phone) {
      setErrors({ phone: "تأكد من رقم الهاتف" });
      phoneRef.current?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const checkout: CheckoutData = {
        customer: {
          name: values.name.trim(),
          phone,
        },
        delivery: {
          governorate: values.governorate,
          area: values.area.trim(),
          address: values.address.trim(),
          landmark: values.landmark.trim() || undefined,
          notes: values.deliveryNotes.trim() || undefined,
        },
        paymentMethod: values.paymentMethod,
      };

      const cartLines = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      }));

      const dbStatus = await databaseStatusAction();
      if (dbStatus.configured) {
        const result = await placeGuestOrderAction({
          customer: checkout.customer,
          delivery: checkout.delivery,
          paymentMethod: checkout.paymentMethod,
          items: cartLines,
        });
        if (!result.ok) {
          setErrors({ form: result.message });
          setSubmitting(false);
          return;
        }
        saveActiveOrder(result.data);
      } else {
        placeGuestOrder({
          customer: checkout.customer,
          delivery: checkout.delivery,
          paymentMethod: checkout.paymentMethod,
          items: lines,
          pricing: totals,
        });
      }

      clearCart();
      router.push("/orders/success");
    } catch {
      setErrors({ form: "صار خطأ، حاول مرة ثانية." });
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <PageContainer width="narrow" className="py-10">
        <div
          className="h-40 animate-pulse rounded-lg bg-surface-warm"
          aria-hidden
        />
        <span className="sr-only">جارٍ تحميل السلة…</span>
      </PageContainer>
    );
  }

  if (items.length === 0) {
    return (
      <PageContainer width="narrow" className="py-10">
        <EmptyState
          icon={<ShoppingBag strokeWidth={ICON_STROKE.default} />}
          title="سلتك فاضية"
          description="رجع للمنيو واختار أكلتك، وبعدين كمّل الطلب من هنا."
          action={
            <Link
              href="/menu"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-2xl bg-brand-primary px-5 text-sm font-semibold text-on-primary",
                "hover:bg-brand-primary-hover",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
              )}
            >
              رجوع للمنيو
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const nameId = `${formId}-name`;
  const phoneId = `${formId}-phone`;
  const govId = `${formId}-governorate`;
  const areaId = `${formId}-area`;
  const addressId = `${formId}-address`;
  const landmarkId = `${formId}-landmark`;
  const notesId = `${formId}-notes`;
  const payId = `${formId}-pay-cash`;

  return (
    <div className="pb-28 lg:pb-10">
      <PageContainer width="wide" paddedY={false} className="pt-6 sm:pt-8">
        <div className="relative mb-5 max-w-xs">
          <DecorativeMotif
            variant="floral-divider"
            tone="navy"
            density="subtle"
            className="opacity-90"
          />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-brand-navy">
          أكمل طلبك
        </h1>
        <p className="typo-caption mt-1 text-text-muted">
          بس كم معلومة ونوصّلها لبابك.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start lg:gap-10">
          <form
            className="space-y-8"
            onSubmit={onSubmit}
            noValidate
            aria-describedby={errors.form ? `${formId}-form-error` : undefined}
          >
            <FormSection title="معلوماتك">
              <Field
                id={nameId}
                label="الاسم"
                required
                error={errors.name}
              >
                <Input
                  ref={nameRef}
                  id={nameId}
                  name="name"
                  autoComplete="name"
                  placeholder="اكتب اسمك"
                  value={values.name}
                  onChange={(e) => setField("name", e.target.value)}
                  invalid={Boolean(errors.name)}
                  aria-required
                  aria-describedby={fieldDescribedBy(nameId, errors.name)}
                />
              </Field>

              <Field
                id={phoneId}
                label="رقم الهاتف"
                required
                error={errors.phone}
              >
                <Input
                  ref={phoneRef}
                  id={phoneId}
                  name="tel"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="07xxxxxxxxx"
                  dir="ltr"
                  className="text-start"
                  value={values.phone}
                  onChange={(e) =>
                    setField("phone", sanitizePhoneInput(e.target.value))
                  }
                  invalid={Boolean(errors.phone)}
                  aria-required
                  aria-describedby={fieldDescribedBy(phoneId, errors.phone)}
                />
              </Field>
            </FormSection>

            <FormSection title="عنوان التوصيل">
              <Field
                id={govId}
                label="المحافظة"
                required
                error={errors.governorate}
              >
                <Select
                  ref={governorateRef}
                  id={govId}
                  name="address-level1"
                  autoComplete="address-level1"
                  value={values.governorate}
                  onChange={(e) => setField("governorate", e.target.value)}
                  invalid={Boolean(errors.governorate)}
                  aria-required
                  aria-describedby={fieldDescribedBy(
                    govId,
                    errors.governorate,
                  )}
                >
                  <option value="">اختار المحافظة</option>
                  {IRAQ_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                id={areaId}
                label="المنطقة"
                required
                error={errors.area}
              >
                <Input
                  ref={areaRef}
                  id={areaId}
                  name="address-level2"
                  autoComplete="off"
                  placeholder="مثلاً: المنصور"
                  value={values.area}
                  onChange={(e) => setField("area", e.target.value)}
                  invalid={Boolean(errors.area)}
                  aria-required
                  aria-describedby={fieldDescribedBy(areaId, errors.area)}
                />
              </Field>

              <Field
                id={addressId}
                label="العنوان"
                required
                error={errors.address}
              >
                <Textarea
                  ref={addressRef}
                  id={addressId}
                  name="street-address"
                  autoComplete="street-address"
                  rows={3}
                  placeholder="اسم الشارع، المحلة، رقم الدار..."
                  value={values.address}
                  onChange={(e) => setField("address", e.target.value)}
                  invalid={Boolean(errors.address)}
                  aria-required
                  aria-describedby={fieldDescribedBy(
                    addressId,
                    errors.address,
                  )}
                />
              </Field>

              <Field id={landmarkId} label="أقرب نقطة دالة" required={false}>
                <Input
                  id={landmarkId}
                  name="landmark"
                  autoComplete="off"
                  placeholder="مثلاً: قرب ..."
                  value={values.landmark}
                  onChange={(e) => setField("landmark", e.target.value)}
                />
              </Field>

              <Field
                id={notesId}
                label="ملاحظات التوصيل"
                required={false}
              >
                <Textarea
                  id={notesId}
                  name="delivery-notes"
                  autoComplete="off"
                  rows={3}
                  placeholder="أي ملاحظة تساعدنا نوصل لك أسرع"
                  value={values.deliveryNotes}
                  onChange={(e) => setField("deliveryNotes", e.target.value)}
                />
              </Field>
            </FormSection>

            <FormSection title="طريقة الدفع">
              <Radio
                ref={paymentRef}
                id={payId}
                name="paymentMethod"
                value="cash"
                checked={values.paymentMethod === "cash"}
                onChange={() => setField("paymentMethod", "cash")}
                label="الدفع عند الاستلام"
                description="ادفع عند استلام طلبك"
                required
              />
              {errors.paymentMethod ? (
                <p className="typo-caption text-danger" role="alert">
                  {errors.paymentMethod}
                </p>
              ) : null}
            </FormSection>

            <div className="lg:hidden">
              <OrderSummary
                lines={lines}
                subtotal={totals.subtotal}
                deliveryFee={totals.deliveryFee}
              />
            </div>

            {errors.form ? (
              <p
                id={`${formId}-form-error`}
                className="rounded-lg border border-danger/30 bg-surface-warm px-3 py-2 text-sm text-danger"
                role="alert"
              >
                {errors.form}
                <span className="mt-2 block">
                  <Link
                    href="/cart"
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    رجوع للسلة
                  </Link>
                </span>
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full sm:w-auto sm:min-w-[12rem]"
            >
              تأكيد الطلب
            </Button>
          </form>

          <div className="hidden lg:block">
            <OrderSummary
              lines={lines}
              subtotal={totals.subtotal}
              deliveryFee={totals.deliveryFee}
              sticky
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
