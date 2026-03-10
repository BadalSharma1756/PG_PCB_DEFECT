# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Firebase (optional)

For multi-user sync, defect storage, and admin-managed defect options:

1. Create a project at [Firebase Console](https://console.firebase.google.com) and enable **Firestore**.
2. Copy `.env.example` to `.env` and set `VITE_FIREBASE_*` with your project config.
3. In Firestore, create a **composite index** when prompted (or via Console): collection `defects`, fields `location` (Ascending) + `timestamp` (Descending).
4. Collections (`defects`, `config`, `employeeUsers`, `sessionRequests`) are created automatically on first use.
5. **Deploy Firestore rules** (required for login, defect submit, create employee to work). Either:
   - **Console:** [Firebase Console](https://console.firebase.google.com) → project **pgelectroplastpcb** → Firestore Database → Rules → paste contents of `firestore.rules` → **Publish**.
   - **CLI:** `npm i -g firebase-tools` → `firebase login` → `firebase use pgelectroplastpcb` → `firebase deploy --only firestore`.
6. **Excel download** is password-protected; default password is in code (`EXCEL_DOWNLOAD_PASSWORD` in `src/lib/constants.ts`). Change it there if needed.

Without Firebase, the app runs with local/mock data only. If Firebase is on but rules are not deployed, you will see "Firestore access denied" when logging in, creating employee, or submitting defect.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
