/** Turns Supabase Auth error messages into plain Ukrainian. */
export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Неправильна пошта або пароль.";
  if (m.includes("email not confirmed")) return "Пошту ще не підтверджено. Відкрий лист від нас і натисни посилання.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Цю пошту вже зареєстровано. Спробуй увійти.";
  if (m.includes("password should be") || m.includes("password is too short"))
    return "Пароль має містити щонайменше 6 символів.";
  if (m.includes("same password") || m.includes("different from the old"))
    return "Новий пароль має відрізнятися від старого.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Забагато спроб за короткий час. Зачекай кілька хвилин і спробуй ще раз.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Перевір адресу пошти.";
  if (m.includes("auth session missing")) return "Посилання застаріло. Запроси новий лист для скидання пароля.";
  return `Щось пішло не так: ${message}`;
}
