import { NextResponse, type NextRequest } from "next/server";
import { sendReservationEmail } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

async function readGiftId(request: NextRequest) {
  try {
    const body = (await request.json()) as { giftId?: unknown };
    return typeof body.giftId === "string" ? body.giftId : null;
  } catch {
    return null;
  }
}

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return fail("Сайт ще не підключено до бази.", 503);
  const giftId = await readGiftId(request);
  if (!giftId) return fail("Не вказано подарунок.", 400);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return fail("Увійди, щоб бронювати подарунки.", 401);

  const { data: gift } = await supabase
    .from("gifts")
    .select("title, shop_url, shop_name")
    .eq("id", giftId)
    .maybeSingle();
  if (!gift) return fail("Такого подарунка немає.", 404);

  const { error } = await supabase.from("reservations").insert({ gift_id: giftId, user_id: user.id });
  if (error) {
    if (error.code === "23505") return fail("Цей подарунок уже забронював хтось інший.", 409);
    console.error("reserve failed", error);
    return fail("Не вдалося забронювати. Спробуй ще раз.", 500);
  }

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  let emailSent = false;
  try {
    emailSent = await sendReservationEmail({
      to: user.email!,
      name: profile?.name ?? "друже",
      giftTitle: gift.title,
      shopName: gift.shop_name,
      shopUrl: gift.shop_url,
      siteUrl,
    });
  } catch (e) {
    // The reservation stands even if the email fails.
    console.error("reservation email failed", e);
  }

  return NextResponse.json({ ok: true, emailSent });
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured) return fail("Сайт ще не підключено до бази.", 503);
  const giftId = await readGiftId(request);
  if (!giftId) return fail("Не вказано подарунок.", 400);

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return fail("Увійди, щоб керувати бронюваннями.", 401);

  const { data, error } = await supabase
    .from("reservations")
    .delete()
    .eq("gift_id", giftId)
    .eq("user_id", auth.user.id)
    .select("gift_id");
  if (error) {
    console.error("cancel failed", error);
    return fail("Не вдалося скасувати. Спробуй ще раз.", 500);
  }
  if (!data?.length) return fail("Ця бронь не твоя або її вже скасовано.", 404);

  return NextResponse.json({ ok: true });
}
