# Life OS: Android push reminders

This folder contains the server-side scheduler. The browser stores reminders in the existing `users/{uid}/app/data` Firestore document; the Android browser stores its FCM registration token under `users/{uid}/pushTokens/`. The scheduled function checks due reminders once per minute, uses each reminder's IANA time zone, and sends only to tokens marked `platform: "android"`. Delivery state is kept separately per account and reminder so an invocation retry does not normally send a second copy.

## Important: nothing is deployed or billed by this change

The code and Firebase configuration are local repository changes only. No Firebase setting, billing account, Cloud Scheduler job, or Cloud Function has been enabled or deployed. Push notifications will remain unavailable until the project owner explicitly configures and deploys the backend.

FCM itself does not charge per push message, but scheduled Firebase Functions require a Cloud Billing account on the Blaze plan and create a Cloud Scheduler job. Cloud Scheduler, function execution, Firestore reads/writes, network use, and other Google Cloud services can have charges if their applicable free allowances are exceeded. A billing account is **not** a promise that the total will be 0 PLN. Review the current Firebase and Google Cloud pricing/quotas before enabling billing. This scheduler reads the user list and each account's app-data document every minute (about 2,880 reads per account per day, plus reads/writes when a reminder is due); cost and quota use grow with the number of accounts. This implementation is intended for a small personal app, not a large user base.

## Setup required before deployment

1. In Firebase Console for project `my-os-2c0bf`, configure **Cloud Messaging → Web configuration → Web Push certificates** and create/copy the public VAPID key. Put it in `firebase-config.js` as `webPushVapidKey`. It is a public key; never put a service-account JSON or Admin SDK credential in the web app.
2. Confirm the Cloud Billing plan, Cloud Scheduler/Cloud Functions pricing, quotas, and project budget alerts. Do not proceed if you have not accepted any possible charges.
3. Confirm Firebase Authentication's authorized domain includes the HTTPS origin serving the app. Android push requires a supported Android browser (the UI currently enables it only on Android), notification permission, and a secure HTTPS origin.
4. Install the Firebase CLI and authenticate as a project administrator, then review the diff and run the tests. Deployment is an explicit, separate step:

   ```sh
   npm --prefix functions install
   npm --prefix functions test
   firebase deploy --only functions:dispatchReminders --project my-os-2c0bf
   ```

   The repository's `firebase.json` runs the scheduler unit tests as a pre-deploy check. The deploy command is intentionally not run as part of this code change.
5. Only after a successful deployment, change `pushBackendDeployed` to `true` in `firebase-config.js` and publish the updated web app. It remains `false` in this change, so the UI will not claim that push works before the server exists.
6. Open the app in Chrome on Android, sign in to the same Firebase account used on the computer, go to **Przypomnienia**, add reminders, and tap **Włącz powiadomienia**. The list synchronizes with the existing `app/data` document; push tokens remain device-specific.

## Schedule behavior

- Supports one-time, daily, and selected-weekday reminders, using the device's local IANA time zone captured when the reminder is saved.
- Checks once per minute and sends if the scheduled time is no more than five minutes late. A reminder missed by more than five minutes is skipped rather than sent unexpectedly later.
- The service worker displays data-only FCM messages while the app is in the background/closed; foreground messages use the same notification UI. Clicking a notification opens the app.
- A reminder with no registered Android token is not sent. Disabling a reminder stops future sends.
- Existing Firestore rules already restrict `users/{uid}/...` to that signed-in account. The Admin SDK scheduler runs with server credentials managed by Firebase; no private key is added to this repository.
