const mysql = require('mysql2');
const fs = require('fs');

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change to your MySQL username
  password: '', // Change to your MySQL password
  database: 'fitness_app'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Read recipes from JSON file
const recipesData = JSON.parse(fs.readFileSync('../.mgx/src/data/recipes.json', 'utf8'));

// Insert recipes into database
recipesData.forEach(recipe => {
  const { name, category, calories, protein, carbs, fat, prepTime, ingredients, instructions, image } = recipe;
  db.query(
    'INSERT INTO recipes (name, category, calories, protein, carbs, fat, prepTime, ingredients, instructions, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, category, calories, protein, carbs, fat, prepTime, JSON.stringify(ingredients), JSON.stringify(instructions), image],
    (err, result) => {
      if (err) {
        console.error('Error inserting recipe:', err);
      } else {
        console.log(`Inserted recipe: ${name}`);
      }
    }
  );
});

db.end();
