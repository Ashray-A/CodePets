import express from "express";
import axios from "axios";
import User from "../models/User.js";
import Pet from "../models/Pet.js";
import { generateToken } from "../utils/helpers.js";

const router = express.Router();

// GitHub OAuth callback
router.post("/github", async (req, res) => {
  try {
    const { code } = req.body;

    console.log(`🔄 OAuth: Starting token exchange`);
    console.log(`📋 Request body:`, req.body);
    console.log(
      `🔑 Code received: ${code ? `${code.substring(0, 10)}...` : "NO CODE"}`
    );

    if (!code) {
      console.log(`❌ OAuth: No authorization code provided`);
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    } // Exchange code for access token
    console.log(`🔄 OAuth: Exchanging code with GitHub...`);
    console.log(`🏗️ OAuth: Client ID: ${process.env.GITHUB_CLIENT_ID}`);
    console.log(
      `🏗️ OAuth: Client Secret: ${
        process.env.GITHUB_CLIENT_SECRET ? "PRESENT" : "MISSING"
      }`
    );

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    console.log(
      `✅ OAuth: GitHub responded with status ${tokenResponse.status}`
    );
    console.log(`🔍 OAuth: Response data:`, tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.log(
        `❌ OAuth: No access token received. Full response:`,
        tokenResponse.data
      );

      // Provide more specific error messages based on GitHub's response
      let userMessage = "Failed to get access token from GitHub";
      let debugInfo = undefined;

      if (tokenResponse.data.error) {
        switch (tokenResponse.data.error) {
          case "bad_verification_code":
            userMessage =
              "Authorization code is invalid or expired. Please try logging in again.";
            console.log(
              `🔍 OAuth: GitHub rejected the authorization code - likely expired or already used`
            );
            break;
          case "incorrect_client_credentials":
            userMessage = "OAuth configuration error. Please contact support.";
            console.log(`🚨 OAuth: Client credentials are incorrect!`);
            break;
          case "redirect_uri_mismatch":
            userMessage =
              "OAuth redirect URI mismatch. Please contact support.";
            console.log(
              `🚨 OAuth: Redirect URI not configured in GitHub OAuth app`
            );
            break;
          default:
            userMessage = `GitHub authentication error: ${
              tokenResponse.data.error_description || tokenResponse.data.error
            }`;
        }

        if (process.env.NODE_ENV === "development") {
          debugInfo = tokenResponse.data;
        }
      }

      return res.status(400).json({
        success: false,
        message: userMessage,
        debug: debugInfo,
      });
    }
    console.log(`🔑 OAuth: Access token received successfully`); // Get user info from GitHub
    console.log(`👤 OAuth: Fetching user info from GitHub API`);
    console.log(
      `🔑 OAuth: Using access token: ${accessToken.substring(0, 10)}...`
    );
    let userResponse;
    let emailResponse;
    try {
      // Fetch basic user info
      userResponse = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "CodePets-App",
        },
      });
      // Fetch user emails (needed when email is private)
      console.log(`📧 OAuth: Fetching user emails from GitHub API...`);
      emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "CodePets-App",
        },
      });

      console.log(`✅ OAuth: GitHub user info retrieved successfully`);
      console.log(`👤 OAuth: User data:`, {
        login: userResponse.data.login,
        id: userResponse.data.id,
        email: userResponse.data.email,
        emails: emailResponse.data?.length || 0,
      });

      if (emailResponse.data?.length > 0) {
        console.log(
          `📧 OAuth: Available emails:`,
          emailResponse.data.map((e) => ({
            email: e.email,
            primary: e.primary,
            verified: e.verified,
          }))
        );
      }
    } catch (apiError) {
      console.log(
        `❌ OAuth: GitHub API call failed with status ${apiError.response?.status}`
      );
      console.log(`🔍 OAuth: GitHub API error:`, apiError.response?.data);
      console.log(`🔑 OAuth: Failed token: ${accessToken.substring(0, 10)}...`);

      // If emails API fails, continue with user creation but log the issue
      if (apiError.config?.url?.includes("/user/emails")) {
        console.log(
          `⚠️ OAuth: Emails API failed, will continue without email data`
        );
        emailResponse = { data: [] }; // Set empty array so flow continues
      } else if (apiError.response?.status === 401) {
        return res.status(400).json({
          success: false,
          message:
            "Failed to validate access token with GitHub. Please try logging in again.",
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  error:
                    "GitHub API returned 401 - access token may be invalid",
                  tokenReceived: !!accessToken,
                  tokenPrefix: accessToken.substring(0, 10),
                  apiResponse: apiError.response?.data,
                }
              : undefined,
        });
      } else {
        throw apiError; // Re-throw for general error handling
      }
    }
    const githubUser = userResponse.data;
    // Get primary email from the emails API response
    let userEmail = githubUser.email; // Try public email first

    if (!userEmail && emailResponse?.data?.length > 0) {
      // Find primary email or fallback to first verified email
      const primaryEmail = emailResponse.data.find((email) => email.primary);
      const verifiedEmail = emailResponse.data.find((email) => email.verified);
      userEmail =
        primaryEmail?.email ||
        verifiedEmail?.email ||
        emailResponse.data[0].email;

      console.log(`📧 OAuth: Found email from emails API: ${userEmail}`);
    } else if (!userEmail) {
      console.log(`📧 OAuth: No email found - user has private email settings`);
    }

    // Check if user exists or create new one
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (!user) {
      user = new User({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: userEmail || `${githubUser.login}@github.local`,
        avatarUrl: githubUser.avatar_url,
        githubProfile: githubUser.html_url,
        accessToken: accessToken,
      });
      await user.save();

      console.log(
        `🆕 OAuth: Created new user: ${user.username} (${user.email})`
      );

      // Create pet for new user
      const pet = new Pet({
        userId: user._id,
        name: `${githubUser.login}'s Coding Cat`,
      });
      await pet.save();

      console.log(`🐱 OAuth: Created pet for new user: ${pet.name}`);
    } else {
      // Update existing user's token and info
      user.accessToken = accessToken;
      user.avatarUrl = githubUser.avatar_url;
      if (userEmail && user.email.endsWith("@github.local")) {
        // Update placeholder email with real email if we found one
        user.email = userEmail;
      }
      user.lastSynced = new Date();
      await user.save();

      console.log(
        `🔄 OAuth: Updated existing user: ${user.username} (${user.email})`
      );
    } // Generate JWT token
    const token = generateToken(user._id);

    console.log(`🎉 OAuth: Authentication successful for ${user.username}`);
    console.log(`🔑 OAuth: JWT token generated successfully`);

    res.json({
      success: true,
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubProfile: user.githubProfile,
      },
    });
  } catch (error) {
    // Log a more concise error message
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    const statusCode = error.response?.status || 500;

    console.error(`GitHub auth error (${statusCode}): ${errorMessage}`);

    // Don't log the full error object unless it's a non-GitHub API error
    if (!error.response || error.response.config?.url?.includes("github.com")) {
      console.error(
        "Full error details:",
        error.response?.data || error.message
      );
    }

    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
});

// Get GitHub OAuth URL
router.get("/github/url", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  // Better fallback for client URL in production
  let clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    clientUrl =
      process.env.NODE_ENV === "production"
        ? "https://code-pets.vercel.app"
        : "http://localhost:5173";
  }

  const redirectUri = `${clientUrl}/auth/callback`;
  const scope = "public_repo,user:email";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  console.log(`🔗 OAuth URL generated: ${githubAuthUrl}`);
  console.log(`📍 Redirect URI: ${redirectUri}`);
  console.log(`🌐 Client URL from env: ${process.env.CLIENT_URL}`);
  console.log(`🌐 Final client URL used: ${clientUrl}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);

  res.json({
    success: true,
    url: githubAuthUrl,
  });
});

export default router;
