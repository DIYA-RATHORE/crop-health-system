import { mockFarmer, mockFields, mockWeather, mockHistory, mockAlerts } from "../data/mockData";

// Helper to simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper for local storage storage keys (Rebranded)
const KEYS = {
  FARMER: "crop_health_system_farmer",
  FIELDS: "crop_health_system_fields",
  HISTORY: "crop_health_system_history",
  ALERTS: "crop_health_system_alerts"
};

// Initialize localStorage with mock data if not present
const initStorage = () => {
  if (!localStorage.getItem(KEYS.FARMER)) {
    localStorage.setItem(KEYS.FARMER, JSON.stringify(mockFarmer));
  }
  if (!localStorage.getItem(KEYS.FIELDS)) {
    localStorage.setItem(KEYS.FIELDS, JSON.stringify(mockFields));
  }
  if (!localStorage.getItem(KEYS.HISTORY)) {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(mockHistory));
  }
  if (!localStorage.getItem(KEYS.ALERTS)) {
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(mockAlerts));
  }
};

initStorage();

export const saveFarmer = async (profileData) => {
  await delay(800);
  localStorage.setItem(KEYS.FARMER, JSON.stringify(profileData));
  return profileData;
};

export const getFarmer = async () => {
  await delay(500);
  return JSON.parse(localStorage.getItem(KEYS.FARMER));
};

export const getFields = async () => {
  await delay(600);
  return JSON.parse(localStorage.getItem(KEYS.FIELDS));
};

export const createField = async (fieldData) => {
  await delay(800);
  const fields = JSON.parse(localStorage.getItem(KEYS.FIELDS)) || [];
  const newField = {
    id: `field-${Date.now()}`,
    currentRisk: "Low",
    lastAnalysis: "Never",
    diseaseDetected: "Healthy",
    severity: "None",
    ...fieldData
  };
  fields.push(newField);
  localStorage.setItem(KEYS.FIELDS, JSON.stringify(fields));
  return newField;
};

export const analyzeCrop = async (photoData, cropType, fieldId) => {
  await delay(1200); // simulate analysis delay
  const fields = JSON.parse(localStorage.getItem(KEYS.FIELDS)) || [];
  const history = JSON.parse(localStorage.getItem(KEYS.HISTORY)) || [];
  const alerts = JSON.parse(localStorage.getItem(KEYS.ALERTS)) || [];
  
  // Custom mock analysis depending on the crop from our 24+ crop database
  let disease = "Leaf Spot Pathogen";
  let confidence = 87;
  let risk = "High";
  let severity = "Moderate";
  let why = [
    "Fungal spore spots identified on the leaf surface",
    "High relative humidity matching pathogen germination conditions",
    "Local cases of leaf spot reported in nearby fields"
  ];
  let advice = [
    "Prune lower infected leaves to clear airflow.",
    "Avoid base water clogging and overhead leaf wetting.",
    "Treat with organic neem-oil spray or consult local advisors."
  ];

  const lowerCrop = cropType?.toLowerCase();
  
  if (lowerCrop === "tomato") {
    disease = "Early Blight";
    confidence = 91;
    risk = "High";
    severity = "Moderate";
    why = [
      "Target-like brown spots detected in photo structure",
      "High humidity in field weather settings",
      "Spore multiplication speed warning active"
    ];
    advice = [
      "Check nearby tomato plants immediately.",
      "Remove and destroy infected leaves.",
      "Apply protective copper-based or organic fungicides."
    ];
  } else if (lowerCrop === "potato") {
    disease = "Late Blight";
    confidence = 88;
    risk = "High";
    severity = "Severe";
    why = [
      "Dark water-soaked leaf spots matching Phytophthora infestans",
      "High moisture parameters logged"
    ];
    advice = [
      "Harvest early if mature to avoid tuber contamination.",
      "Remove diseased vines immediately from field area."
    ];
  } else if (lowerCrop === "wheat") {
    disease = "Yellow Rust";
    confidence = 85;
    risk = "Medium";
    severity = "Mild";
    why = [
      "Powdery yellow pustules detected in stripes"
    ];
    advice = [
      "Apply recommended biological sulfur fungicide spray.",
      "Avoid excess nitrogen fertilization which enhances rust development."
    ];
  } else if (lowerCrop === "rice") {
    disease = "Blast Disease";
    confidence = 90;
    risk = "High";
    severity = "Severe";
    why = [
      "Spindle-shaped lesions spotted with gray centers",
      "Prolonged leaf wetness recorded"
    ];
    advice = [
      "Avoid excessive nitrogen fertilizer application.",
      "Keep the crop field clean of weed hosts."
    ];
  } else {
    // Healthy or general detection fallback
    disease = "Healthy Leaf";
    confidence = 96;
    risk = "Low";
    severity = "None";
    why = [
      "No anomalies or spots matching known diseases identified in crop-health model"
    ];
    advice = [
      "No treatment required.",
      "Continue standard soil conditioning and field weeding schedules."
    ];
  }

  const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const newReport = {
    id: `hist-${Date.now()}`,
    date: todayStr,
    crop: cropType,
    disease,
    confidence,
    risk,
    severity,
    why,
    advice
  };

  // Save to History
  history.unshift(newReport);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));

  // Update field checks
  const updatedFields = fields.map((f) => {
    if (f.id === fieldId) {
      return {
        ...f,
        lastAnalysis: todayStr,
        currentRisk: risk,
        diseaseDetected: disease,
        severity: severity
      };
    }
    return f;
  });
  localStorage.setItem(KEYS.FIELDS, JSON.stringify(updatedFields));

  // Save severe risk alerts
  if (risk === "High") {
    const newAlert = {
      id: `alert-${Date.now()}`,
      title: "🚨 HIGH RISK",
      message: `Possible ${disease} detected in your ${cropType} Field. High humidity and rain expected.`,
      fieldId: fieldId || "unknown",
      type: "disease",
      date: todayStr
    };
    alerts.unshift(newAlert);
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(alerts));
  }

  return newReport;
};

export const getWeather = async (lat, lon) => {
  await delay(500);
  return mockWeather;
};

export const getRiskAnalysis = async (cropId, fieldId) => {
  await delay(600);
  const fields = JSON.parse(localStorage.getItem(KEYS.FIELDS)) || [];
  const target = fields.find((f) => f.id === fieldId) || fields[0];
  
  return {
    crop: target ? target.crop : "Tomato",
    disease: target ? target.diseaseDetected : "Early Blight",
    risk: target ? target.currentRisk : "High",
    score: target?.currentRisk === "High" ? 78 : target?.currentRisk === "Medium" ? 45 : 15,
    summary: target?.currentRisk === "High" 
      ? "High humidity and expected rainfall may increase disease spread."
      : "Weather conditions are stable. Low chance of disease multiplication."
  };
};

export const getHistory = async () => {
  await delay(600);
  return JSON.parse(localStorage.getItem(KEYS.HISTORY));
};

export const getAlerts = async () => {
  await delay(500);
  return JSON.parse(localStorage.getItem(KEYS.ALERTS));
};
