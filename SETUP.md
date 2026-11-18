# Як запустити вішліст

Сайт: Next.js на Vercel, база й акаунти в Supabase, листи через Brevo. Усе безкоштовно.
Іди по кроках згори вниз. Паролі та ключі вставляєш ти сам, у код вони не потрапляють.

---

## 1. Brevo для листів

Безкоштовний тариф Brevo: 300 листів на день.

1. Зареєструйся на **brevo.com** (Sign up free) і підтверди пошту. Анкету про компанію заповни як завгодно, тариф обери **Free**.
2. **Відправник:** відкрий **Senders, Domains & Dedicated IPs → Senders → Add a sender**:
   - From name: `Вішліст до Миколая`
   - From email: твоя пошта, з якої йтимуть листи
   Brevo надішле на неї лист із кодом або кнопкою, підтверди.
3. **SMTP-ключ:** відкрий **SMTP & API → вкладка SMTP → Generate a new SMTP key**, назви його `vishlist` і скопіюй ключ. Він показується один раз.
4. На тій самій вкладці збережи дані:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: щось на кшталт `9a1b2c001@smtp-brevo.com`
   - Password: ключ із попереднього пункту

Листи з адреси на `@gmail.com` інколи потрапляють у «Спам», бо Gmail не любить, коли від його імені пишуть інші сервіси. Якщо таке буде, порадь людям глянути в «Спам» або згодом підключи в Brevo власний домен.

## 2. Supabase: база й акаунти

1. Зареєструйся на **supabase.com** і створи новий проєкт (New project). Регіон обери найближчий, наприклад Central EU (Frankfurt).
2. **Таблиці:** відкрий **SQL Editor → New query**, встав увесь вміст файлу `supabase/schema.sql` і натисни **Run**. Мають з'явитися таблиці `gifts`, `profiles`, `reservations` і три подарунки.
3. **Ключі:** відкрий **Project Settings → API** (або кнопку **Connect**) і скопіюй:
   - `Project URL`, це `NEXT_PUBLIC_SUPABASE_URL`;
   - `publishable` key (або старий `anon`), це `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. **Підтвердження пошти:** у **Authentication → Sign In / Providers → Email** має бути увімкнено **Confirm email**. Зазвичай воно ввімкнене за замовчуванням.
5. **Відправка листів через Brevo:** відкрий **Authentication → Emails → SMTP Settings**, увімкни **Enable custom SMTP** і заповни:
   - Sender email: підтверджена в Brevo адреса відправника
   - Sender name: `Вішліст до Миколая`
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: Login із Brevo (`...@smtp-brevo.com`)
   - Password: SMTP-ключ із Brevo
6. **Шаблони листів:** в **Authentication → Emails → Templates** заміни два шаблони.

   **Confirm signup**

   Тема: `Підтверди реєстрацію у вішлісті`

   ```html
   <h2>Привіт!</h2>
   <p>Натисни кнопку, щоб підтвердити пошту і бронювати подарунки:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/">Підтвердити пошту</a></p>
   <p>Якщо ти не реєструвався(-лась), просто ігноруй цей лист.</p>
   ```

   **Reset password**

   Тема: `Новий пароль для вішліста`

   ```html
   <h2>Скидання пароля</h2>
   <p>Натисни кнопку, щоб задати новий пароль:</p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Задати новий пароль</a></p>
   <p>Якщо ти не просив(-ла) новий пароль, просто ігноруй цей лист.</p>
   ```

7. **Адреса сайту:** **Authentication → URL Configuration**. Поки сайт працює лише на комп'ютері, вкажи **Site URL** `http://localhost:3000`. Після кроку 5 заміниш на адресу з Vercel.

## 3. Запуск на комп'ютері

1. Скопіюй файл `.env.example` у новий файл `.env.local` у цій самій папці.
2. Заповни його: два ключі Supabase, `SMTP_USER` (Login із Brevo), `SMTP_PASSWORD` (SMTP-ключ) і `MAIL_FROM` (підтверджена адреса відправника). `SMTP_HOST`, `SMTP_PORT` і `NEXT_PUBLIC_SITE_URL` залиш як є.
3. У терміналі в папці проєкту:

   ```bash
   npm run dev
   ```

4. Відкрий http://localhost:3000, зареєструйся, підтверди пошту і спробуй забронювати подарунок.

## 4. GitHub і Vercel

1. Створи акаунт на **github.com** і новий **приватний** репозиторій, наприклад `mykolai-wishlist`, без README.
2. У терміналі в папці проєкту (замість `ТВІЙ-НІК` підстав свій нік на GitHub):

   ```bash
   git init
   ```

   ```bash
   git add .
   ```

   ```bash
   git commit -m "Вішліст до Миколая"
   ```

   ```bash
   git branch -M main
   ```

   ```bash
   git remote add origin https://github.com/ТВІЙ-НІК/mykolai-wishlist.git
   ```

   ```bash
   git push -u origin main
   ```

   Файл `.env.local` на GitHub не потрапить, він у `.gitignore`.
3. Зайди на **vercel.com** через GitHub і натисни **Add New → Project**, потім обери репозиторій.
4. Перед **Deploy** відкрий **Environment Variables** і додай усі змінні з `.env.local`. `NEXT_PUBLIC_SITE_URL` поки можна не додавати.
5. Натисни **Deploy**. Vercel дасть адресу на кшталт `https://mykolai-wishlist.vercel.app`.

## 5. Після першого деплою

1. На Vercel додай або зміни `NEXT_PUBLIC_SITE_URL` на свою адресу Vercel, потім **Deployments → … → Redeploy**.
2. У Supabase **Authentication → URL Configuration**:
   - **Site URL**: адреса з Vercel;
   - **Redirect URLs**: додай `https://ТВОЯ-АДРЕСА.vercel.app/**` і `http://localhost:3000/**`.
3. Перевір реєстрацію і бронювання вже на живому сайті та кинь посилання друзям.

---

## Як додати новий подарунок

1. Поклади фото в `public/gifts/`, наприклад `public/gifts/headphones.jpg`.
2. У Supabase **SQL Editor** виконай (заміни значення на свої):

   ```sql
   insert into public.gifts (id, title, subtitle, specs, price_uah, image_url, shop_url, shop_name, sort)
   values ('headphones', 'Назва', 'Короткий підпис',
           array['Характеристика 1', 'Характеристика 2'],
           3500, '/gifts/headphones.jpg', 'https://посилання-на-магазин', 'Магазин', 4);
   ```

3. Відправ фото на GitHub (`git add .`, `git commit -m "Новий подарунок"`, `git push`), і Vercel оновить сайт сам.

Можна просто написати мені, що додати, і я зроблю це за тебе.

## Хто що забронював

Supabase → **Table Editor → reservations**. Там видно подарунок і `user_id`. Ім'я є в таблиці `profiles`, пошта в **Authentication → Users**. Зняти чужу бронь можна, видаливши рядок у `reservations`.
