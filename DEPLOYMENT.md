# Grievance360 | Deployment Instructions

A step-by-step guide to deploying the **Grievance360** Complaint Management System for Vel Tech University.

---

## Stage 3.1 — Database Setup: MongoDB Atlas

1. **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. **Create a Cluster**: 
   - Deploy a new **M0 FREE** cluster.
   - Choose a provider (e.g., AWS) and region nearest to your audience (e.g., `ap-south-1` for Mumbai).
3. **Configure Database Access (Credentials)**:
   - Go to **Security** > **Database Access**.
   - Create a database user (e.g., `dbAdmin`). Choose a strong password and save it securely. Assign user privileges `Read and write to any database`.
4. **Configure Network Access (Firewall Rules)**:
   - Go to **Security** > **Network Access**.
   - Click **Add IP Address**. Choose **Allow Access From Anywhere** (`0.0.0.0/0`) for development/hosting simplicity, as cloud backend providers (like Render) rotate outward IP addresses.
5. **Retrieve Connection String**:
   - Go to **Database** > **Clusters**.
   - Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://dbAdmin:<password>@cluster0.abcde.mongodb.net/grievance360?retryWrites=true&w=majority
     ```
     *(Make sure to replace `<password>` with the database user's password).*

---

## Stage 3.2 — Backend Deployment: Render

We will deploy the Node.js/Express app to [Render](https://render.com/).

1. **Prepare Git Repository**:
   - Initialize a git repository in your project directory.
   - Add a `.gitignore` containing `node_modules` and `.env`.
   - Push your code to a public or private GitHub repository.
2. **Create Web Service**:
   - Log in to Render and click **New** > **Web Service**.
   - Connect your GitHub account and select your repository.
3. **Configure Environment Parameters**:
   - **Root Directory**: `stage2-fullstack/backend` (or root if you split repositories).
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Add Environment Variables**:
   Under the **Environment** tab, click **Add Environment Variable**:
   - `MONGO_URI` = *Your MongoDB Atlas Connection String*
   - `JWT_SECRET` = *A long random security string*
   - `PORT` = `10000` (Render defaults to routing here)
   - *(Optional)* `EMAIL_USER` = *Gmail username for Nodemailer notifications*
   - *(Optional)* `EMAIL_PASS` = *Gmail App Password (not your primary password)*
5. **Deploy**: Click **Create Web Service**. Save the assigned web address (e.g., `https://grievance360-backend.onrender.com`).

---

## Stage 3.3 — Frontend Deployment: Vercel

We will build and host the Vite + React client on [Vercel](https://vercel.com/).

1. **Create Web Project**:
   - Log in to Vercel and click **Add New** > **Project**.
   - Select your GitHub repository.
2. **Configure Build Settings**:
   - **Root Directory**: `stage2-fullstack/frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Setup Environment Variables**:
   - Add a new variable: `VITE_API_URL` (if configured in code, or let Vite's proxy redirect it. For production, Axios calls should use the absolute URL of the backend).
   - In `stage2-fullstack/frontend/src/main.jsx` or similar, configure Axios base URL:
     ```javascript
     import axios from 'axios';
     axios.defaults.baseURL = 'https://grievance360-backend.onrender.com';
     ```
4. **Deploy**: Click **Deploy**. Vercel will build and output your production website (e.g., `https://grievance360.vercel.app`).

---

## Stage 3.4 — Custom Domain Configuration (Vel Tech Subdomain)

If the university authorizes a custom subdomain (e.g., `grievance360.veltech.edu.in`):

1. **Configure in Vercel**:
   - Go to your Vercel Project Dashboard > **Settings** > **Domains**.
   - Enter `grievance360.veltech.edu.in` and click **Add**.
2. **DNS Record Updates (University DNS Registrar)**:
   Provide the following details to the IT Administrator managing the `veltech.edu.in` domain:
   - **Type**: `CNAME`
   - **Name/Host**: `grievance360`
   - **Value/Target**: `cname.vercel-dns.com`
   - **TTL**: Default (e.g., `3600`)
3. **Verify Connection**: Allow up to 24 hours for DNS propagation. Vercel will automatically generate a free SSL certificate once mapped.

---

## Post-Deployment Checklist

- [ ] **E2E Complaint Logging**: Access the portal, toggle anonymous mode off, submit a complaint, verify you get a tracking ID.
- [ ] **Database Inspection**: Log in to MongoDB Atlas and check that a new record has been inserted in the `complaints` collection.
- [ ] **Admin Dashboard Verification**: Log in as admin, search for the tracking ID, and update its status to "Under Review".
- [ ] **Email Alerts**: If SMTP parameters are supplied, check your student mailbox for the automated status change notification.
- [ ] **Responsive check**: Open the site on mobile/tablet viewports to verify that navbar collapsing and tables stay legible.
- [ ] **Uptime Monitoring**: Add the frontend link to [UptimeRobot](https://uptimerobot.com/) (free tier) to alert you if server endpoints sleep.
