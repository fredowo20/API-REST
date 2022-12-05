var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db4.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run('PRAGMA foreign_keys = ON;')
        db.run(`CREATE TABLE IF NOT EXISTS Admin (
            Username TEXT PRIMARY KEY, 
            Password TEXT
            )`);
        db.run(`CREATE TABLE IF NOT EXISTS Company (
            ID INTEGER PRIMARY KEY AUTOINCREMENT, 
            company_name TEXT, 
            company_api_key TEXT
            )`);
        db.run(`CREATE TABLE IF NOT EXISTS Location (
            ID INTEGER PRIMARY KEY AUTOINCREMENT, 
            company_id INTEGER, 
            location_name TEXT, 
            location_country TEXT, 
            location_city TEXT, 
            location_meta TEXT,
            FOREIGN KEY(company_id) REFERENCES Company(ID)
            )`);
        db.run(`CREATE TABLE IF NOT EXISTS Sensor (
            sensor_id INTEGER PRIMARY KEY AUTOINCREMENT, 
            location_id INTEGER, 
            sensor_name TEXT, 
            sensor_category TEXT, 
            sensor_meta TEXT, 
            sensor_api_key TEXT,
            FOREIGN KEY(location_id) REFERENCES Location(ID)
            )`);
        db.run(`CREATE TABLE IF NOT EXISTS Sensor_data (
            info TEXT
            )`);
    }
});


module.exports = db
