import http from "http";
import fs from "fs";
import { MongoClient, ObjectId } from "mongodb";
import { tasksCollection } from "./db.js";

// =====================
// DB CONNECTION
// =====================

const PORT = 3000;

// =====================
// HELPER: Parse JSON body
// =====================
function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      resolve(body ? JSON.parse(body) : {});
    });
  });
}

// =====================
// SERVER
// =====================
const server = http.createServer(async (req, res) => {
  const url = req.url;
  const method = req.method;

  res.setHeader("Content-Type", "application/json");

  // =====================
  // SERVE FRONTEND FILES
  // =====================
  if (method === "GET") {
    if (url === "/" || url === "/index.html") {
      const file = fs.readFileSync("./public/index.html");
      res.setHeader("Content-Type", "text/html");
      return res.end(file);
    }

    if (url === "/style.css") {
      const file = fs.readFileSync("./public/style.css");
      res.setHeader("Content-Type", "text/css");
      return res.end(file);
    }

    if (url === "/script.js") {
      const file = fs.readFileSync("./public/script.js");
      res.setHeader("Content-Type", "application/javascript");
      return res.end(file);
    }

    // GET ALL TASKS
    if (url === "/tasks") {
      const tasks = await tasksCollection.find().toArray();
      return res.end(JSON.stringify(tasks));
    }
  }

  // =====================
  // CREATE TASK (POST)
  // =====================
  if (method === "POST" && url === "/tasks") {
    const body = await getRequestBody(req);

    const result = await tasksCollection.insertOne({
      task: body.task,
      completed: false,
      createdAt: new Date(),
    });

    return res.end(
      JSON.stringify({
        _id: result.insertedId,
        ...body,
        completed: false,
      }),
    );
  }

  // =====================
  // UPDATE TASK (PUT)
  // =====================
  if (method === "PUT" && url.startsWith("/tasks/")) {
    const id = url.split("/")[2];
    const body = await getRequestBody(req);

    await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          task: body.task,
          completed: body.completed,
        },
      },
    );

    return res.end(JSON.stringify({ message: "Task updated" }));
  }

  // =====================
  // DELETE TASK (DELETE)
  // =====================
  if (method === "DELETE" && url.startsWith("/tasks/")) {
    const id = url.split("/")[2];

    await tasksCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return res.end(JSON.stringify({ message: "Task deleted" }));
  }

  // =====================
  // NOT FOUND
  // =====================
  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
