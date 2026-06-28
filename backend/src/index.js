const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db/index");
const authRoutes = require("./routes/auth");
const problemRoutes = require("./routes/problems");
const submissionRoutes = require("./routes/submissions");
const aiRoutes = require("./routes/ai");
const authMiddleware = require("./middleware/auth");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: `Hello user ${req.user.id}, you are authenticated` });
});

app.get("/", (req, res) => {
  res.json({ message: "AlgoFlow backend is running" });
});

// store active battle rooms in memory
const battleRooms = {};
const collabRooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // create a new battle room
  socket.on("create-room", async ({ username }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    // pick a random problem
    const result = await db.query(
      "SELECT id, title, description, difficulty, starter_code FROM problems ORDER BY RANDOM() LIMIT 1",
    );
    const problem = result.rows[0];

    battleRooms[roomId] = {
      players: [{ id: socket.id, username }],
      problem,
      winner: null,
    };

    socket.join(roomId);
    socket.emit("room-created", { roomId, problem });
    console.log(`Room ${roomId} created by ${username}`);
  });

  // join existing room
  socket.on("join-room", async ({ roomId, username }) => {
    const room = battleRooms[roomId];

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    room.players.push({ id: socket.id, username });
    socket.join(roomId);

    // tell the joiner about the problem
    socket.emit("room-joined", {  problem: room.problem,roomId });

    // tell BOTH players battle is starting
    io.to(roomId).emit("battle-start", {
      problem: room.problem,
      players: room.players.map((p) => p.username),
    });

    console.log(`${username} joined room ${roomId}`);
  });

  // handle submission in battle
  socket.on("battle-submit", async ({ roomId, code, username }) => {
    const room = battleRooms[roomId];
    if (!room) return;
    if (room.winner) {
      socket.emit("battle-submission-result", {
        passed: false,
        message: "Battle already ended — opponent won!",
      });
      return;
    }

    try {
      // get all test cases
      const testCasesResult = await db.query(
        "SELECT * FROM test_cases WHERE problem_id = $1",
        [room.problem.id],
      );
      const testCases = testCasesResult.rows;

      let allPassed = true;

      for (const tc of testCases) {
        const response = await fetch("http://localhost:6001/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, input: tc.input }),
        });

        const data = await response.json();
        const actual = (data.output || "").trim();
        const expected = tc.expected_output.trim();

        if (actual !== expected) {
          allPassed = false;
          break;
        }
      }

      if (allPassed && !room.winner) {
        room.winner = username;

        // find winner and loser user IDs
        try {
          const winnerResult = await db.query(
            "SELECT id FROM users WHERE username = $1",
            [username],
          );
          const loserUsername = room.players.find(
            (p) => p.username !== username,
          )?.username;
          const loserResult = await db.query(
            "SELECT id FROM users WHERE username = $1",
            [loserUsername],
          );

          if (winnerResult.rows.length > 0 && loserResult.rows.length > 0) {
            await db.query(
              "INSERT INTO battles (room_id, winner_id, loser_id, problem_id) VALUES ($1, $2, $3, $4)",
              [
                roomId,
                winnerResult.rows[0].id,
                loserResult.rows[0].id,
                room.problem.id,
              ],
            );
          }
        } catch (err) {
          console.error("Failed to save battle result:", err);
        }

        io.to(roomId).emit("battle-won", { winner: username });
      } else {
        socket.emit("battle-submission-result", {
          passed: false,
          message: "Wrong answer — keep trying!",
        });
      }
    } catch (err) {
      socket.emit("battle-submission-result", {
        passed: false,
        message: "Execution failed",
      });
    }
  });
  // COLLAB ROOMS

  socket.on("collab-create", ({ username }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    collabRooms[roomId] = {
      code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Start coding together!\n    return 0;\n}",
      users: [{ id: socket.id, username }],
    };

    socket.join(`collab-${roomId}`);
    socket.emit("collab-created", { roomId, code: collabRooms[roomId].code });
    console.log(`Collab room ${roomId} created by ${username}`);
  });

  socket.on("collab-join", ({ roomId, username }) => {
    const room = collabRooms[roomId];

    if (!room) {
      socket.emit("collab-error", { message: "Room not found" });
      return;
    }

    room.users.push({ id: socket.id, username });
    socket.join(`collab-${roomId}`);

    socket.emit("collab-joined", { roomId, code: room.code });
    io.to(`collab-${roomId}`).emit("collab-user-joined", {
      username,
      users: room.users.map((u) => u.username),
    });

    console.log(`${username} joined collab room ${roomId}`);
  });

  socket.on("collab-code-change", ({ roomId, code }) => {
    if (!collabRooms[roomId]) return;

    collabRooms[roomId].code = code;
    socket.to(`collab-${roomId}`).emit("collab-code-update", { code });
  });

  socket.on("collab-leave", async ({ roomId, username }) => {
    if (!collabRooms[roomId]) return;

    const room = collabRooms[roomId];

    // save session if creator is leaving
    try {
      const userResult = await db.query(
        "SELECT id FROM users WHERE username = $1",
        [username],
      );
      if (userResult.rows.length > 0) {
        await db.query(
          "INSERT INTO collab_sessions (room_id, created_by, final_code) VALUES ($1, $2, $3)",
          [roomId, userResult.rows[0].id, room.code],
        );
      }
    } catch (err) {
      console.error("Failed to save collab session:", err);
    }

    room.users = room.users.filter((u) => u.id !== socket.id);
    socket.leave(`collab-${roomId}`);
    io.to(`collab-${roomId}`).emit("collab-user-left", { username });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
