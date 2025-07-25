import e from "express";
import { configDotenv } from "dotenv";
import connectToMongoDB from "./db/ConnectToMongoDB.js";
import helmet from "helmet";
import { validateJsonOnly } from "./middleware/validateJsonOnly.js";
// block controllers
import authRoutes from "./routes/auth.route.js";
import blockRoutes from "./routes/block.route.js";
import classRoutes from "./routes/class.route.js";
//course page controllers
import courseRouter from "./routes/course.route.js";
import yearRouter from "./routes/year.route.js";
// profile controllers
import studentRouter from "./routes/student.route.js";
import settingPlanRoutes from "./routes/seatingPlan.route.js";

const app = e();

configDotenv();

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);
app.use(e.json());
app.use(e.urlencoded({ extended: true }));
app.use(helmet());

// middlewares to prevent non json data to cause error or server crash
app.use(validateJsonOnly);

app.use(e.json({ strict: true,verify: (req, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch {
        throw new SyntaxError("Invalid Input");
      }
    },
  })
);

//  actual Routes begains here

app.get("/", (req, res) => {
  console.log("server is working..");
  
  res.send({ message: " server is working.." });
});

app.use("/api/auth", authRoutes); //Authentication

app.use("/api/block", blockRoutes); // block screen block related routes

app.use("/api/block/:id/class", classRoutes); // block screen classes in blocks related routes

app.use("/api/courses", courseRouter); // students screen courses related routes

app.use("/api/courses/:courseId/years", yearRouter); // student screen years in each course related routes

app.use("/api/courses/:courseId/years/:yearId/students", studentRouter); // student screen years in each course related routes

app.use("/api/seatings", settingPlanRoutes); // settings related routes

// fallback to prevent server crash

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Invalid JSON Error:", err.message);
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// server starts here
(async () => {
  try {
    await connectToMongoDB();
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Error connecting to DB:", error.message);
    process.exit(1);
  }
})();
