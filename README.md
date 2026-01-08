<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aFdDMSr2rLagJab1i9Iz7HYJ9Wzmwk6j

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. **Configure Firebase Storage CORS** (required for file uploads):
   See [SETUP.md](SETUP.md) for detailed instructions
4. Run the app:
   `npm run dev`

## Firebase Storage Setup

File uploads (profile images, project images) require CORS configuration on your Firebase Storage bucket. Without this, uploads will hang indefinitely.

**Quick setup:**
```bash
gsutil cors set cors.json gs://vibe-dev-26.firebasestorage.app
```

For detailed instructions, troubleshooting, and alternative methods, see [SETUP.md](SETUP.md).
