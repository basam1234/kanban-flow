const request = require("supertest");
const app = require("../app");
const pool = require("../db");
describe("Kanban API Endpoints", () => {
  // Teardown: Close DB connection after tests
  afterAll(async () => {
    await pool.end();
  });
  it("GET /api/data should return columns and tasks", async () => {
    const res = await request(app).get("/api/data");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("columns");
    expect(res.body).toHaveProperty("tasks");
  });
  it("POST /api/tasks should create a new task", async () => {
    const res = await request(app).post("/api/tasks").send({
      content: "Integration Test Task",
      columnId: 1,
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.content).toEqual("Integration Test Task");
  });
});
