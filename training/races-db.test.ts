import { test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import {
  migrateRaces,
  createRace,
  listRaces,
  updateRace,
  deleteRace,
  seedRacesOnce,
  type RaceInput,
} from "./races-db";

const TODAY = "2026-09-28";
let db: Database;

beforeEach(() => {
  db = new Database(":memory:");
  migrateRaces(db);
});

test("createRace stores all fields and defaults optionals to null", () => {
  const r = createRace(db, { name: "Powerman Classic" }, TODAY);
  expect(r.name).toBe("Powerman Classic");
  expect(r.discipline).toBeNull();
  expect(r.location).toBeNull();
  expect(r.date).toBeNull();
  expect(r.approx_year).toBeNull();
  expect(r.notes).toBeNull();
  expect(r.created_at).toBe(TODAY);
});

test("createRace stores all fields when given", () => {
  const r = createRace(
    db,
    {
      name: "Powerman Classic",
      discipline: "10km run / 60km bike / 10km run",
      location: "Zell am See",
      date: "2028-06-04",
      approxYear: 2028,
      notes: "Target race",
    },
    TODAY,
  );
  expect(r.discipline).toBe("10km run / 60km bike / 10km run");
  expect(r.location).toBe("Zell am See");
  expect(r.date).toBe("2028-06-04");
  expect(r.approx_year).toBe(2028);
  expect(r.notes).toBe("Target race");
});

test("migrateRaces does not reset existing data on a second call", () => {
  createRace(db, { name: "A" }, TODAY);
  migrateRaces(db);
  expect(listRaces(db).length).toBe(1);
});

test("listRaces sorts dated races before year-only races, both ascending", () => {
  createRace(db, { name: "Year 2030", approxYear: 2030 }, TODAY);
  createRace(db, { name: "Dated later", date: "2027-08-01" }, TODAY);
  createRace(db, { name: "Year 2027", approxYear: 2027 }, TODAY);
  createRace(db, { name: "Dated sooner", date: "2027-03-01" }, TODAY);
  const names = listRaces(db).map((r) => r.name);
  expect(names).toEqual(["Dated sooner", "Dated later", "Year 2027", "Year 2030"]);
});

test("listRaces sorts races with neither date nor year to the end, by id", () => {
  const first = createRace(db, { name: "No date at all" }, TODAY);
  createRace(db, { name: "Dated", date: "2027-01-01" }, TODAY);
  const second = createRace(db, { name: "Also no date" }, TODAY);
  const names = listRaces(db).map((r) => r.name);
  expect(names).toEqual(["Dated", "No date at all", "Also no date"]);
  expect(first.id).toBeLessThan(second.id);
});

test("updateRace replaces all fields, accepting explicit null to clear one", () => {
  const r = createRace(db, { name: "Original", date: "2027-01-01" }, TODAY);
  const updated = updateRace(db, r.id, { name: "Renamed", date: null, approxYear: 2027 });
  expect(updated).toEqual({
    id: r.id,
    name: "Renamed",
    discipline: null,
    location: null,
    date: null,
    approx_year: 2027,
    notes: null,
    created_at: TODAY,
  });
});

test("updateRace on an unknown id returns null", () => {
  expect(updateRace(db, 9999, { name: "X" })).toBeNull();
});

test("deleteRace removes the row and returns true", () => {
  const r = createRace(db, { name: "Delete me" }, TODAY);
  expect(deleteRace(db, r.id)).toBe(true);
  expect(listRaces(db)).toEqual([]);
});

test("deleteRace on an unknown id returns false and does not throw", () => {
  expect(deleteRace(db, 9999)).toBe(false);
});

test("seedRacesOnce inserts rows and guards against a second call", () => {
  const rows: RaceInput[] = [{ name: "Seed A" }, { name: "Seed B" }];
  expect(seedRacesOnce(db, rows, TODAY)).toBe(2);
  expect(seedRacesOnce(db, rows, TODAY)).toBe(0);
  expect(listRaces(db).length).toBe(2);
});
