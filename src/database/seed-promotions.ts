import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { PromotionType } from '../modules/promotions/entities/promotion-type.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: Number(process.env['DB_PORT'] ?? 5432),
  username: process.env['DB_USERNAME'],
  password: process.env['DB_PASSWORD'],
  database: process.env['DB_NAME'],
  entities: [PromotionType],
  synchronize: true,
});

const PROMOTION_TYPES: Partial<PromotionType>[] = [
  {
    name: 'Featured Ad',
    nameAr: 'إعلان مميز',
    code: 'featured',
    description: 'Appear at top of search results',
    descriptionAr: 'يظهر في أعلى نتائج البحث',
    price: '50.00',
    durationDays: 7,
    sortOrder: 1,
  },
  {
    name: 'Golden Ad',
    nameAr: 'إعلان ذهبي',
    code: 'golden',
    description: 'Always visible golden listing, unaffected by search filters',
    descriptionAr: 'إعلان ذهبي دائم الظهور بغض النظر عن فلاتر البحث',
    price: '150.00',
    durationDays: 30,
    sortOrder: 2,
  },
  {
    name: 'Buyers Alert',
    nameAr: 'تنبيه المشترين',
    code: 'buyers_alert',
    description: 'Notify users searching for similar properties',
    descriptionAr: 'إشعار المستخدمين الباحثين عن عقارات مشابهة',
    price: '75.00',
    durationDays: 14,
    sortOrder: 3,
  },
  {
    name: 'Social Media',
    nameAr: 'سوشيال ميديا',
    code: 'social_media',
    description: 'Promoted on Aqar social media accounts',
    descriptionAr: 'ترويج على حسابات أقار في وسائل التواصل الاجتماعي',
    price: '300.00',
    durationDays: 7,
    sortOrder: 4,
  },
];

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(PromotionType);

  const count = await repo.count();
  if (count > 0) {
    console.log(`⚠️  Promotion types already seeded (${count} records). Skipping.`);
    await dataSource.destroy();
    return;
  }

  await repo.save(repo.create(PROMOTION_TYPES));
  console.log(`✅ Seeded ${PROMOTION_TYPES.length} promotion types.`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
