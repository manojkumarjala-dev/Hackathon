import os
import json
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

VAPI_API_KEY = os.getenv("VAPI_API_KEY")
VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
LOGS_PATH = os.path.join(os.path.dirname(__file__), "logs.json")
AGENT_ID = "agent_3"  # Your agent ID

def current_timestamp():
    return datetime.utcnow().isoformat() + "Z"

def update_agent_log(message, state=None):
    try:
        with open(LOGS_PATH, "r") as f:
            logs_data = json.load(f)
    except FileNotFoundError:
        logs_data = []

    agent = next((a for a in logs_data if a["id"] == AGENT_ID), None)
    if not agent:
        agent = {
            "id": AGENT_ID,
            "name": "interviewer",
            "state": "idle",
            "last_updated": current_timestamp(),
            "logs": []
        }
        logs_data.append(agent)

    agent["logs"].append({
        "timestamp": current_timestamp(),
        "message": message
    })

    if state:
        agent["state"] = state
        agent["last_updated"] = current_timestamp()

    with open(LOGS_PATH, "w") as f:
        json.dump(logs_data, f, indent=2)

@app.route("/get-interview-config", methods=["GET"])
def get_interview_config():
    update_agent_log("Interview started for a candidate.", state="processing")
    return jsonify({
        "interview_type": "technical",
        "job_description": "We are hiring a React developer with experience in building scalable frontend applications and a strong grasp of design patterns."
    })

