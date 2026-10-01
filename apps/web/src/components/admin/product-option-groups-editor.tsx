"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  Product,
  ProductOptionGroupDraft,
} from "@/types/catalog";
import { createOpaqueId } from "@/lib/id";

function emptyOption(sortOrder: number) {
  return {
    clientKey: createOpaqueId("tmp"),
    name: "",
    priceDelta: 0,
    available: true,
    sortOrder,
  };
}

function emptyGroup(sortOrder: number): ProductOptionGroupDraft {
  return {
    clientKey: createOpaqueId("tmp"),
    name: "",
    selection: "SINGLE",
    required: true,
    sortOrder,
    options: [emptyOption(1), emptyOption(2)],
  };
}

export function groupsFromProduct(
  product?: Product,
): ProductOptionGroupDraft[] {
  return (product?.optionGroups ?? []).map((g, gIndex) => ({
    clientKey: g.id,
    id: g.id,
    name: g.name,
    selection: g.selection,
    required: g.required,
    minSelect: g.minSelect,
    maxSelect: g.maxSelect,
    sortOrder: g.sortOrder ?? gIndex + 1,
    options: g.options.map((o, oIndex) => ({
      clientKey: o.id,
      id: o.id,
      name: o.name,
      priceDelta: o.priceDelta,
      available: o.available,
      sortOrder: o.sortOrder ?? oIndex + 1,
    })),
  }));
}

export type ProductOptionGroupsEditorProps = {
  groups: ProductOptionGroupDraft[];
  onChange: (groups: ProductOptionGroupDraft[]) => void;
};

export function ProductOptionGroupsEditor({
  groups,
  onChange,
}: ProductOptionGroupsEditorProps) {
  const updateGroup = (
    clientKey: string,
    patch: Partial<ProductOptionGroupDraft>,
  ) => {
    onChange(
      groups.map((g) => (g.clientKey === clientKey ? { ...g, ...patch } : g)),
    );
  };

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface-elevated p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">
            المتغيرات والخيارات
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            مقاس، تفضيلات، إضافات… مع فرق سعر لكل خيار (موجب أو صفر أو سالب).
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          startIcon={<Plus />}
          onClick={() =>
            onChange([...groups, emptyGroup(groups.length + 1)])
          }
        >
          إضافة مجموعة
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-text-muted">
          ماكو مجموعات بعد — المنتج يبقى بسعر أساسي فقط.
        </p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group, gIndex) => (
            <li
              key={group.clientKey}
              className="space-y-3 rounded-lg border border-border-soft bg-background p-3"
            >
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[10rem] flex-1">
                  <label className="typo-label text-text">
                    اسم المجموعة
                  </label>
                  <Input
                    className="mt-1.5"
                    value={group.name}
                    placeholder="مثلاً: المقاس"
                    onChange={(e) =>
                      updateGroup(group.clientKey, { name: e.target.value })
                    }
                  />
                </div>
                <div className="w-36">
                  <label className="typo-label text-text">نوع الاختيار</label>
                  <Select
                    className="mt-1.5"
                    value={group.selection}
                    onChange={(e) =>
                      updateGroup(group.clientKey, {
                        selection:
                          e.target.value === "MULTI" ? "MULTI" : "SINGLE",
                      })
                    }
                  >
                    <option value="SINGLE">واحد فقط</option>
                    <option value="MULTI">متعدد</option>
                  </Select>
                </div>
                <Checkbox
                  id={`group-req-${group.clientKey}`}
                  checked={group.required}
                  onChange={(e) =>
                    updateGroup(group.clientKey, {
                      required: e.target.checked,
                    })
                  }
                  label="إجباري"
                />
                <IconButton
                  type="button"
                  aria-label={`حذف مجموعة ${group.name || gIndex + 1}`}
                  icon={<Trash2 />}
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onChange(groups.filter((g) => g.clientKey !== group.clientKey))
                  }
                />
              </div>

              <ul className="space-y-2">
                {group.options.map((option, oIndex) => (
                  <li
                    key={option.clientKey}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <div className="min-w-[8rem] flex-1">
                      <label className="typo-label text-text">الخيار</label>
                      <Input
                        className="mt-1.5"
                        value={option.name}
                        placeholder="مثلاً: كبير"
                        onChange={(e) =>
                          updateGroup(group.clientKey, {
                            options: group.options.map((o) =>
                              o.clientKey === option.clientKey
                                ? { ...o, name: e.target.value }
                                : o,
                            ),
                          })
                        }
                      />
                    </div>
                    <div className="w-32">
                      <label className="typo-label text-text">فرق السعر</label>
                      <Input
                        className="mt-1.5"
                        inputMode="numeric"
                        dir="ltr"
                        value={String(option.priceDelta)}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          updateGroup(group.clientKey, {
                            options: group.options.map((o) =>
                              o.clientKey === option.clientKey
                                ? {
                                    ...o,
                                    priceDelta: Number.isFinite(n)
                                      ? Math.trunc(n)
                                      : 0,
                                  }
                                : o,
                            ),
                          });
                        }}
                      />
                    </div>
                    <Checkbox
                      id={`opt-av-${option.clientKey}`}
                      checked={option.available}
                      onChange={(e) =>
                        updateGroup(group.clientKey, {
                          options: group.options.map((o) =>
                            o.clientKey === option.clientKey
                              ? { ...o, available: e.target.checked }
                              : o,
                          ),
                        })
                      }
                      label="متوفر"
                    />
                    <IconButton
                      type="button"
                      aria-label={`حذف خيار ${option.name || oIndex + 1}`}
                      icon={<Trash2 />}
                      size="sm"
                      variant="ghost"
                      disabled={group.options.length <= 1}
                      onClick={() =>
                        updateGroup(group.clientKey, {
                          options: group.options.filter(
                            (o) => o.clientKey !== option.clientKey,
                          ),
                        })
                      }
                    />
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                size="sm"
                variant="outline"
                startIcon={<Plus />}
                onClick={() =>
                  updateGroup(group.clientKey, {
                    options: [
                      ...group.options,
                      emptyOption(group.options.length + 1),
                    ],
                  })
                }
              >
                إضافة خيار
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
