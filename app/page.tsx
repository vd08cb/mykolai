import Link from "next/link";
import { GiftCard } from "@/components/GiftCard";
import { loadWishlist } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const [{ welcome }, data] = await Promise.all([searchParams, loadWishlist()]);
  const { gifts, reservations, user, configured, error } = data;

  const takenCount = gifts.filter((g) => reservations.some((r) => r.gift_id === g.id)).length;
  const percent = gifts.length ? Math.round((takenCount / gifts.length) * 100) : 0;

  return (
    <main>
      <div className="wrap">
        <header className="topbar">
          <Link href="/" className="brand">
            Вішліст · 6 грудня
          </Link>
          <div className="account">
            {user ? (
              <>
                <span>
                  Ти увійшов(-ла) як <b>{user.name}</b>
                </span>
                <form action="/auth/signout" method="post">
                  <button className="btn btn-ghost btn-small" type="submit">
                    Вийти
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost btn-small" href="/login">
                  Увійти
                </Link>
                <Link className="btn btn-gold btn-small" href="/register">
                  Зареєструватися
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="hero">
          <p className="eyebrow">День святого Миколая</p>
          <h1>
            Мій вішліст до <em>святого Миколая</em>
          </h1>
          <p className="lead">
            Обери подарунок і забронюй його. Усі побачать, що він уже зайнятий, і ніхто не купить те саме двічі.
          </p>
          <div className="tally" aria-label={`Заброньовано ${takenCount} з ${gifts.length}`}>
            <span className="tally-count">
              Заброньовано <b>{takenCount}</b> з {gifts.length}
            </span>
            <span className="tally-bar" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </span>
          </div>
        </section>

        {(!configured || error || welcome) && (
          <div className="notices">
            {!configured && (
              <p className="notice">
                Це попередній перегляд: база даних ще не підключена, тому бронювати поки не можна. Інструкція з
                підключення лежить у файлі SETUP.md.
              </p>
            )}
            {error && <p className="notice error">Не вдалося завантажити дані з бази: {error}</p>}
            {welcome && user && (
              <p className="notice">Пошту підтверджено, {user.name}! Тепер можна бронювати подарунки.</p>
            )}
          </div>
        )}

        <section className="grid" aria-label="Подарунки">
          {gifts.map((gift, i) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              index={i + 1}
              reservation={reservations.find((r) => r.gift_id === gift.id) ?? null}
              currentUserId={user?.id ?? null}
              canReserve={configured}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
