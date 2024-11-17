const express = require("express");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./db/db");
const cors = require("cors");
const configureWebSocket = require("./socket/index");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const projects = require("./routes/http.route/projects");

const PORT = process.env.PORT || 3000;
const app = express();

// Trust the first proxy
app.set("trust proxy", 1);

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "http://localhost:5173" // Use exact domain
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// // Ensure temp directory exists
// const tempDir = path.join(__dirname, "uploads", "temp");
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }

// Configure express-fileupload with memory efficient options
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "uploads", "temp"),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 1, // Allow only 1 file upload at a time
    },
    abortOnLimit: true,
    debug: false,
  })
);

// Add these headers explicitly
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(cookieParser());
app.use(express.json());



// Static files for the chat app
if (process.env.NODE_ENV === "production") {
  app.use(
    "/projects/chat-app",
    express.static(path.join(__dirname, "dist"),
     {
      setHeaders: (res, filepath) => {
        if (filepath.endsWith(".js")) {
          res.set("Content-Type", "application/javascript");
        } else if (filepath.endsWith(".mjs")) {
          res.set("Content-Type", "application/javascript");
        } else if (filepath.endsWith(".css")) {
          res.set("Content-Type", "text/css");
        }
      },
    })
  );
}

// Other static files
app.use(express.static(path.resolve(__dirname, "public")));


app.use("/projects", projects);


// 404 Page Not Found route
app.use((req, res, next) => {
  res.status(404).render("not-found", { title: "Page Not Found" });
});
// Start server
const server = app.listen(PORT, () => {
  console.log(`Server listening in the port: ${PORT}`);
});

// Configure WebSocket
configureWebSocket(server);
