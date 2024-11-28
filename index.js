const express = require('express')
const mysql = require('mysql2')

require('dotenv').config()

const app = express();
app.use(express.json());

app.listen(3000);


const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PWD
})

connection.connect((err) => {
    if (err) {
        console.error("Connection Error", err)
        return
    }
    console.log("Connected to Server Successfully")
});

connection.query('USE test_db', (err) => {
    if (err) {
        console.error("Cannot use the selected database");
        return;
    }
    console.log("Using the selected database");

})

app.get('/', (req, res) => {
    res.send("Hello There.")
})

app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || typeof (latitude) !== 'number' || typeof (longitude) !== 'number') {
        return res.status(400).json({
            error: "All the mentioned fields are required and should be valid"
        })
    }

    const ins_query = `INSERT INTO SCHOOLS (NAME,ADDRESS,LATITUDE,LONGITUDE) VALUES (?,?,?,?)`;

    connection.query(ins_query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error("Error inserting values into the database");
            return res.status(500).json({ error: "Error occurred while adding School details" })
        }

        res.status(201).json({
            message: "School Addition Successful",
            school: result
        });
    })
});

function haversine_dist(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

app.get('/listSchools', (req, res) => {

    const { lat, long } = req.query;
    if (!lat || !long) {
        return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const userLat = parseFloat(lat);
    const userLong = parseFloat(long);

    connection.query("SELECT * FROM SCHOOLS ", (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Cannot get the school list" })
        }

        results.forEach(school => {
            const schoolLat = school.LATITUDE;
            const schoolLong = school.LONGITUDE;
            school.distance = haversine_dist(userLat, userLong, schoolLat, schoolLong);
        });


        results.sort((a, b) => a.distance - b.distance);

        res.status(200).json({ list: results })
    })
})
