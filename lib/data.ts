import type { Gift, Reservation } from "./types";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";

/** Shown only until Supabase is connected, so the page can be previewed locally. */
const previewGifts: Gift[] = [
  {
    id: "philips-evnia",
    title: "Philips Evnia 24M2N3201A",
    subtitle: "Ігровий монітор",
    specs: ['23.8" IPS, Full HD', "180 Гц, 1 мс", "HDR10, білий корпус"],
    price_uah: 6400,
    image_url: "/gifts/philips-evnia.jpg",
    shop_url: "https://ek.ua/ua/PHILIPS-EVNIA-24M2N3201A.htm",
    shop_name: "e-katalog",
    sort: 1,
  },
  {
    id: "gig-crazy-cats",
    title: "GIG Dynamic Long",
    subtitle: "Набір трусів «Crazy Cats»",
    specs: ["Лімітований принт, чорні", "Подовжений крій боксерів", "95% бавовна, 5% еластан"],
    price_uah: 1375,
    image_url: "/gifts/gig-crazy-cats.webp",
    shop_url: "https://gigmilitary.com/product/limitovanij-nabir-trusiv-dynamic-long-crazy-cats-chornij",
    shop_name: "GIG",
    sort: 2,
  },
  {
    id: "jordan-element-duffle",
    title: "Jordan Element Duffle",
    subtitle: "Сумка в подорож",
    specs: ["60 × 38 × 19,5 см, поліестер", "4 зовнішні кишені + 1 внутрішня", "Чорна, з 3D-логотипом Jordan"],
    price_uah: 2999,
    image_url: "/gifts/jordan-element-duffle.webp",
    shop_url: "https://www.footshop.ua/uk/duffle-bag/498823-jordan-element-duffle-black.html",
    shop_name: "Footshop",
    sort: 3,
  },
];

export type WishlistData = {
  configured: boolean;
  gifts: Gift[];
  reservations: Reservation[];
  user: { id: string; name: string } | null;
  error: string | null;
};

export async function loadWishlist(): Promise<WishlistData> {
  if (!isSupabaseConfigured) {
    return { configured: false, gifts: previewGifts, reservations: [], user: null, error: null };
  }

  const supabase = await createClient();
  const [{ data: authData }, gifts, reservations] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("gifts").select("*").order("sort"),
    supabase.from("reservations").select("gift_id, user_id, profiles(name)"),
  ]);

  const error = gifts.error?.message ?? reservations.error?.message ?? null;

  const rows = (reservations.data ?? []) as unknown as {
    gift_id: string;
    user_id: string;
    profiles: { name: string } | { name: string }[] | null;
  }[];
  const mapped: Reservation[] = rows.map((r) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return { gift_id: r.gift_id, user_id: r.user_id, name: profile?.name ?? "Хтось" };
  });

  let user: WishlistData["user"] = null;
  if (authData.user) {
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", authData.user.id).maybeSingle();
    user = { id: authData.user.id, name: profile?.name ?? authData.user.email ?? "" };
  }

  return { configured: true, gifts: (gifts.data ?? []) as Gift[], reservations: mapped, user, error };
}
