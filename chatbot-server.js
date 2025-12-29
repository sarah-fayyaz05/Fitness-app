const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// SQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fitness_chatbot"
});

db.connect();

// Chatbot Logic
function getBotReply(message, callback) {
  const words = message.toLowerCase().split(" ");

  db.query("SELECT * FROM chatbot_qa", (err, rows) => {
    if (err) {
      callback("Database error");
      return;
    }

    for (let row of rows) {
      const keys = row.keywords.split(",");
      for (let key of keys) {
        if (words.includes(key.trim())) {
          return callback(row.answer);
        }
      }
    }

    callback("Sorry, I can only answer questions related to this fitness and diet website.");
  });
}

// Socket Connection
io.on("connection", (socket) => {
  socket.on("userMessage", (msg) => {
    getBotReply(msg, (reply) => {
      socket.emit("botMessage", reply);
    });
  });
});

server.listen(5000, () => {
  console.log("Chatbot Server Running on Port 5000");
});
