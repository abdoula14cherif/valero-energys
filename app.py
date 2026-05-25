from flask import Flask, render_template, request, redirect, url_for, session
import requests, os

app = Flask(__name__)
app.secret_key = "velero-secret-2025"

SUPABASE_URL = "https://seegoklunovyuieorkvy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZWdva2x1bm92eXVpZW9ya3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODI3MjYsImV4cCI6MjA5NTI1ODcyNn0.9p2OcUAY25E6XhG4Uq7XYTab_N2FWrg_dtemrUEroeo"
HEADERS = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}

@app.route("/")
def index():
    ref = request.args.get("ref", "")
    return redirect(url_for("register", ref=ref) if ref else url_for("login"))

@app.route("/inscription", methods=["GET","POST"])
def register():
    ref_code = request.args.get("ref", "")
    error = success = ""
    if request.method == "POST":
        full_name = request.form.get("full_name","").strip()
        email     = request.form.get("email","").strip()
        password  = request.form.get("password","")
        confirm   = request.form.get("confirm","")
        ref_code  = request.form.get("ref_code","").strip()
        if not full_name or not email or not password:
            error = "Tous les champs sont obligatoires."
        elif password != confirm:
            error = "Les mots de passe ne correspondent pas."
        elif len(password) < 6:
            error = "Mot de passe minimum 6 caractères."
        else:
            r = requests.post(f"{SUPABASE_URL}/auth/v1/signup", headers=HEADERS,
                json={"email":email,"password":password,"data":{"full_name":full_name,"referral_code":ref_code}})
            d = r.json()
            if d.get("error"):
                error = d.get("error_description", d.get("error"))
            else:
                success = "Compte créé ! Vérifiez votre email."
    return render_template("register.html", ref_code=ref_code, error=error, success=success)

@app.route("/connexion", methods=["GET","POST"])
def login():
    error = success = ""
    if request.method == "POST":
        email    = request.form.get("email","").strip()
        password = request.form.get("password","")
        if not email or not password:
            error = "Email et mot de passe requis."
        else:
            r = requests.post(f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers=HEADERS, json={"email":email,"password":password})
            d = r.json()
            if d.get("error"):
                error = d.get("error_description","Identifiants invalides.")
            else:
                session["access_token"] = d.get("access_token")
                session["user_email"]   = email
                return redirect(url_for("dashboard"))
    return render_template("login.html", error=error, success=success)

@app.route("/dashboard")
def dashboard():
    if "access_token" not in session:
        return redirect(url_for("login"))
    return render_template("dashboard.html", email=session.get("user_email"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
