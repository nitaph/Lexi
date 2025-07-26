// developer/saveBigFiveForm.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

console.log("⚙️  Starting saveBigFiveForm diagnostic script");

// 1️⃣ Load the JSON and report its size
let formJson;
const jsonPath = path.resolve(__dirname, "thesis_test1_form.json");
try {
  const raw = fs.readFileSync(jsonPath, "utf8");
  formJson = JSON.parse(raw);
  console.log("📄 Loaded form JSON from", jsonPath);
  console.log("📏 JSON size:", raw.length, "characters");
} catch (e) {
  console.error("❌ Error loading or parsing JSON at", jsonPath, ":", e);
  process.exit(1);
}

const API_URL = "http://127.0.0.1:5001/api/forms";
const HEALTH_URL = "http://127.0.0.1:5001/health";

(async () => {
  // 2️⃣ Health check
  try {
    console.log("🔗 Checking health at", HEALTH_URL);
    const health = await axios.get(HEALTH_URL, { timeout: 5000 });
    console.log("✅ Health check:", health.status, "-", health.data);
  } catch (e) {
    console.error("❌ Health check failed:", e.message);
  }

  // 3️⃣ Attempt to save the form
  try {
    console.log("🚀 Sending POST to", API_URL);
    const response = await axios.post(
      API_URL,
      { form: formJson },
      { timeout: 10000 }
    );
    console.log("✅ Form saved successfully!", response.data);
  } catch (err) {
    console.error(
      "❌ Failed to save form:",
      err.response?.data || err.message || err
    );
  }
})();
