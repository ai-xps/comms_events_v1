import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { originAllowed, rejectOrigin } from "@/lib/origin";
import { deleteUsersPermanently, selectIdsForBatchDelete } from "@/lib/delete-users";
import { LIMITS } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) return rejectOrigin();
  const actor = await getCurrentUser();
  if (!actor || actor.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can delete accounts." }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const { ids, skippedSelf, truncated } = selectIdsForBatchDelete(body.ids, actor.id);
  if (ids.length === 0) {
    return NextResponse.json(
      {
        error: skippedSelf
          ? "You cannot delete your own account. Select other people."
          : "Select at least one person to delete."
      },
      { status: 400 }
    );
  }
  if (truncated) {
    return NextResponse.json(
      { error: `You can delete at most ${LIMITS.batchDeleteUsers} people at a time.` },
      { status: 400 }
    );
  }

  const result = await deleteUsersPermanently({
    ids,
    actorId: actor.id,
    actorName: actor.name
  });

  return NextResponse.json({
    ok: true,
    deleted: result.deleted,
    skippedSelf,
    names: result.names
  });
}
