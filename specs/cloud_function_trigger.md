# Documentation: Firestore Cloud Function Trigger Setup

This guide walks you through setting up a background Cloud Function that triggers automatically whenever a new document is added to a specific Firestore collection.

## 1. Prerequisites
- **Firebase CLI installed**: Run `npm install -g firebase-tools`.
- **Firebase Project**: You must have an existing Firebase/Google Cloud project.
- **Billing**: Cloud Functions for Firebase (2nd Gen) requires the **Blaze (Pay-as-you-go) plan**.

---

## 2. Initialization

Navigate to your project root (or a dedicated `functions/` directory) and run:

```bash
firebase init functions
```

1.  **Select Project**: Choose "Use an existing project" and select your project.
2.  **Select Language**: Choose **TypeScript** or **JavaScript** (TypeScript is recommended for Firestore triggers).
3.  **ESLint**: Select "Yes" if you want linting.
4.  **Install Dependencies**: Select "Yes" to run `npm install`.

---

## 3. Writing the Trigger

Open the generated `functions/src/index.ts` (TypeScript) or `index.js` (JavaScript) and add your trigger logic.

### Example: Triggering on a new "Session"
This function will run every time a document is created in the `sessions` collection.

```typescript
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";

// Set global options (e.g., region)
setGlobalOptions({ region: "us-central1" });

export const handleNewSession = onDocumentCreated("sessions/{sessionId}", (event) => {
  // 1. Get the data from the new document
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const data = snapshot.data();
  const sessionId = event.params.sessionId;

  console.log(`New session detected: ${sessionId}`, data);

  // 2. Perform your custom action
  // Example: Notify another service, update a counter, etc.

  return;
});
```

---

## 4. Local Testing

You can test your triggers locally using the Firebase Emulator Suite before deploying.

1.  **Start Emulators**:
    ```bash
    firebase emulators:start
    ```
2.  **Access UI**: Open the URL provided in the terminal (usually `http://localhost:4000`).
3.  **Trigger Event**: Go to the **Firestore Emulator**, manually add a document to the `sessions` collection, and watch the **Logs** tab to see your function execute.

---

## 5. Deployment

Once verified, deploy the function to the cloud:

```bash
firebase deploy --only functions
```

After deployment, your function will be visible in the [Firebase Console](https://console.firebase.google.com/) under the **Functions** tab.

---

## 6. Common Patterns & Best Practices

### Accessing Other Firebase Services
If you need to update other documents or send messages, use the `firebase-admin` SDK:

```typescript
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const handleNewSession = onDocumentCreated("sessions/{sessionId}", async (event) => {
  // Example: Update a user's total score when they finish a session
  const userId = event.data?.data().userId;
  await db.collection("users").doc(userId).update({
    lastSessionAt: new Date()
  });
});
```

---

## 7. Manual Setup via Google Cloud Console (Alternative)

If you prefer not to use the CLI, you can create a trigger directly in the web browser.

1.  **Go to Google Cloud Console**: Navigate to the [Cloud Functions](https://console.cloud.google.com/functions/list) page.
2.  **Create Function**: Click **CREATE FUNCTION**.
3.  **Basic Settings**:
    *   **Environment**: Choose **2nd gen**.
    *   **Function name**: e.g., `handle-new-session`.
    *   **Region**: Select the region closest to your users (e.g., `us-central1`).
4.  **Trigger Type**:
    *   Select **Cloud Firestore**.
    *   **Event type**: Select `google.cloud.firestore.document.v1.created`.
    *   **Document**: Enter the path, using wildcards for IDs (e.g., `projects/YOUR_PROJECT_ID/databases/(default)/documents/sessions/{sessionId}`).
    *   **Retry on failure**: Recommended to keep checked for critical actions.
5.  **Build Configuration**:
    *   **Runtime**: Choose **Node.js 20** or **Python 3.10+**.
    *   **Entry point**: The name of the function in your code (e.g., `handleNewSession`).
6.  **Code Editor**:
    *   You can use the **Inline Editor** to paste your code directly.
    *   Ensure your `package.json` includes `firebase-functions` and `firebase-admin`.
7.  **Deploy**: Click **DEPLOY**.

---

## 8. Summary Checklist

| Method | Best For... | Sync with Git? | Setup Complexity |
|---|---|---|---|
| **Firebase CLI** | Professional workflows, production apps | ✅ Yes | Medium (requires Node.js) |
| **Cloud Console** | Fast prototyping, quick fixes | ❌ No | Low (browser only) |
