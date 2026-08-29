import { PageContainer } from "@/components/layout/page-container";

/** Route placeholder — content ships in later phases. */
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <PageContainer width="narrow">
      <h1 className="typo-heading-m text-text">{title}</h1>
      <p className="typo-body-s mt-2 text-text-muted">
        محتوى الصفحة سيُبنى لاحقاً.
      </p>
    </PageContainer>
  );
}
