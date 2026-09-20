# Catalogue seed data

The CSV in this directory is the local seed source for PhoneDB. It is used to
populate a disposable MySQL database through the transactional seeder.

The application does not treat this file as a live source of truth. Replacing
it requires a review of column names, parser behavior, duplicate keys, and
numeric/date values before running a full seed.
