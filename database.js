/* * * * * * * * * * * * * * * * * * * * * *  
 *             DATABASE TABLES             *
 * * * * * * * * * * * * * * * * * * * * * * 
    
create table users(user_id SERIAL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL, meetings text[], tentative_meetings jsonb);
create table meetings( meeting_id SERIAL PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL, location TEXT NOT NULL, description TEXT NOT NULL, attendees text[]);

Example tables:
        
user_id  |  first_name   |    last_name     |            email            |       meetings      
---------+---------------+------------------+-----------------------------+----------------------    
1        |    Emma       |     Martinez     |   emmaMartinez@gmail.com    |  ["Music Arts Club"]


meeting_id   |       title         |        date         |    start_time    |    end_time    |    location     |         description         |                       attendees  
-------------+---------------------+---------------------+------------------+----------------+-----------------+-----------------------------+-------------------------------------------------------
1            |   Music Arts Club   |     11/09/2021      |      9:00 AM     |    10:00 AM    |      Zoom       |   Music Arts Club Meeting   |   ["emmaMartinez@gmail.com", "sammyRemerez@gmail.com"]

*/

const pgp = require("pg-promise")({
  connect(client) {
    console.log("Connected to database:", client.connectionParameters.database);
  },

  disconnect(client) {
    console.log(
      "Disconnected from database:",
      client.connectionParameters.database
    );
  },
});

const username = "postgres";
const password = "admin";

const url =
  process.env.DATABASE_URL || `postgres://${username}:${password}@localhost/`;
const db = pgp(url);

async function connectAndRun(task) {
  let connection = null;

  try {
    connection = await db.connect();
    return await task(connection);
  } catch (e) {
    // eslint-disable-next-line no-useless-catch
    throw e;
  } finally {
    try {
      connection.done();
    } catch (ignored) {
      // eslint-disable-next-line no-empty
    }
  }
}

//Database functions
async function addUser(first_name, last_name, email) {
  return await connectAndRun((db) =>
    db.none(
      "INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3);",
      [first_name, last_name, email]
    )
  );
}

async function getUser(email) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM users WHERE email = $1;", [email])
  );
}

async function addMeeting(
  title,
  date,
  start_time,
  end_time,
  location,
  description,
  attendees
) {
  return await connectAndRun((db) =>
    db.any(
      "INSERT INTO meetings (title, date, start_time, end_time, location, description, attendees) VALUES ($1, $2, $3, $4, $5, $6, $7);",
      [title, date, start_time, end_time, location, description, attendees]
    )
  );
}

async function getMeetings(meeting_id) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

async function delMeeting(title, email) {
  return await connectAndRun((db) =>
    db.none("DELETE FROM meetings where title = $1 and email = $2;", [
      title,
      email,
    ])
  );
}

module.exports = {
  addUser,
  getUser,
  addMeeting,
  getMeetings,
  delMeeting,
};
