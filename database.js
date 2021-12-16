/* * * * * * * * * * * * * * * * * * * * * *  
 *             DATABASE TABLES             *
 * * * * * * * * * * * * * * * * * * * * * * 
    
create table users(user_id SERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL, meetings text[], tentative_meetings text[]);
create table meetings( meeting_id SERIAL PRIMARY KEY, title TEXT NOT NULL, date TEXT, start_time TIME NOT NULL, end_time TIME NOT NULL, location TEXT NOT NULL, description TEXT, attendees text[]);

Example tables:
        
user_id  |       full_name       |            email            |                          meetings        
---------+-----------------------+------------------+---------------------------------------------------------------------------------
1        |    Emma  Martinez     |   emmaMartinez@gmail.com    |   [{meeting_id: "1", event_id: "tsgsjb6koud6il13lpiv8iklmc"}]       | 


meeting_id   |       title         |        date         |    start_time    |    end_time    |    location     |         description         |                       attendees                        |         event_id              |         timezone
-------------+---------------------+---------------------+------------------+----------------+-----------------+-----------------------------+--------------------------------------------------------+-----------------------------------------------------
1            |   Music Arts Club   |     11/09/2021      |      9:00 AM     |    10:00 AM    |      Zoom       |   Music Arts Club Meeting   |   ["emmaMartinez@gmail.com", "sammyRemerez@gmail.com"] | tsgsjb6koud6il13lpiv8iklmc    |           EST

*/

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

let secrets = require("././secrets.json");
let username = secrets.username;
let password = secrets.password;

const url = `postgres://${username}:${password}@ec2-52-201-195-11.compute-1.amazonaws.com:5432/d5jgvmlhrb3udn?sslmode=require`;
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

// Add a new user to the database
async function addUser(full_name, email) {
  return await connectAndRun((db) =>
    db.none(
      "INSERT INTO users (full_name, email, meetings) VALUES ($1, $2, $3);",
      [full_name, email, []]
    )
  );
}

// Get a user from the database
async function getUser(email) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM users WHERE email = $1;", [email])
  );
}

// Delete a user from the database
async function delUser(email) {
  return await connectAndRun((db) =>
    db.none("DELETE FROM users where email = $1;", [email])
  );
}

// Add a meeting to the database
async function addMeeting(
  event_id,
  title,
  date,
  timeZone,
  start_time,
  end_time,
  location,
  description,
  attendees
) {
  return await connectAndRun((db) =>
    db.any(
      "INSERT INTO meetings (title, date, start_time, end_time, location, description, attendees, event_id, timeZone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING meeting_id;",
      [
        title,
        date,
        start_time,
        end_time,
        location,
        description,
        attendees,
        event_id,
        timeZone,
      ]
    )
  );
}

// Get a meeting from the database
async function getMeeting(meeting_id) {
  return await connectAndRun((db) =>
    db.any("SELECT * FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

// Delete a meeting from the database
async function delMeeting(meeting_id) {
  return await connectAndRun((db) =>
    db.none("DELETE FROM meetings where meeting_id = $1;", [meeting_id])
  );
}

// Update a meeting in the database
async function updateMeetings(meetings, email) {
  return await connectAndRun((db) =>
    db.any("UPDATE users SET meetings = $1 where email = $2;", [
      meetings,
      email,
    ])
  );
}

// Get a user's meetings from the database
async function getUserMeetings(email) {
  return await connectAndRun((db) =>
    db.any("SELECT meetings FROM users where email = $1;", [email])
  );
}

module.exports = {
  addUser,
  getUser,
  delUser,
  addMeeting,
  getMeeting,
  delMeeting,
  getUserMeetings,
  updateMeetings,
};
