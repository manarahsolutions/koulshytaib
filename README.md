# كلشي طيب (Koulshy Taib)

منصة توصيل أكل بيتي — **توصيل فقط**، طلب كضيف (بدون تسجيل زبون).

## هيكل المستودع (Frontend / Backend)

```
taib/
├── apps/web/              ← الفرونت إند (Next.js: واجهة الزبون + الأدمن)
├── packages/database/     ← الباكند / طبقة البيانات (Prisma + PostgreSQL)
├── docs/                  ← توثيق المنتج والنشر
└── scripts/               ← أدوات محلية (Postgres)
```

| الجزء | الحزمة | المحتوى |
|--------|--------|---------|
| Frontend | `@koulshy/web` | الصفحات، المكوّنات، Server Actions، التصميم |
| Backend (data) | `@koulshy/database` | `schema.prisma`، migrations، seed |

منطق الأعمال (repositories / services) يعيش مع الفرونت حالياً ويستدعي Prisma مباشرة عبر Server Actions — مناسب لتطبيق Next موحّد النشر.

## التشغيل المحلي

```bash
cp .env.example .env
# عبّئ DATABASE_URL و ADMIN_SESSION_SECRET

npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

- الموقع: [http://localhost:3000](http://localhost:3000)
- الأدمن: [http://localhost:3000/admin](http://localhost:3000/admin)

## السكربتات

| أمر | الوظيفة |
|-----|---------|
| `npm run dev` | تشغيل الفرونت |
| `npm run build` / `start` | بناء وتشغيل الإنتاج |
| `npm run db:migrate` | ترحيلات قاعدة البيانات |
| `npm run db:seed` | بيانات تجريبية |
| `npm run typecheck` / `lint` | فحص |

## النشر على الإنترنت

راجع الدليل الكامل: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** (Vercel + PostgreSQL).
