import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API_URL = "http://localhost:5000/api";

function App() {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/data`);
        // Transform array data into an object structure for easier DnD manipulation
        const cols = {};
        res.data.columns.forEach((col) => {
          cols[col.id] = { ...col, tasks: [] };
        });
        res.data.tasks.forEach((task) => {
          if (cols[task.column_id]) {
            cols[task.column_id].tasks.push(task);
          }
        });
        setColumns(cols);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Clone state to prevent mutation
    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceTasks = [...sourceCol.tasks];
    const destTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : [...destCol.tasks];

    // Move task locally
    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    // Update State UI Immediately (Optimistic Update)
    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, tasks: sourceTasks },
      [destination.droppableId]: { ...destCol, tasks: destTasks },
    });

    // Sync with Backend
    try {
      await axios.put(`${API_URL}/reorder`, {
        sourceColId: source.droppableId,
        destColId: destination.droppableId,
        sourceTaskIds: sourceTasks.map((t) => t.id),
        destTaskIds: destTasks.map((t) => t.id),
      });
    } catch (err) {
      alert("Failed to save order");
    }
  };

  const addTask = async (columnId) => {
    const content = prompt("Enter task name:");
    if (!content) return;
    try {
      const res = await axios.post(`${API_URL}/tasks`, { content, columnId });
      const newCol = { ...columns[columnId] };
      newCol.tasks.push(res.data);
      setColumns({ ...columns, [columnId]: newCol });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId, columnId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      const newCol = { ...columns[columnId] };
      newCol.tasks = newCol.tasks.filter((t) => t.id !== taskId);
      setColumns({ ...columns, [columnId]: newCol });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10">Loading Board...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">
        PERN KanbanFlow
      </h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 justify-center overflow-x-auto">
          {Object.values(columns)
            .sort((a, b) => a.position - b.position)
            .map((col) => (
              <div
                key={col.id}
                className="bg-gray-800 p-4 rounded-lg w-80 flex flex-col min-h-[150px]"
              >
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">
                  {col.title}
                </h2>

                <Droppable droppableId={String(col.id)}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 transition-colors ${snapshot.isDraggingOver ? "bg-gray-700/50" : ""}`}
                    >
                      {col.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-700 p-3 mb-3 rounded shadow hover:bg-gray-600 group flex justify-between items-center"
                            >
                              <span>{task.content}</span>
                              <button
                                onClick={() => deleteTask(task.id, col.id)}
                                className="text-red-400 opacity-0 group-hover:opacity-100 ml-2"
                              >
                                x
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button
                  onClick={() => addTask(col.id)}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  + Add Task
                </button>
              </div>
            ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
