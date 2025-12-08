-- Delete existing admin user with incorrect password hash
DELETE FROM account WHERE "userId" IN (SELECT id FROM "user" WHERE email = 'abdimegersa14@gmail.com');
DELETE FROM "user" WHERE email = 'abdimegersa14@gmail.com';
