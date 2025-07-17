import mysql from "mysql";

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "meetbook",
    port:3306,
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection error:", err);
        process.exit(1); // Exit app if DB connection fails
    }
    console.log("MySQL connected successfully!");
});