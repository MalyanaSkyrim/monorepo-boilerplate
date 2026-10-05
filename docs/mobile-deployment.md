# iOS App Store Deployment Guide

This document describes how to set up, configure, and maintain the automated iOS deployment pipeline for the React Native mobile app (`@app/mobile`).

---

## 1. Apple Developer Portal Setup

The iOS app uses the bundle identifier `com.example.app`. Before deploying, you must configure the following in your [Apple Developer Portal](https://developer.apple.com):

1. **App ID registration**:
   - Register the App ID with bundle identifier: `com.example.app`.
   - Enable the following Capabilities (required by the app's configuration):
     - **Sign In with Apple** (configured in `app.config.js`).
     - **Push Notifications** (configured in `app.config.js` / `expo-notifications`).

2. **Retrieve Identifiers**:
   - **Apple Team ID**: Locate this in your developer portal under "Membership details" (a 10-character alphanumeric string like `A1B2C3D4E5`).

---

## 2. App Store Connect Setup

1. **Create the App**:
   - Log in to [App Store Connect](https://appstoreconnect.apple.com).
   - Navigate to **Apps** -> **New App** (+).
   - Enter your app details and select the bundle identifier `com.example.app`.

2. **Generate an App Store Connect API Key**:
   - Go to **Users and Access** -> **Integrations** -> **App Store Connect API**.
   - Generate a new API key.
   - Assign the role **Admin** or **App Manager**.
   - Record the following values:
     - **Issuer ID** (UUID format).
     - **Key ID** (10-character alphanumeric string).
     - **Private Key (`.p8` file)**: Download this file. _Keep this secure! You can only download it once._

---

## 3. Code Signing with Fastlane Match

Fastlane Match implements a centralized code signing approach by storing encrypted certificates and provisioning profiles in a private Git repository.

1. **Create a Private Certificates Repository**:
   - Create a new **private** Git repository on GitHub (e.g. `github.com/your-org/app-certificates`).
   - The pipeline will access this repository via the `MATCH_GIT_URL` environment variable.

2. **Initialize Fastlane Match locally (First-time setup)**:
   - Navigate to `apps/mobile` locally and run:
     ```bash
     bundle exec fastlane match init
     ```
   - Select `git` and enter your certificates repository URL.
   - Run match to generate development and app store certificates:
     ```bash
     bundle exec fastlane match appstore
     ```
   - Define a strong encryption password. This will be your `FASTLANE_MATCH_PASSWORD`.

---

## 4. GitHub Secrets Configuration

Add these secrets to your GitHub repository under **Settings -> Secrets and variables -> Actions -> Production Environment** (or repository secrets):

<!-- cspell:ignore MIGT EAMBMG Blbn -->

| Secret Name                     | Description                                                                                  | Example                                              |
| :------------------------------ | :------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| `APPLE_ID`                      | Your Apple ID developer email address.                                                       | `devops@example.com`                                 |
| `APPLE_TEAM_ID`                 | Your 10-character Apple Developer Team ID.                                                   | `A1B2C3D4E5`                                         |
| `APP_STORE_CONNECT_KEY_ID`      | The Key ID from the App Store Connect API key page.                                          | `K8Y1234567`                                         |
| `APP_STORE_CONNECT_ISSUER_ID`   | The Issuer ID from the App Store Connect API key page.                                       | `69a6de70-03ad-47e3-9fd6-ec9d9ac235f1`               |
| `APP_STORE_CONNECT_PRIVATE_KEY` | The content of the `.p8` private key file. Copy the entire file content or base64-encode it. | `-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMG...`       |
| `FASTLANE_MATCH_PASSWORD`       | The encryption password used when initializing Fastlane Match.                               | `SuperSecurePassword123!`                            |
| `MATCH_GIT_URL`                 | SSH URL of the private certificates repository used by Fastlane Match.                       | `git@github.com:your-org/app-certificates.git`       |
| `SSH_PRIVATE_KEY`               | The private SSH key of your machine used to pull the private certificates Git repository.    | `-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC...` |

> [!TIP]
> To use your local machine's private SSH key, copy the contents of your key (typically at `~/.ssh/id_rsa` or `~/.ssh/id_ed25519`) and paste it as the `SSH_PRIVATE_KEY` secret. The workflow uses `webfactory/ssh-agent` to authenticate on CI when accessing the certificates repository.

---

## 5. First Deployment Steps

1. Make sure all secrets are configured in the GitHub repository.
2. Verify that the current version and build number in `apps/mobile/app.config.js` are ready for a new build.
3. Trigger the deployment pipeline:
   - **Manual**: Go to **Actions** -> select **Deploy Production** -> click **Run workflow** -> check **Force deploy all services** -> click **Run workflow**.

---

## 6. Build Optimization details

- **Temporary Keychain**: The CI run uses the `setup_ci` Fastlane command to create a temporary keychain for signing to prevent build hangs on the macos runner.
- **Turbo Ignore**: The workflow evaluates `@app/mobile` changes. If no mobile-related directories have changes since the last deployment, the costly macOS runner step is skipped.
- **Caching**: The node/pnpm packages and CocoaPods pods directory (`apps/mobile/ios/Pods`) are cached to optimize build times.
