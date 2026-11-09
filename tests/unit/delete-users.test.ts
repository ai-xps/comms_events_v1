import { describe, expect, it } from "vitest";
import { selectIdsForBatchDelete } from "@/lib/delete-users";
import { LIMITS } from "@/lib/security";

describe("selectIdsForBatchDelete", () => {
  it("drops blanks, duplicates, and the signed-in admin", () => {
    const result = selectIdsForBatchDelete(["a", "a", "", "self", "b"], "self");
    expect(result.ids).toEqual(["a", "b"]);
    expect(result.skippedSelf).toBe(true);
    expect(result.truncated).toBe(false);
  });

  it("rejects a non-array body as empty", () => {
    const result = selectIdsForBatchDelete("nope", "self");
    expect(result.ids).toEqual([]);
    expect(result.skippedSelf).toBe(false);
  });

  it("caps the list at LIMITS.batchDeleteUsers", () => {
    const many = Array.from({ length: LIMITS.batchDeleteUsers + 3 }, (_, i) => `id-${i}`);
    const result = selectIdsForBatchDelete(many, "self");
    expect(result.ids).toHaveLength(LIMITS.batchDeleteUsers);
    expect(result.truncated).toBe(true);
  });
});
