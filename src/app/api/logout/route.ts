import { NextResponse } from "next/server";

import { getSessionCookieOptions } from "@/services/auth/session.service";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout realizado com sucesso." },
    { status: 200 },
  );
  const { name, cookieOptions } = getSessionCookieOptions({ maxAge: 0 });

  response.cookies.set({
    name,
    value: "",
    ...cookieOptions,
    maxAge: 0,
  });

  return response;
}
