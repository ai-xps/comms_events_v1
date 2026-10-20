export const ROLES = ["admin", "cell leader", "member"] as const;
export type Role = (typeof ROLES)[number];

export const CATEGORIES = [
  "Christian",
  "Networking",
  "Professional",
  "Student",
  "Meetup"
] as const;
export type Category = (typeof CATEGORIES)[number];

/** Soft but distinct accents — berry / sage / gold family to match the blush UI. */
export const DEFAULT_COLOURS: Record<Category, string> = {
  Christian: "#7d9b78",
  Networking: "#5a9ea8",
  Professional: "#a8434d",
  Student: "#c48b9f",
  Meetup: "#c4a574"
};

// COUNT_AND_NAME_CELL lets every member read the name and cell number of everyone booked
// on an event. Default stays COUNT; see DECISIONS.md "Member attendee view".
export const MEMBER_ATTENDEE_VIEWS = ["COUNT", "COUNT_AND_INITIALS", "COUNT_AND_NAME_CELL"] as const;
export type MemberAttendeeView = (typeof MEMBER_ATTENDEE_VIEWS)[number];

export function parseMemberAttendeeView(value: unknown): MemberAttendeeView {
  return MEMBER_ATTENDEE_VIEWS.includes(value as MemberAttendeeView) ? (value as MemberAttendeeView) : "COUNT";
}

export const SESSION_COOKIE = "gather_session";
export const SESSION_HOURS = 12;
export const GENERIC_LOGIN_ERROR = "Cell number or password is not recognised.";

export function parseRole(value: string): Role | null {
  const normalised = value.trim().toLowerCase();
  if (normalised === "admin") return "admin";
  if (normalised === "cell leader" || normalised === "cell_leader" || normalised === "cellleader") {
    return "cell leader";
  }
  if (normalised === "member" || normalised === "user") return "member";
  return null;
}

export function categoryEnabledKey(category: Category) {
  switch (category) {
    case "Christian":
      return "christianEnabled" as const;
    case "Networking":
      return "networkingEnabled" as const;
    case "Professional":
      return "professionalEnabled" as const;
    case "Student":
      return "studentEnabled" as const;
    case "Meetup":
      return "meetupEnabled" as const;
  }
}
