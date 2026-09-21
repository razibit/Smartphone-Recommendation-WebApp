# Catalogue seed data

[`phones.csv`](phones.csv) is the checked-in seed snapshot for PhoneDB. It is
used to populate a disposable local MySQL database through the transactional
CSV seeder in `mobile-phone-app/backend/database/seeders/csvSeeder.ts`.

The snapshot contains 4,144 rows, 72 columns, and 77 distinct brand labels at
the time of this repository review. It includes source-oriented fields such as
`detail_url`, `image_url`, and `scraped_at`, reflecting a collection assembled
from publicly available web information. The intended collection window was
2012–2025, but the file also contains a small number of older, future-dated,
and non-standard release-date values. Do not treat the snapshot as a complete,
current market inventory.

The original collection crawler is not included in this repository. Replacing
the CSV requires review of column names, parser behavior, duplicate keys,
source URLs, and numeric/date values before running a full seed. The application
does not treat the file as a live source of truth.
