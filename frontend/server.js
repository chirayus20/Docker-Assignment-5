const express = require("express");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();

// Parse URL-encoded form data and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static("public"));

app.post("/submit", async (req, res) => {
    try {
        // Send form data to the backend Flask API
        const response = await axios.post(
            "http://localhost:9000/process", // Use localhost if not in Docker
            req.body
        );
        // If the backend returns success, redirect to the success page
        if (response.data.success) {
            return res.redirect("/success.html");
        }

        // Throw an error if backend returns failure
        throw new Error(response.data.message);
    } catch (error) {
        // On error, check if the Flask backend is down/closed
        let errorMsg = "Submission Failed";
        if (error.code === "ECONNREFUSED" || !error.response) {
            errorMsg = "Submission failed: Connection error";
        } else {
            errorMsg = error.response?.data?.message || error.message || "Submission Failed";
        }

        // Read the original form HTML
        let html = fs.readFileSync(
            path.join(__dirname, "public", "index.html"),
            "utf8"
        );

        // Format error inside styled alert element
        const errorHtml = `<div class="error-alert">${errorMsg}</div>`;

        // Insert error message into the HTML placeholder and send it back
        html = html.replace("<!-- ERROR_MESSAGE -->", errorHtml);

        return res.status(500).send(html);
    }
});

app.listen(8000, () => {
    console.log("Frontend running on port 8000");
});