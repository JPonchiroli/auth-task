import { NextResponse } from "next/server";

import {
  authenticateUser,
  hasValidationErrors,
  validateLoginPayload,
} from "@/services/auth/auth.service";
import { createSessionToken, getSessionCookieOptions } from "@/services/auth/session.service";
import type { LoginPayload } from "@/services/auth/auth.types";
import { toErrorResponse } from "@/utils/http-response";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<LoginPayload>;
    const validationErrors = validateLoginPayload(payload);

    if (hasValidationErrors(validationErrors)) {
      return NextResponse.json(
        {
          message: "Dados incompletos ou inválidos.",
          errors: validationErrors,
        },
        { status: 400 },
      );
    }

    const user = await authenticateUser({
      email: payload.email!.trim(),
      password: payload.password!.trim(),
    });

    const token = createSessionToken(user);
    const { name, cookieOptions } = getSessionCookieOptions();
    const response = NextResponse.json(
      {
        message: "Login realizado com sucesso.",
        user,
      },
      { status: 200 },
    );

    response.cookies.set({
      name,
      value: token,
      ...cookieOptions,
    });

    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
