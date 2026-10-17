import { describe, expect, it } from "vitest";
import {
  canBookFor,
  canCancelBooking,
  canExportAttendees,
  canManageMembers,
  canSeeAttendee,
  canViewInsights,
  insightsScope
} from "@/lib/policy";

const admin = { id: "a", role: "admin" as const, cellId: null };
const leader = { id: "l", role: "cell leader" as const, cellId: "c1" };
const leaderNoCell = { id: "l0", role: "cell leader" as const, cellId: null };
const member = { id: "m", role: "member" as const, cellId: "c1" };
const other = { id: "o", role: "member" as const, cellId: "c2" };

describe("canBookFor", () => {
  it("lets a member book themselves only", () => {
    expect(canBookFor(member, member).ok).toBe(true);
    expect(canBookFor(member, other).ok).toBe(false);
  });

  it("lets a cell leader book their own cell only", () => {
    expect(canBookFor(leader, member).ok).toBe(true);
    expect(canBookFor(leader, other).ok).toBe(false);
    expect(canBookFor(leaderNoCell, member).ok).toBe(false);
  });

  it("lets an admin book anyone", () => {
    expect(canBookFor(admin, other).ok).toBe(true);
  });
});

describe("canCancelBooking", () => {
  it("stops a member cancelling after the start", () => {
    expect(canCancelBooking(member, { userId: member.id, userCellId: "c1" }, true).ok).toBe(false);
    expect(canCancelBooking(member, { userId: member.id, userCellId: "c1" }, false).ok).toBe(true);
  });

  it("stops a member cancelling someone else", () => {
    expect(canCancelBooking(member, { userId: other.id, userCellId: "c2" }, false).ok).toBe(false);
  });

  it("lets a cell leader cancel in their cell, not another", () => {
    expect(canCancelBooking(leader, { userId: member.id, userCellId: "c1" }, true).ok).toBe(true);
    expect(canCancelBooking(leader, { userId: other.id, userCellId: "c2" }, false).ok).toBe(false);
  });
});

describe("exports and insights", () => {
  it("blocks members from exporting and from Insights", () => {
    expect(canExportAttendees(member).ok).toBe(false);
    expect(canViewInsights(member)).toBe(false);
    expect(insightsScope(member)).toBeNull();
  });

  it("pins a cell leader to their own cell even if they ask for another", () => {
    expect(insightsScope(leader, "c2")).toEqual({ kind: "cell", cellId: "c1" });
    expect(canSeeAttendee(leader, "c1")).toBe(true);
    expect(canSeeAttendee(leader, "c2")).toBe(false);
  });

  it("gives an admin the region, or one cell when they pick it", () => {
    expect(insightsScope(admin)).toEqual({ kind: "region" });
    expect(insightsScope(admin, "c2")).toEqual({ kind: "cell", cellId: "c2" });
  });

  it("lets only an admin manage members", () => {
    expect(canManageMembers(admin)).toBe(true);
    expect(canManageMembers(leader)).toBe(false);
  });
});