@app.route("/call-details", methods=["GET"])
def get_call_details():
    call_id = request.args.get("call_id")
    if not call_id:
        return jsonify({"error": "Call ID is required"}), 400

    try:
        url = f"https://api.vapi.ai/call/{call_id}"
        headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({
                "error": f"Vapi API returned status {response.status_code}",
                "details": response.text
            }), response.status_code

        result = response.json()
        analysis = result.get("analysis", {})
        summary = result.get("summary")
        success_data = analysis.get("successEvaluation", "")

        # Parse success evaluation
        success_score = None
        success_reason = ""
        decision = "Undetermined"

        if success_data:
            parts = [p.strip() for p in success_data.split(",", 1)]
            if len(parts) == 2:
                try:
                    success_score = int(parts[0])
                    success_reason = parts[1]
                    decision = "Hire" if success_score > 7 else "No Hire"
                except ValueError:
                    success_reason = success_data
            else:
                success_reason = success_data

        # Log interview end and decision
        update_agent_log("Interview completed for a candidate.", state="idle")
        if decision != "Undetermined":
            update_agent_log(f"Decision made for candidate: {decision}")

        return jsonify({
            "analysis": analysis,
            "summary": summary,
            "successEvaluation": {
                "score": success_score,
                "reason": success_reason
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

candidates = []

@app.route("/api/candidates", methods=["POST"])
def save_candidate():
    data = request.get_json()

    required_fields = ["firstName", "lastName", "email", "phoneNumber", "callId", "timestamp"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required candidate fields"}), 400

    candidate = {
        "first_name": data["firstName"],
        "last_name": data["lastName"],
        "email": data["email"],
        "phone_number": data["phoneNumber"],
        "call_id": data["callId"],
        "timestamp": data["timestamp"]
    }

    candidates.append(candidate)
    print("Candidate received:", candidate)

    return jsonify({"status": "Candidate data saved successfully"}), 200
AGENTS_FILE = os.path.join(os.path.dirname(__file__), "logs.json")
JOBS_FILE = os.path.join(os.path.dirname(__file__), "jobs.json")

# Load functions
def load_agents():
    with open(AGENTS_FILE, "r") as f:
        return json.load(f)

def load_jobs():
    with open(JOBS_FILE, "r") as f:
        return json.load(f)

# Save function (if needed elsewhere)
def save_agents(data):
    with open(AGENTS_FILE, "w") as f:
        json.dump(data, f, indent=2)

# Flask routes replacing FastAPI endpoints

@app.route("/api/agents", methods=["GET"])
def get_agents():
    return jsonify(load_agents())

@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    return jsonify(load_jobs())

if __name__ == "__main__":
    app.run(debug=True, port=5001)

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# VAPI_API_KEY = os.getenv("VAPI_API_KEY")
# VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
# LOGS_PATH = os.path.join(os.path.dirname(__file__), "logs.json")
# AGENT_ID = "agent_3"  # Your agent ID

# def current_timestamp():
#     return datetime.utcnow().isoformat() + "Z"

# def update_agent_log(message, state=None):
#     try:
#         with open(LOGS_PATH, "r") as f:
#             logs_data = json.load(f)
#     except FileNotFoundError:
#         logs_data = []

#     agent = next((a for a in logs_data if a["id"] == AGENT_ID), None)
#     if not agent:
#         agent = {
#             "id": AGENT_ID,
#             "name": "interviewer",
#             "state": "idle",
#             "last_updated": current_timestamp(),
#             "logs": []
#         }
#         logs_data.append(agent)

#     agent["logs"].append({
#         "timestamp": current_timestamp(),
#         "message": message
#     })

#     if state:
#         agent["state"] = state
#         agent["last_updated"] = current_timestamp()

#     with open(LOGS_PATH, "w") as f:
#         json.dump(logs_data, f, indent=2)

# @app.route("/get-interview-config", methods=["GET"])
# def get_interview_config():
#     update_agent_log("Interview started for a candidate.", state="processing")
#     return jsonify({
#         "interview_type": "technical",
#         "job_description": "We are hiring a React developer with experience in building scalable frontend applications and a strong grasp of design patterns."
#     })

# @app.route("/call-details", methods=["GET"])
# def get_call_details():
#     call_id = request.args.get("call_id")
#     if not call_id:
#         return jsonify({"error": "Call ID is required"}), 400

#     try:
#         url = f"https://api.vapi.ai/call/{call_id}"
#         headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
#         response = requests.get(url, headers=headers)

#         if response.status_code != 200:
#             return jsonify({
#                 "error": f"Vapi API returned status {response.status_code}",
#                 "details": response.text
#             }), response.status_code

#         result = response.json()
#         analysis = result.get("analysis", {})
#         summary = result.get("summary")
#         success_data = analysis.get("successEvaluation", "")

#         # Parse success evaluation
#         success_score = None
#         success_reason = ""
#         decision = "Undetermined"

#         if success_data:
#             parts = [p.strip() for p in success_data.split(",", 1)]
#             if len(parts) == 2:
#                 try:
#                     success_score = int(parts[0])
#                     success_reason = parts[1]
#                     decision = "Hire" if success_score > 7 else "No Hire"
#                 except ValueError:
#                     success_reason = success_data
#             else:
#                 success_reason = success_data

#         # Log interview end and decision
#         update_agent_log("Interview completed for a candidate.", state="idle")
#         if decision != "Undetermined":
#             update_agent_log(f"Decision made for candidate: {decision}")

#         return jsonify({
#             "analysis": analysis,
#             "summary": summary,
#             "successEvaluation": {
#                 "score": success_score,
#                 "reason": success_reason
#             }
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    
# candidates = []

# @app.route("/api/candidates", methods=["POST"])
# def save_candidate():
#     data = request.get_json()

#     required_fields = ["firstName", "lastName", "email", "phoneNumber", "callId", "timestamp"]
#     if not all(field in data for field in required_fields):
#         return jsonify({"error": "Missing required candidate fields"}), 400

#     candidate = {
#         "first_name": data["firstName"],
#         "last_name": data["lastName"],
#         "email": data["email"],
#         "phone_number": data["phoneNumber"],
#         "call_id": data["callId"],
#         "timestamp": data["timestamp"]
#     }

#     candidates.append(candidate)
#     print("Candidate received:", candidate)

#     return jsonify({"status": "Candidate data saved successfully"}), 200


# if __name__ == "__main__":
#     app.run(debug=True, port=5001)