import { NextResponse } from "next/server";

import { requireSessionUserFromCookies } from "@/services/auth/session.service";
import { taskService } from "@/services/tasks/task.service";
import { toErrorResponse } from "@/utils/http-response";

export async function GET() {
  try {
    const user = await requireSessionUserFromCookies();
    const tasks = await taskService.listTasks(user.id);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUserFromCookies();
    const payload = (await request.json()) as { title?: string };
    const task = await taskService.createTask({
      userId: user.id,
      title: payload.title ?? "",
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
