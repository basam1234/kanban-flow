const express = require("express");
const router = express.Router();
const pool = require("../db");
// GET All Data
router.get("/data", async (req, res) => {
  try {
    const columns = await pool.query(
      "SELECT * FROM columns ORDER BY position ASC",
    );
    const tasks = await pool.query("SELECT * FROM tasks ORDER BY position ASC");
    res.json({ columns: columns.rows, tasks: tasks.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// POST New Task
router.post("/tasks", async (req, res) => {
  const { content, columnId } = req.body;
  try {
    // Get current max position to append to bottom
    const posResult = await pool.query(
      "SELECT MAX(position) as maxPos FROM tasks WHERE column_id = $1",
      [columnId],
    );
    const newPos = (posResult.rows[0].maxpos || 0) + 1;

    const newTask = await pool.query(
      "INSERT INTO tasks (content, column_id, position) VALUES ($1, $2, $3) RETURNING *",
      [content, columnId, newPos],
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE Task
router.delete("/tasks/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PUT Update Drag and Drop (The "Impressive" Logic)
router.put("/reorder", async (req, res) => {
  const { sourceColId, destColId, sourceTaskIds, destTaskIds } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Update source column positions
    for (let i = 0; i < sourceTaskIds.length; i++) {
      await client.query(
        "UPDATE tasks SET column_id = $1, position = $2 WHERE id = $3",
        [sourceColId, i, sourceTaskIds[i]],
      );
    }

    // 2. If tasks moved to a different column, update that column too
    if (sourceColId !== destColId) {
      for (let i = 0; i < destTaskIds.length; i++) {
        await client.query(
          "UPDATE tasks SET column_id = $1, position = $2 WHERE id = $3",
          [destColId, i, destTaskIds[i]],
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Board updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});
module.exports = router;
