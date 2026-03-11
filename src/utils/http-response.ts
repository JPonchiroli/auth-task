import { NextResponse } from "next/server";

import { AppError, isAppError } from "./app-error";

type ResponseBody = {
  message: string;
  code?: string;
  details?: unknown;
};

export function toErrorResponse(error: unknown): NextResponse<ResponseBody> {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      message: "Erro inesperado no servidor.",
      code: "UNEXPECTED_ERROR",
    },
    { status: 500 },
  );
}

export function badRequest(message: string, details?: unknown): never {
  throw new AppError("BAD_REQUEST", message, 400, details);
}
