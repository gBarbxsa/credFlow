# Deploying CredFlow to Azure App Service

This guide explains how to deploy your Node.js application to Azure using the "Azure for Students" subscription.

## Prerequisites
1.  **Azure Account**: Ensure you can log in to the [Azure Portal](https://portal.azure.com).
2.  **GitHub Repo**: Your code must be pushed to GitHub (which you just did!).

## Step 1: Create the Web App
1.  In the Azure Portal search bar, type **"App Services"** and select it.
2.  Click **+ Create** -> **Web App**.
3.  **Basics Tab**:
    *   **Subscription**: Select "Azure for Students".
    *   **Resource Group**: Click "Create new" and name it `credflow-rg`.
    *   **Name**: Choose a unique name (e.g., `credflow-seu-nome`). This will be your site URL (`.azurewebsites.net`).
    *   **Publish**: Select **Code**.
    *   **Runtime stack**: Select **Node 18 LTS** (or the version matching your local environment).
    *   **Operating System**: **Linux** is usually cheaper/faster for Node.js.
    *   **Region**: Choose "East US" (usually has the best free tier availability).
    *   **Pricing Plan**: Ensure it says **Free F1** (or Basic B1 if you have credits). If not, click "Explore pricing plans" to change.

## Step 2: Connect to GitHub
1.  Go to the **Deployment** tab (or "Deployment Center" after creation).
2.  **Continuous deployment**: Enable (On).
3.  **GitHub Account**: Authorize your GitHub account.
4.  **Organization**: Select your username.
5.  **Repository**: Select `credflow-backend` (or whatever you named it).
6.  **Branch**: Select `main`.
7.  Click **Review + create** and then **Create**.

## Step 3: Configure Environment Variables (.env)
Since we didn't upload `.env` to GitHub, we need to tell Azure these values manually.

1.  Go to your new App Service resource.
2.  In the left menu, under **Settings**, click **Environment variables** (or Configuration).
3.  Click **+ Add** (or New application setting) for EACH variable in your local `.env`:
    *   `DB_USER`: (seu usuario)
    *   `DB_PASSWORD`: (sua senha)
    *   `DB_SERVER`: (seu servidor)
    *   `DB_NAME`: (seu banco)
    *   `PORT`: `8080` (O Azure usa a porta 8080 internamente para Node.js muitas vezes, ou deixe o Azure gerenciar).
4.  Click **Apply** and then **Save** at the top.

## Step 4: Verify
1.  Wait a few minutes for the deployment to finish (you can check the "Deployment Center" logs).
2.  Click **Browse** or go to your URL (`https://credflow-seu-nome.azurewebsites.net`).

## Troubleshooting
*   **Application Error :** Check the "Log Stream" in the left menu to see the real-time error logs.
*   **Database Connection:** Ensure your Azure SQL Database firewall allows "Azure services and resources to access this server" (In SQL Server -> Networking).
