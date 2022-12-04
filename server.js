// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
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
        'DELETE FROM user WHERE Username = ?',
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

app.get("/api/location/:ID", (req, res, next) => {
    var sql = "select * from Location where ID = ?"
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

app.post("/api/location/", (req, res, next) => {
    var data = {
        company_id: req.body.company_id,
        location_name: req.body.location_name,
        location_country : req.body.location_country,
        location_city: req.body.location_city,
        location_meta: req.body.location_meta
    }
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
})

app.put("/api/location/:ID", (req, res, next) => {
    var data = {
        company_id: req.body.company_id,
        location_name: req.body.location_name,
        location_country : req.body.location_country,
        location_city: req.body.location_city,
        location_meta: req.body.location_meta
    }
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
})

app.delete("/api/location/:ID", (req, res, next) => {
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

app.get("/api/sensor/:sensor_id", (req, res, next) => {
    var sql = "select * from Sensor where sensor_id = ?"
    var params = [req.params.sensor_id]
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

app.post("/api/sensor/", (req, res, next) => {
    var data = {
        location_id: req.body.location_id,
        sensor_name: req.body.sensor_name,
        sensor_category : req.body.sensor_category,
        sensor_meta: req.body.sensor_meta,
    }
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
})

app.put("/api/sensor/:sensor_id", (req, res, next) => {
    var data = {
        location_id: req.body.location_id,
        sensor_name: req.body.sensor_name,
        sensor_category : req.body.sensor_category,
        sensor_meta: req.body.sensor_meta,
    }
    db.run(
        `UPDATE Sensor set 
           location_id = COALESCE(?,location_id), 
           sensor_name = COALESCE(?,sensor_name), 
           sensor_category = COALESCE(?,sensor_category),
           sensor_meta = COALESCE(?,sensor_meta),
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
})

app.delete("/api/sensor/:sensor_id", (req, res, next) => {
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
})

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});