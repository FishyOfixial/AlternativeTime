INSERT INTO auth_user (
    id,
    password,
    last_login,
    is_superuser,
    username,
    first_name,
    last_name,
    email,
    is_staff,
    is_active,
    date_joined
) VALUES (
    1,
    'pbkdf2_sha256$1200000$qrK0msQ7bqR2n5LZjk1T64$V7cEPGbdj4bckYpRqFbQ9uER8z7bn8VjIdXr0j50MD4=',
    NULL,
    1,
    'devadmin',
    'Dev',
    'Admin',
    'devadmin@example.com',
    1,
    1,
    '2026-03-26 01:45:17.744336'
);
