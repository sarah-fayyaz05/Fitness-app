const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const validator = require('validator');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // your MySQL username
  password: '', // your MySQL password
  database: 'fitness_app'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});


// -------------------- TABLE CREATION --------------------

// Users Table
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL
  )
`, (err) => {
  if (err) console.error('Error creating users table:', err);
});

// Profiles Table
db.query(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age INT,
    weight FLOAT,
    height FLOAT,
    gender ENUM('male', 'female', 'other'),
    health_goal ENUM('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'),
    activity_level ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating profiles table:', err);
});

// Recipes Table
db.query(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ingredients TEXT,
    instructions TEXT,
    calories INT,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack')
  )
`, (err) => {
  if (err) console.error('Error creating recipes table:', err);
});

// Diet Plans Table
db.query(`
  CREATE TABLE IF NOT EXISTS diet_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date_created DATE DEFAULT (CURRENT_DATE),
    total_calories INT,
    goal_type ENUM('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating diet_plans table:', err);
});

// Diet Plan Meals Table
db.query(`
  CREATE TABLE IF NOT EXISTS diet_plan_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    recipe_id INT NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
    portion_size VARCHAR(50),
    frequency VARCHAR(50),
    FOREIGN KEY (plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating diet_plan_meals table:', err);
});

// Progress Tracking Table
db.query(`
  CREATE TABLE IF NOT EXISTS progress_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE DEFAULT (CURRENT_DATE),
    weight FLOAT,
    calories_consumed INT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating progress_tracking table:', err);
});


// -------------------- AUTH ROUTES --------------------

// Secure Signup with password validation + hashing
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Email validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Password strength validation
  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })) {
    return res.status(400).json({
      error: 'Password must include at least 8 characters, one uppercase, one lowercase, one number, and one special character.'
    });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered.' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ user: { id: result.insertId, email, name } });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error hashing password.' });
  }
});


// Secure Login with password comparison
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  });
});


// -------------------- PROFILE ROUTES --------------------
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM profiles WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ profile: results[0] || null });
  });
});

app.post('/api/profile', (req, res) => {
  const { userId, age, weight, height, gender, healthGoal, activityLevel } = req.body;
  db.query(
    `INSERT INTO profiles (user_id, age, weight, height, gender, health_goal, activity_level)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
     age=VALUES(age), weight=VALUES(weight), height=VALUES(height), gender=VALUES(gender),
     health_goal=VALUES(health_goal), activity_level=VALUES(activity_level)`,
    [userId, age, weight, height, gender, healthGoal, activityLevel],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});


// -------------------- RECIPE ROUTES --------------------
app.get('/api/recipes', (req, res) => {
  db.query('SELECT * FROM recipes', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ recipes: results });
  });
});


// -------------------- SERVER --------------------
app.listen(3001, () => {
  console.log('Backend server running on port 3001');
});
