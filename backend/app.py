import os, json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

FALLBACKS = {
    "career": [
        "Reduce the decision to one question you can actually answer today.",
        "Separate what you know from what you are assuming. One concrete fact can make the next step clearer.",
        "Before choosing, identify what would need to be true for each option to feel sustainable."
    ],
    "relationships": [
        "Notice what was actually said before deciding what the silence means.",
        "Ask one honest question instead of trying to predict the other person's answer.",
        "Clarity often grows when you separate your needs from your fears."
    ],
    "purpose": [
        "You do not need to solve your future today. Look for the next experiment that gives you useful evidence.",
        "Separate the path you want from the path you think you are expected to choose.",
        "A small decision can be more useful than a perfect long-term plan."
    ],
    "family": [
        "Separate what belongs to you to solve from what belongs to someone else.",
        "Care and boundaries can coexist. Identify one thing you can communicate clearly.",
        "You do not have to resolve every family tension in one conversation."
    ],
    "wellbeing": [
        "Treat today's energy as information rather than a verdict about yourself.",
        "Choose one thing that would make today 10% easier and let the rest wait.",
        "Notice what is draining you before deciding what needs to change."
    ]
}

def fallback(focus, mood, day):
    items = FALLBACKS.get(focus, FALLBACKS["purpose"])
    text = items[(max(int(day or 1), 1)-1) % len(items)]
    prefix = {
        "clear": "You're showing more clarity today.",
        "unsure": "There is still some uncertainty to work with.",
        "heavy": "Today may be better for reflection than forcing a decision."
    }.get(mood, "Take a moment to notice what feels most important today.")
    return {"reflection": f"{prefix} {text}",
            "question": "What is one small thing you can clarify today?",
            "mode": "adaptive-demo"}

def live_ai(payload):
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    try:
        from openai import OpenAI
        client = OpenAI(api_key=key)
        system = """You are AstroCompanion's adaptive reflection layer.
Do not claim supernatural certainty, predict the future, diagnose health conditions,
or give financial/legal/medical advice. You are not a therapist or astrologer.
Use the user's concern and check-in to create a grounded reflection.
Return JSON with exactly: reflection (1-2 sentences) and question (one short question)."""
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5-mini"),
            input=[
                {"role":"system","content":system},
                {"role":"user","content":
                 f"Topic: {payload.get('focus','purpose')}\n"
                 f"Day: {payload.get('day',1)} of 7\n"
                 f"Concern: {str(payload.get('concern',''))[:1000]}\n"
                 f"Check-in: {payload.get('mood','unsure')}"}
            ],
            text={"format":{"type":"json_schema","name":"journey_reflection","strict":True,
                "schema":{"type":"object","properties":{
                    "reflection":{"type":"string"},
                    "question":{"type":"string"}},
                    "required":["reflection","question"],"additionalProperties":False}}}
        )
        result = json.loads(response.output_text)
        result["mode"] = "live-ai"
        return result
    except Exception as exc:
        print("AI unavailable; using fallback:", exc)
        return None

@app.get("/api/health")
def health():
    return jsonify({"ok": True})

@app.post("/api/journey")
def journey():
    payload = request.get_json(silent=True) or {}
    result = live_ai(payload) or fallback(
        payload.get("focus","purpose"),
        payload.get("mood","unsure"),
        payload.get("day",1)
    )
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT","5000")), debug=True)
