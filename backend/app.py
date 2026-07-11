from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Connect to MongoDB Atlas using MONGO_URI from .env
client = MongoClient(os.getenv("MONGO_URI"))
db = client["mydb"]  # Use the 'mydb' database
collection = db["test"]  # Use the 'test' collection

@app.route("/process", methods=["POST"])
def process():
    try:
        # Get form data from request
        data = request.get_json()
        name = data.get("name")
        password = data.get("password")

        # Insert the data into MongoDB
        collection.insert_one({
            "name": name,
            "password": password
        })
        # print(f"Received data: Name={name}, Password={password}")
        try:
            client.admin.command('ping')
            print("MongoDB connected successfully")
        except Exception as e:
            print("MongoDB connection error:", e)
        

        # Return success response
        return jsonify({
            "success": True
        })

    except Exception as e:
        # Return error response in case of failure
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route("/")
def home():
    return "Backend Running Successfully"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)  # Run Flask backend on port 9000