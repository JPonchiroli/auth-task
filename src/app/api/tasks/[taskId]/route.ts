import { NextResponse } from "next/server";

import { AppError } from "@/utils/app-error";
import { requireSessionUserFromCookies } from "@/services/auth/session.service";
import { taskService } from "@/services/tasks/task.service";
import { toErrorResponse } from "@/utils/http-response";

type Params = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(request: Request, context: Params) {
  try {
    const user = await requireSessionUserFromCookies();
    const { taskId } = await context.params;
    const payload = (await request.json()) as { completed?: boolean };

    if (typeof payload.completed !== "boolean") {
      throw new AppError("BAD_REQUEST", "Campo 'completed' é obrigatório.", 400);
    }

    const task = await taskService.toggleTaskCompletion({
      userId: user.id,
      taskId,
      completed: payload.completed,
    });

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: Params) {
  try {
    const user = await requireSessionUserFromCookies();
    const { taskId } = await context.params;

    await taskService.deleteTask({
      userId: user.id,
      taskId,
    });

    return NextResponse.json({ message: "Tarefa removida com sucesso." }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
