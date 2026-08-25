# Crop Weather Risk & Suggestion Analyzer

A simple, zero-dependency Python script designed as a backend feature to analyze weather-related risks for crops. It compares real-time weather forecasts (fetched from the **Open-Meteo API**) with historical baseline conditions and crop ideal growth parameters from the **All-India District-wise Crop and Climate Dataset (1984–2017)**. 

It calculates an overall **Weather Impact Risk Score (0–100%)**, classifies the weather suitability as **Ideal** or **Critical**, and outputs actionable, easy-to-understand guidance for farmers in plain English.

---

## 🌟 Key Features

1. **Zero External Dependencies**: Uses only standard Python library modules (`urllib`, `json`, `csv`, `math`, `sys`, `os`). It runs out-of-the-box on any computer with Python 3 installed. No `pip install` is required!
2. **Interactive CLI & CLI Arguments**:
   - **Interactive Mode**: Prompts the user step-by-step to select a State, a District, and a Crop, listing the valid options.
   - **Direct Mode**: Accepts command-line parameters for quick automated scripting (e.g., `python crop_risk_analyzer.py "andhra pradesh" "ananthapur" "barley"`).
3. **Open-Meteo API Integration**:
   - Automatically geocodes district/state queries to fetch latitude and longitude.
   - Fetches today's real-time forecast parameters: maximum temperature, minimum temperature, daily rainfall, current humidity, and max wind speed.
4. **Historical Lookup**:
   - Reads the district-wide dataset to calculate historical averages, past yields, and the probability of weather risks in the region.
5. **Robust Offline Mode**: If the API call fails or there is no internet connection, the script gracefully prompts you to type or simulate current weather parameters manually so it can still run the risk model offline.
6. **Smart Initialization Cache**: To prevent loading a heavy 79MB CSV file every time you run the script, it scans the dataset once and saves a local hierarchy cache file (`crop_data_cache.json`). Subsequent runs start instantly!

---

## 🛠️ How to Check & Run the Code in VS Code

### Prerequisites
- Make sure you have **Python 3** installed on your computer.
- Ensure the file `All-India District-wise Crop and Climate Dataset (19842017).csv` is in the same folder as `crop_risk_analyzer.py`.

### Step 1: Open the Project in VS Code
1. Open VS Code.
2. Select **File > Open Folder...** and choose the project directory (`my_gravity`).

### Step 2: Open the Integrated Terminal
- Press ``Ctrl + ` `` (control + backtick) or select **Terminal > New Terminal** from the top menu.

### Step 3: Run the Code

#### Option A: Interactive CLI Mode (Recommended)
Run the script without arguments. It will prompt you to enter the State, District, and Crop:
```bash
python crop_risk_analyzer.py
```
*Note: On first run, it will take 1–2 seconds to initialize the dataset cache. Future runs will start instantly.*

#### Option B: Direct Arguments Mode
For quick checks, you can provide the state, district, and crop as arguments:
```bash
python crop_risk_analyzer.py "andhra pradesh" "ananthapur" "barley"
```

---

## 📊 How the Calculations Work

1. **Deviation Indices**: Calculates the difference between the current weather values and the crop's ideal parameters from the CSV:
   $$\text{Deviation} = \frac{|\text{Actual} - \text{Ideal}|}{\text{Ideal}}$$
2. **Impact Risk Score (0-100%)**: Scales and weighs the deviations:
   - **Temperature Max/Min** (40% weight): Checks if temperatures exceed or drop below the optimal growth thresholds.
   - **Rainfall** (35% weight): Evaluates drought stress vs. flooding/waterlogging threat.
   - **Humidity** (15% weight): Analyzes risk for pest attacks and fungal infections.
   - **Wind Speed** (10% weight): Assesses physical stalk damage and fertilizer drift risks.
3. **Suitability Category Classification**:
   - Classifies the weather as **Ideal** (favorable conditions) or **Critical** (severe stress, immediate action required) based on combined risk thresholds.
4. **Actionable Suggestions**: Translates numerical risks into clear farm-care tips like optimizing irrigation times, protecting taller stalks, or checking for pests.
