import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT;
const cs = process.env.CS;

const pool = new Pool({
  connectionString: cs,
  ssl: {
    rejectUnauthorized: false,
  },
});
pool.connect();

app.post("/api/postusers", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedpassword = bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO projusers(email, password) VALUES($1,$2)`,
      [email, hashedpassword]
    );
    if (!result) {
      throw new Error("Failed to query into the table: projusers");
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(`${error}`);
  }
});

app.get("/api/getusers", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM projusers`);
    if (!result) {
      throw new Error("Error getting users data");
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(`${error}`);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const users =
      await sql`SELECT id, email, password FROM projusers WHERE email = ${email}`;
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/postitems", async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO projitems(name,description,price,stock) VALUES($1,$2,$3,$4)`,
      [name, description, price, stock]
    );
    if (!result) {
      throw new Error("Error posting items");
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(`${error}`);
  }
});

app.get("/api/getitems", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM projitems`);
    if (!result) {
      throw new Error("Error getting items");
    } else {
      res.json(result);
    }
  } catch (error) {
    console.log(`${error}`);
  }
});

app.delete("/api/deleteitems/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(`DELETE * FROM projitems WHERE id=$1`, [
      id,
    ]);
    if (!result) {
      throw new Error("Error deleting item");
    } else {
      return true;
    }
  } catch (error) {
    console.log(`${error}`);
  }
});

app.put("/api/updateitems", async (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
