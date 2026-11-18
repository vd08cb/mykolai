"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Gift, Reservation } from "@/lib/types";

type Props = {
  gift: Gift;
  index: number;
  reservation: Reservation | null;
  currentUserId: string | null;
  canReserve: boolean;
};

const priceFormat = new Intl.NumberFormat("uk-UA");

export function GiftCard({ gift, index, reservation, currentUserId, canReserve }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const isMine = Boolean(reservation && currentUserId && reservation.user_id === currentUserId);

  async function send(method: "POST" | "DELETE") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reserve", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: gift.id }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; emailSent?: boolean };
      if (!res.ok) {
        setMessage({ kind: "error", text: body.error ?? "Щось пішло не так. Спробуй ще раз." });
      } else if (method === "POST") {
        setMessage({
          kind: "ok",
          text: body.emailSent ? "Заброньовано! Підтвердження надіслали тобі на пошту." : "Заброньовано!",
        });
      } else {
        setMessage({ kind: "ok", text: "Бронь скасовано." });
      }
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: "Немає зв'язку з сервером. Перевір інтернет і спробуй ще раз." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`card${reservation ? " is-taken" : ""}${isMine ? " is-mine" : ""}`}>
      <div className="stage">
        <span className="number">№{index}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gift.image_url} alt={gift.title} loading={index > 2 ? "lazy" : "eager"} />
      </div>

      <div className="card-body">
        <h2>{gift.title}</h2>
        {gift.subtitle && <p className="subtitle">{gift.subtitle}</p>}

        {gift.specs.length > 0 && (
          <ul className="specs">
            {gift.specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}

        {gift.price_uah != null && (
          <div className="price">
            {priceFormat.format(gift.price_uah)} грн<small>орієнтовно</small>
          </div>
        )}

        {reservation &&
          (isMine ? (
            <p className="status mine">
              🎁 <span><b>Це твоя бронь.</b> Інші бачать, що подарунок зайнятий.</span>
            </p>
          ) : (
            <p className="status">
              🎁 <span>Забронював(-ла): <b>{reservation.name}</b></span>
            </p>
          ))}

        <div className="actions">
          <a className="btn btn-ghost" href={gift.shop_url} target="_blank" rel="noopener noreferrer">
            {gift.shop_name} ↗
          </a>

          {!reservation && canReserve && currentUserId && (
            <button className="btn btn-gold" type="button" disabled={busy} onClick={() => send("POST")}>
              {busy ? "Бронюємо…" : "Забронювати"}
            </button>
          )}
          {isMine && (
            <button className="btn btn-ghost" type="button" disabled={busy} onClick={() => send("DELETE")}>
              {busy ? "Скасовуємо…" : "Скасувати"}
            </button>
          )}
        </div>

        {!reservation && canReserve && !currentUserId && (
          <p className="hint">
            <Link href="/login">Увійди</Link> або <Link href="/register">зареєструйся</Link>, щоб забронювати.
          </p>
        )}
        {message && (
          <p className={`hint ${message.kind}`} role="status">
            {message.text}
          </p>
        )}
      </div>
    </article>
  );
}
