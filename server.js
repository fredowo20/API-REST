// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
const res = require("express/lib/response.js");
const { json } = require("express");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Generate Api Key
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Admin Endpoint
app.get("/api/admin", (req, res, next) => {
    var sql = "select * from Admin"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.post("/api/admin/", (req, res, next) => {
    var data = {
        Username: req.body.Username,
        Password : md5(req.body.Password)
    }
    var sql ='INSERT INTO Admin (Username, Password) VALUES (?,?)'
    var params =[data.Username, data.Password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.delete("/api/admin/:Username", (req, res, next) => {
    db.run(
        'DELETE FROM Admin WHERE Username = ?',
        req.params.Username,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

// Company Endpoint
app.get("/api/company", (req, res, next) => {
    var sql = "select * from Company"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/company/:ID", (req, res, next) => {
    var sql = "select * from Company where ID = ?"
    var params = [req.params.ID]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

app.post("/api/company/", (req, res, next) => {
    var data = {
        company_name: req.body.company_name,
    }
    var sql ='INSERT INTO Company (company_name, company_api_key) VALUES (?,?)'
    var params =[data.company_name, between(100,1000)]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

app.delete("/api/company/:ID", (req, res, next) => {
    db.run(
        'DELETE FROM Company WHERE ID = ?',
        req.params.ID,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

// Location Endpoint
app.get("/api/location", (req, res, next) => {
    var sql = "select * from Location"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/location/:apikey", (req, res, next) => {
    let query = 'SELECT Location.ID, Location.company_id, Location.location_name, Location.location_country, Location.location_city, Location.location_meta FROM Location,Company WHERE Company.company_api_key = ? and Location.company_id = Company.ID '
    db.all(query,req.params.apikey , (err,row) => {  
        if(row) {
            res.json({row});   
        }else{
            res.json({message : "error"})       
        }
    })
});

app.get("/api/location/:apikey/:ID", (req, res, next) => {
    let query = 'SELECT Location.ID, Location.company_id, Location.location_name, Location.location_country, Location.location_city, Location.location_meta FROM Location,Company WHERE Company.company_api_key = ? and Location.company_id = Company.ID and Location.ID = ?'
    var params = [req.params.apikey, req.params.ID]
    db.all(query, params, (err,row) => {  
        if(row) {
            res.json({row});   
        }else{
            res.json({message : "error"})       
        }
    })
});

app.post("/api/location/:apikey", (req, res, next) => {
    var data = {
        company_id: req.body.company_id,
        location_name: req.body.location_name,
        location_country : req.body.location_country,
        location_city: req.body.location_city,
        location_meta: req.body.location_meta
    }
    let query = 'SELECT company_api_key FROM Company WHERE ID = ?'
    db.get(query,data.company_id , (err,row) => {  
        if(row.company_api_key == req.params.apikey) {
            var sql ='INSERT INTO Location (company_id, location_name, location_country, location_city, location_meta) VALUES (?,?,?,?,?)'
            var params =[data.company_id, data.location_name, data.location_country,data.location_city, data.location_meta]
            db.run(sql, params, function (err, result) {
                if (err){
                    res.status(400).json({"error": err.message})
                    return;
                }
                res.json({
                    "message": "success",
                    "data": data,
                    "id" : this.lastID
                })
            });
        }else{
            res.status(400).json({message : "error"})        
        }
    })
});

app.put("/api/location/:apikey/:ID", (req, res, next) => {
    var data = {
        company_id: req.body.company_id,
        location_name: req.body.location_name,
        location_country : req.body.location_country,
        location_city: req.body.location_city,
        location_meta: req.body.location_meta
    }
    let query = 'SELECT company_api_key FROM Company WHERE ID = ?'
    db.get(query,data.company_id , (err,row) => {  
        if(row.company_api_key == req.params.apikey) {
            db.run(
                `UPDATE Location set 
                company_id = COALESCE(?,company_id), 
                location_name = COALESCE(?,location_name), 
                location_country = COALESCE(?,location_country),
                location_city = COALESCE(?,location_city),
                location_meta = COALESCE(?,location_meta) 
                WHERE ID = ?`,
                [data.company_id, data.location_name, data.location_country,data.location_city, data.location_meta, req.params.ID],
                function (err, result) {
                    if (err){
                        res.status(400).json({"error": res.message})
                        return;
                    }
                    res.json({
                        message: "success",
                        data: data,
                        changes: this.changes
                    })
            });
        }else{
            res.status(400).json({message : "error"})        
        }
    })
});

app.delete("/api/location/:apikey/:ID", (req, res, next) => {
    let query = 'SELECT Company.company_api_key FROM Company, Location WHERE location.ID = ? AND Company.ID = Location.company_ID '
    db.get(query,req.params.ID , (err,row) => { 
        if(row.company_api_key == req.params.apikey) {
            db.run(
                'DELETE FROM Location WHERE ID = ?',
                req.params.ID,
                function (err, result) {
                    if (err){
                        res.status(400).json({"error": res.message})
                        return;
                    }
                    res.json({"message":"deleted", changes: this.changes})
            });
        }else{
            res.json({
                message:"error",
            })
        }
    })
})

// Sensor Endpoint
app.get("/api/sensor", (req, res, next) => {
    var sql = "select * from Sensor"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

app.get("/api/sensor/:apikey", (req, res, next) => {
    let query = 'SELECT Sensor.location_id, Sensor.sensor_id, Sensor.sensor_name, Sensor.sensor_category, Sensor.sensor_meta, Sensor.sensor_api_key FROM Sensor,Company,Location WHERE Company.company_api_key = ? AND Location.company_id = Company.ID and Location.ID = Sensor.Location_id '
    db.all(query,req.params.apikey , (err,row) => { 
        if(row) {
            res.json({row})   
        }else{
            console.log(row)
            res.json({message : "error"})    
        }
    })
});

app.get("/api/sensor/:apikey/:sensor_id", (req, res, next) => {
    let query = 'SELECT Sensor.location_id, Sensor.sensor_id, Sensor.sensor_name, Sensor.sensor_category, Sensor.sensor_meta, Sensor.sensor_api_key FROM Sensor,Company,Location WHERE Company.company_api_key = ? AND Location.company_id = Company.ID and Location.ID = Sensor.Location_id AND Sensor.sensor_id = ?'
    var params = [req.params.apikey, req.params.sensor_id]
    db.all(query, params, (err,row) => { 
        if(row) {
            res.json({row})   
        }else{
            console.log(row)
            res.json({message : "error"})    
        }
    })
});

app.post("/api/sensor/:apikey", (req, res, next) => {
    var data = {
        location_id: req.body.location_id,
        sensor_name: req.body.sensor_name,
        sensor_category : req.body.sensor_category,
        sensor_meta: req.body.sensor_meta,
    }
    let query = 'SELECT company_api_key FROM company,location WHERE location.ID = ? AND location.company_id = company.ID '
    db.get(query,data.location_id , (err,row) => { 
        if(row.company_api_key == req.params.apikey) {
            var sql ='INSERT INTO Sensor (location_id, sensor_name, sensor_category, sensor_meta, sensor_api_key) VALUES (?,?,?,?,?)'
            var params =[data.location_id, data.sensor_name, data.sensor_category,data.sensor_meta, between(100,1000)]
            db.run(sql, params, function (err, result) {
                if (err){
                    res.status(400).json({"error": err.message})
                    return;
                }
                res.json({
                    "message": "success",
                    "data": data,
                    "id" : this.lastID
                })
            });   
        }else{
            res.json({message : "error"})   
        }
    })
})

app.put("/api/sensor/:apikey/:sensor_id", (req, res, next) => {
    var data = {
        location_id: req.body.location_id,
        sensor_name: req.body.sensor_name,
        sensor_category : req.body.sensor_category,
        sensor_meta: req.body.sensor_meta,
    }
    let query = 'SELECT Company.company_api_key FROM Company,Location,Sensor WHERE Location.company_id = company.ID AND Sensor.location_id = Location.ID AND Sensor.sensor_id = ?'
    db.get(query,req.params.sensor_id , (err,row) => { 
        if(row.company_api_key == req.params.apikey) {
            db.run(
                `UPDATE Sensor set 
                   location_id = COALESCE(?,location_id), 
                   sensor_name = COALESCE(?,sensor_name), 
                   sensor_category = COALESCE(?,sensor_category),
                   sensor_meta = COALESCE(?,sensor_meta)
                   WHERE sensor_id = ?`,
                [data.location_id, data.sensor_name, data.sensor_category,data.sensor_meta, req.params.sensor_id],
                function (err, result) {
                    if (err){
                        res.status(400).json({"error": res.message})
                        return;
                    }
                    res.json({
                        message: "success",
                        data: data,
                        changes: this.changes
                    })
            });
        }else{
            res.json({message:"error"})
        }
    })
})

app.delete("/api/sensor/:apikey/:sensor_id", (req, res, next) => {
    let query = 'SELECT Company.company_api_key FROM Company,Location,Sensor WHERE Location.company_id = company.ID AND Sensor.location_id = Location.ID AND Sensor.sensor_id = ?'
    db.get(query,req.params.sensor_id , (err,row) => { 
        if(row.company_api_key == req.params.apikey) {
            db.run(
                'DELETE FROM Sensor WHERE sensor_id = ?',
                req.params.sensor_id,
                function (err, result) {
                    if (err){
                         res.status(400).json({"error": res.message})
                        return;
                    }
                     res.json({"message":"deleted", changes: this.changes})
    });
        }else{
            res.json({message:"error"})
        }
    })
});

// Sensor data Endpoint
app.get("/api/v1/sensor_data/:apikey/:array", (req, res, next) => {
    let query = 'SELECT * FROM Sensor_data'
    var params = []
    db.get(query,params , (err,row) => { 
        let datos = JSON.parse(row.info)
        console.log(datos)
        if(datos.api_key == req.params.apikey) {
            //var array = new Array();
            (JSON.parse(req.params.array)).forEach(element => {
                //console.log(element)
                let query2 = 'SELECT info FROM Sensor_data,Sensor WHERE Sensor.sensor_id = ?'
                var params2 = [element]
                db.get(query2,params2 , (err,row) => { 
                    if(err) {
                        //res.json({message:"error2"})
                    }else{
                        res.json(JSON.parse(row.info))
                        //console.log(JSON.parse(row.info)+"\n")
                        //array.push(JSON.parse(row.info).json_data)
                        //console.log(array)
                        //console.log(JSON.parse(row.info).json_data)
                    }
                })
            });
            //res.json(array)
        }else{
            res.json({message:"error"})
        }
    })
});

app.post("/api/v1/sensor_data", (req, res, next) => {
    var query = 'SELECT unixepoch();'
    var params = []
    db.get(query,params , (err,row) => { 
        if(err) {
            res.status(400).json({"error": err.message})
            return;
        }else{
            var data = {
                api_key: req.body.api_key,
                json_data: req.body.json_data,
                date: row['unixepoch()']
            }
            var sql ='INSERT INTO Sensor_data (info) VALUES (?)'
            var params = [JSON.stringify(data)]
            db.run(sql, params, function (err, result) {
                if (err){
                    res.status(400).json({"error": err.message})
                    return;
                }
                res.json({
                    "message": "success",
                    "data": data,
                    "id" : this.lastID
                })
            });
        }
    })
})

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});