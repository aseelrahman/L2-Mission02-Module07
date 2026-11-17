import "dotenv/config";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool, Result } from "pg";

const app: Application = express();
const port = 5005;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED,
});

// console.log(pool);

const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            age INT,
            is_Active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
            `);
    console.log("Database connected!!");
  } catch (error) {
    console.log(error);
  }
};

initDB();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  console.log(req);
  // res.send("This is root route.");
  res.status(200).json({
    success: true,
    message: "This is root route.",
    author: "PH",
  });
});

app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    //   console.log(req.body);
    const { name, email, age, password } = req.body;
    //   console.log(password);
    const result = await pool.query(
      `
        INSERT INTO users(name,email,password,age) VALUES($1,$2,$3,$4) RETURNING *
        `,
      [name, email, password, age],
    );
    console.log(result);
    res.status(201).json({
      success: true,
      message: "User Created",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
      data: error,
    });
  }
});

app.listen(port, () => {
  console.log(`The Express server is running on ${port}`);
});
