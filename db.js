const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kiosko.sqlite3');

db.serialize(() => {
  // Tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      last_access_date DATETIME
    )
  `);

  // Tabla de feeds
  db.run(`
    CREATE TABLE IF NOT EXISTS feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      public INTEGER,
      topics TEXT,
      type TEXT,
      editorial TEXT,
      language TEXT,
      user_id INTEGER,
      created_at DATETIME,
      updated_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Verificar si el usuario ya existe
  const usernameToInsert = 'kiosko';
  const passwordToInsert = '$2b$10$5w6tLi3k1PMVRmqM2O11LuHEqaWiViqOlfBaJlX/d1ZzKZD5MxBQu';

  db.get(`SELECT * FROM users WHERE username = ?`, [usernameToInsert], (err, user) => {
    if (err) {
      console.error('Error al verificar el usuario:', err);
      return;
    }

    if (!user) {
      db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [usernameToInsert, passwordToInsert], function(err) {
        if (err) {
          console.error('Error al insertar el usuario:', err);
        } else {
          console.log('Usuario creado con éxito con ID:', this.lastID);
        }
      });
    } else {
      console.log('El usuario ya existe:', user);
    }
  });

  // verificar si noticia ya existe
  const title = 'Sports';
  const topics = 'swimming,cycling,tennis,boxing,shooting';
  const type = 'Deportiva';
  const editorial = 'Milenio';
  const language = 'Deportiva';
  const userId = 1;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  db.get(`SELECT * FROM feeds WHERE name = ? AND topics = ?`, [title, topics], (err, feed) => {
    if (err) {
      console.error('Error al verificar el feed:', err);
      return;
    }
  
    if (!feed) {
      db.run(`INSERT INTO feeds (name, topics, type, editorial, language, user_id, created_at, updated_at, public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, topics, type, editorial, language, userId, currentDate, currentDate, 0],
        function(err) {
          if (err) {
            console.error('Error al insertar el feed:', err);
          } else {
            console.log('Feed creado con éxito con ID:', this.lastID);
          }
        }
      );
    } else {
      console.log('El feed ya existe:', feed);
    }
  });

    // verificar si noticia 2 ya existe
    const title2 = 'Sports';
    const topics2 = 'equestrian, jumping, sailing, rhythmic, gymnastics';
    const type2 = 'Deportiva';
    const editorial2 = 'Milenio';
    const language2 = 'Deportiva';
    const userId2 = 1;
    const currentDate2 = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    db.get(`SELECT * FROM feeds WHERE name = ? AND topics = ?`, [title2, topics2], (err, feed) => {
      if (err) {
        console.error('Error al verificar el feed:', err);
        return;
      }
    
      if (!feed) {
        db.run(`INSERT INTO feeds (name, topics, type, editorial, language, user_id, created_at, updated_at, public) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title2, topics2, type2, editorial2, language2, userId2, currentDate2, currentDate2, 0],
          function(err) {
            if (err) {
              console.error('Error al insertar el feed:', err);
            } else {
              console.log('Feed creado con éxito con ID:', this.lastID);
            }
          }
        );
      } else {
        console.log('El feed ya existe:', feed);
      }
    });
  
});


module.exports = db;
