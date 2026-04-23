# IronLog 🏋️

> **Plan. Lift. Evolve.** — A full-stack gym tracking platform.

IronLog is a production-ready fitness platform built as an **npm workspaces monorepo** with:

- `shared/` — Pure JS business logic shared by all apps
- `server/` — Express + Prisma + PostgreSQL API
- `web/` — React + Vite + Tailwind CSS dashboard
- `app/` — React Native CLI Android app (online/offline hybrid)

---

## 🚀 Quick Start

### 1. Install all dependencies (root)

```bash
npm install --legacy-peer-deps
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
# Edit DATABASE_URL and JWT_SECRET in server/.env
```

### 3. Migrate the database

```bash
npm run db:migrate -w @ironlog/server
```

### 4. Run dev servers

In two terminals:

```bash
# Terminal 1 — API server (port 5000)
npm run dev -w @ironlog/server

# Terminal 2 — React web app (port 5173)
npm run dev -w @ironlog/web
```

---

## 🏗️ Architecture

```
IronLog/
├── shared/           @ironlog/shared
│   ├── constants.js  Exercise library, splits, food presets, tips
│   ├── scoring.js    Workout score engine
│   ├── calculations.js  BMI, TDEE, week/date keys, insights
│   └── validation.js Username/password/profile validators
│
├── server/           @ironlog/server  (Express + Prisma)
│   ├── src/
│   │   ├── controllers/   auth, users, schedules, exercises,
│   │   │                  workoutLogs, mealLogs, customExercises
│   │   ├── routes/        one file per resource
│   │   ├── middleware/    verifyToken JWT guard
│   │   └── index.js       CORS, static serving, route mounting
│   └── prisma/
│       └── schema.prisma  Full relational schema (PostgreSQL)
│
├── web/              @ironlog/web  (React 18 + Vite 5)
│   └── src/
│       ├── pages/    Login, Register, Home, Schedule,
│       │             Exercises, Track, Reports, Meals, Profile
│       ├── components/  Layout, ScoreModal, ExerciseLibraryModal,
│       │                DayScheduleModal, AddFoodModal
│       │             ui/  Button, Input, Card, Badge, Modal,
│       │                  Avatar, Stepper, SegmentedControl
│       ├── hooks/    useAuth, useSchedule, useExercises,
│       │             useWorkoutLog, useMealLog
│       └── services/ dataService.js (Axios wrapper)
│
└── app/              @ironlog/app  (React Native 0.85 CLI)
    └── src/
        ├── screens/  Login, Register, Home, Schedule,
        │             Exercises, Tracker, Profile
        ├── navigation/ RootNavigator (Stack + BottomTab)
        ├── components/ Button, Input, Card, Badge
        ├── services/ dataService.js (API | SQLite hybrid)
        ├── api/      apiClient.js (Axios)
        ├── db/       sqlite.js (raw SQL + react-native-sqlite-storage)
        └── theme/    colors.js
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev -w @ironlog/server` | Start API server with nodemon |
| `npm run dev -w @ironlog/web` | Start Vite dev server |
| `npm run build -w @ironlog/web` | Build web for production (→ server/web-dist) |
| `npm run db:generate -w @ironlog/server` | Regenerate Prisma client |
| `npm run db:migrate -w @ironlog/server` | Deploy pending migrations |
| `npm run db:dev -w @ironlog/server` | Create + apply new migration |

---

## 📱 Android Build

### Prerequisites
- Android Studio with SDK 34+
- JDK 17
- `ANDROID_HOME` environment variable set

### Debug APK
```bash
cd app/android
./gradlew assembleDebug
# APK: app/android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (requires keystore)

1. Generate a keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore ironlog-release.keystore \
     -alias ironlog -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add to `app/android/gradle.properties`:
   ```
   IRONLOG_STORE_FILE=../../ironlog-release.keystore
   IRONLOG_KEY_ALIAS=ironlog
   IRONLOG_STORE_PASSWORD=your_store_password
   IRONLOG_KEY_PASSWORD=your_key_password
   ```

3. Update `app/android/app/build.gradle` signingConfigs, then:
   ```bash
   ./gradlew assembleRelease
   ```

---

## ☁️ Deployment Guide (Render)

The easiest way to deploy IronLog is using **Render**. The project is already pre-configured with a `render.yaml` blueprint.

1.  **Push to GitHub**: Create a private repository on GitHub and push your monorepo.
2.  **Connect to Render**:
    *   Go to [Render.com](https://render.com/) and log in.
    *   Click **New** > **Blueprint**.
    *   Connect your GitHub repository.
3.  **Automatic Provisioning**:
    *   Render will read `render.yaml` and automatically create:
        *   A **PostgreSQL** Database.
        *   A **Web Service** for the backend (which also serves the frontend).
    *   It will automatically run migrations and build the web application.
4.  **Final Configuration**:
    *   Go to your Web Service in Render > **Environment**.
    *   Render automatically links the `DATABASE_URL`.
    *   **JWT_SECRET**: Generate a random 32+ character string and paste it here.
    *   **CLIENT_URL**: Set this to your production URL (e.g., `https://ironlog-abc.onrender.com`).

---

## 🔑 Environment Variables (.env)

For local development, create a `.env` file in the `server/` directory:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/ironlog` |
| `JWT_SECRET` | Secure key for auth tokens | `any-long-random-secret-string-here` |
| `PORT` | Port for the API server | `5000` |
| `CLIENT_URL` | The URL of your frontend | `http://localhost:5173` |

---

## 🤖 Generating Android APK

To build a standalone APK for your Android phone:

### 1. Prerequisites
*   **Android Studio** installed.
*   **Java 17 (JDK)** installed.
*   **SDK Path**: In `app/android/`, create a file named `local.properties` and add your SDK path:
    ```properties
    sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
    ```

### 2. Build Debug APK (Quickest)
This creates an APK that you can install immediately for testing.
```powershell
cd app/android
./gradlew assembleDebug
```
*   **Location**: `app/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Build Release APK (Production)
For a production-ready APK, you must sign it:
1.  **Generate Keystore**:
    ```powershell
    keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```
2.  **Configure Gradle**: Add your keystore details to `app/android/gradle.properties`.
3.  **Run Build**:
    ```powershell
    cd app/android
    ./gradlew assembleRelease
    ```
*   **Location**: `app/android/app/build/outputs/apk/release/app-release.apk`

---

## 🎨 Design System

| Token | Value |
| :--- | :--- |
| **Background** | `#080810` (Industrial Dark) |
| **Surface** | `#111118` |
| **Accent** | `#C8FF00` (Electric Lime) |
| **Text Primary** | `#F0F0F0` |
| **Fonts** | Bebas Neue (Headers), DM Sans (Body) |

---

## 📄 License

MIT © IronLog
