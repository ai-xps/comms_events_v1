import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_COLOURS } from "../src/lib/constants";
import { addDays, londonDate, londonParts } from "../src/lib/time";

const prisma = new PrismaClient();

function at(daysFromToday: number, hour: number, minute = 0) {
  const p = londonParts(new Date());
  return addDays(londonDate(p.year, p.month, p.day, hour, minute), daysFromToday);
}

async function main() {
  const already = await prisma.user.findUnique({ where: { cellNumber: "07000000001" } });
  if (already) {
    console.log("Seed skipped: demo users already present.");
    return;
  }

  const hash = (plain: string) => bcrypt.hash(plain, 12);

  const sparkbrook = await prisma.cell.create({
    data: { name: "Sparkbrook", region: "Birmingham", department: "Community", team: "South" }
  });
  const erdington = await prisma.cell.create({
    data: { name: "Erdington", region: "Birmingham", department: "Community", team: "North" }
  });

  const credentials = [
    { name: "Amara Adeyemi", cellNumber: "07000000001", password: "AdminPass1", role: "admin", cellId: null },
    { name: "Priya Nair", cellNumber: "07000000002", password: "LeaderPass1", role: "cell leader", cellId: sparkbrook.id },
    { name: "James Okafor", cellNumber: "07000000003", password: "LeaderPass2", role: "cell leader", cellId: erdington.id },
    { name: "Hannah Cole", cellNumber: "07000000004", password: "MemberPass1", role: "member", cellId: sparkbrook.id },
    { name: "Daniel Wright", cellNumber: "07000000005", password: "MemberPass2", role: "member", cellId: sparkbrook.id },
    { name: "Fatima Begum", cellNumber: "07000000006", password: "MemberPass3", role: "member", cellId: sparkbrook.id },
    { name: "Owen Reid", cellNumber: "07000000007", password: "MemberPass4", role: "member", cellId: erdington.id },
    { name: "Chloe Patel", cellNumber: "07000000008", password: "MemberPass5", role: "member", cellId: erdington.id }
  ];

  const users = [];
  for (const row of credentials) {
    users.push(
      await prisma.user.create({
        data: {
          name: row.name,
          cellNumber: row.cellNumber,
          passwordHash: await hash(row.password),
          role: row.role,
          cellId: row.cellId,
          active: true
        }
      })
    );
  }
  const admin = users[0];
  const leaderA = users[1];
  const hannah = users[3];
  const daniel = users[4];

  const cathedral = await prisma.organisation.create({
    data: { name: "St Philip’s Cathedral", nameKey: "st philip’s cathedral", status: "WHITELIST" }
  });
  const spam = await prisma.organisation.create({
    data: { name: "Spam Events Ltd", nameKey: "spam events ltd", status: "BLACKLIST" }
  });
  const tech = await prisma.organisation.create({
    data: { name: "Birmingham Tech Meetup", nameKey: "birmingham tech meetup", status: "STANDARD" }
  });

  await prisma.settings.create({
    data: {
      id: "default",
      locationLabel: "Birmingham",
      memberAttendeeView: "COUNT",
      categoryColours: JSON.stringify(DEFAULT_COLOURS),
      priorityUrls: JSON.stringify(["https://www.meetup.com/find/?location=gb--birmingham"])
    }
  });

  const published = await prisma.event.create({
    data: {
      title: "Sunday gathering at St Philip’s",
      organisationName: cathedral.name,
      organisationId: cathedral.id,
      category: "Christian",
      startsAt: at(2, 11, 0),
      endsAt: at(2, 12, 30),
      online: false,
      placeName: "St Philip’s Cathedral, Colmore Row",
      lat: 52.4814,
      lng: -1.8985,
      status: "PUBLISHED",
      capacity: 40,
      createdById: admin.id
    }
  });

  const fullEvent = await prisma.event.create({
    data: {
      title: "Jewellery Quarter founders’ breakfast",
      organisationName: "Impact Hub Birmingham",
      category: "Networking",
      startsAt: at(3, 8, 0),
      endsAt: at(3, 9, 30),
      online: false,
      placeName: "1000 Trades, Frederick Street",
      lat: 52.4865,
      lng: -1.9122,
      status: "PUBLISHED",
      capacity: 1,
      createdById: admin.id
    }
  });

  await prisma.booking.create({
    data: {
      eventId: fullEvent.id,
      userId: daniel.id,
      bookedById: leaderA.id,
      attendance: "UNCONFIRMED"
    }
  });

  await prisma.event.create({
    data: {
      title: "Birmingham Tech Meetup — lightning talks",
      organisationName: tech.name,
      organisationId: tech.id,
      sourceKey: "bham-tech-meetup-oct",
      category: "Meetup",
      startsAt: at(5, 18, 30),
      endsAt: at(5, 21, 0),
      online: false,
      placeName: "The Custard Factory, Digbeth",
      lat: 52.4747,
      lng: -1.8848,
      status: "PENDING",
      createdById: admin.id
    }
  });

  await prisma.event.create({
    data: {
      title: "Unlimited crypto riches night",
      organisationName: spam.name,
      organisationId: spam.id,
      sourceKey: "spam-events-crypto-night",
      category: "Networking",
      startsAt: at(4, 19, 0),
      endsAt: at(4, 22, 0),
      online: true,
      status: "DISCARDED"
    }
  });

  const seriesId = "seed-weekly-prayer";
  for (let i = 0; i < 12; i += 1) {
    const startsAt = at(1 + i * 7, 12, 30);
    await prisma.event.create({
      data: {
        seriesId,
        title: "Lunchtime prayer at Carrs Lane",
        organisationName: "Carrs Lane Church",
        category: "Christian",
        startsAt,
        endsAt: new Date(startsAt.getTime() + 30 * 60 * 1000),
        online: false,
        placeName: "Carrs Lane Church Centre",
        lat: 52.4795,
        lng: -1.8938,
        status: "PUBLISHED",
        recurrence: "WEEKLY",
        capacity: 20,
        createdById: leaderA.id
      }
    });
  }

  const past = await prisma.event.create({
    data: {
      title: "Open mic at BCU (last week)",
      organisationName: "Birmingham City University",
      category: "Student",
      startsAt: at(-5, 19, 0),
      endsAt: at(-5, 22, 0),
      online: false,
      placeName: "The Loft, BCU Students’ Union",
      lat: 52.4826,
      lng: -1.8854,
      status: "PUBLISHED",
      createdById: admin.id
    }
  });

  await prisma.booking.create({
    data: {
      eventId: past.id,
      userId: hannah.id,
      bookedById: hannah.id,
      attendance: "UNCONFIRMED"
    }
  });

  await prisma.booking.create({
    data: {
      eventId: published.id,
      userId: hannah.id,
      bookedById: hannah.id,
      attendance: "UNCONFIRMED"
    }
  });

  await prisma.event.create({
    data: {
      title: "IoD West Midlands lunch",
      organisationName: "IoD West Midlands",
      category: "Professional",
      startsAt: at(11, 12, 0),
      endsAt: at(11, 14, 30),
      online: false,
      placeName: "The Grand Hotel, Colmore Row",
      lat: 52.4818,
      lng: -1.9007,
      status: "PUBLISHED",
      capacity: 12,
      createdById: admin.id
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed",
      entityType: "System",
      summary: "Seeded Gather Birmingham with cells, users, and sample events"
    }
  });

  console.log("Seeded Gather — Birmingham Community Events");
  console.log("Sign in with cell number and password:");
  for (const row of credentials) {
    console.log(`  ${row.role.padEnd(12)}  ${row.cellNumber}  ${row.password}  (${row.name})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
