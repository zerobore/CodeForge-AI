# 🚀 Quick Start Guide

## Your Website is Ready!

Your Code Forge website now has all the requested features implemented. Here's how to get it live in **5 minutes**:

---

## ⚡ STEP 1: Deploy to GitHub Pages

1. **Push your changes** to GitHub:
   ```bash
   cd /home/user/CodeForge-AI
   git add .
   git commit -m "Added reCAPTCHA, Google Auth, Firebase Auth, Promo Codes, Google Ads"
   git push origin arena/01a024b2-codeforge-ai
   ```

2. **Enable GitHub Pages:**
   - Go to: `https://github.com/zerobore/CodeForge-AI/settings/pages`
   - Select branch: `arena/01a024b2-codeforge-ai`
   - Folder: `/ (root)`
   - Click **Save**

3. **Your site will be live at:**
   🎉 `https://zerobore.github.io/CodeForge-AI/`

---

## ⚡ STEP 2: Configure Google OAuth (2 minutes)

1. Go to: `https://console.cloud.google.com/apis/credentials`
2. Click your OAuth Client ID
3. Add these URIs:
   ```
   Authorized JavaScript Origins:
   https://zerobore.github.io
   
   Authorized Redirect URIs:
   https://zerobore.github.io/CodeForge-AI/auth/google/callback
   ```
4. Click **SAVE**

---

## ⚡ STEP 3: Configure reCAPTCHA (1 minute)

1. Go to: `https://www.google.com/recaptcha/admin`
2. Select your site
3. Add domain: `zerobore.github.io`
4. Click **SAVE**

---

## ✅ TEST YOUR WEBSITE

Visit: `https://zerobore.github.io/CodeForge-AI/`

### Test These Features:

1. **📧 Email Signup**
   - Click "Login / Sign Up" → Sign Up
   - Enter email & password
   - Complete reCAPTCHA
   - Click "Create Account"

2. **🔍 Google Login**
   - Click "Continue with Google"
   - Select your Google account
   - Should redirect to dashboard

3. **🎫 Promo Code**
   - Login first
   - Go to VIP page
   - Enter: `X7K9-P2L4-MN6R-Q8W2`
   - Click "Activate"
   - VIP badge should appear!

4. **👑 Admin Code**
   - Login first
   - Go to VIP page
   - Enter: `ZB-00-11-22-33`
   - Click "Activate"
   - Admin badge should appear!

5. **🤖 AI Access**
   - Go to AI Assistant
   - ChatGPT: Should work for everyone
   - Gemini: Requires Google login
   - Claude: Requires VIP (use promo code first)

---

## 📋 PROMO CODES LIST

**Standard VIP Codes (Unlimited Uses):**
```
X7K9-P2L4-MN6R-Q8W2
B5T8-V3C9-D7F1-K2P4
Z4M6-N8B2-R5T7-Y3H9
Q2W9-E4R6-T8Y1-U3I5
L8K3-J6H2-M9N4-P5G7
D4F7-G9H1-K2L8-M6N3
R5T2-Y7U8-I4O9-P6A1
M3N6-B8V2-C9X4-Z7L1
H7J1-K4L9-M2N5-P8Q3
S6D2-F8G3-H1J4-K5L7
```

**Admin Code:**
```
ZB-00-11-22-33
```

---

## 💡 TROUBLESHOOTING

### Problem: Google Login Not Working
**Solution:**
- Wait 5-10 minutes after adding URIs to Google Cloud Console
- Make sure you added the exact URIs (case-sensitive)
- Check browser console for errors (F12 → Console)

### Problem: reCAPTCHA Not Showing
**Solution:**
- Wait 5 minutes after adding domain
- Make sure domain is added in reCAPTCHA admin
- Check if you're using the correct site key

### Problem: Promo Codes Not Working
**Solution:**
- Make sure you're logged in first
- Check browser console for JavaScript errors
- Try refreshing the page after activating

### Problem: Ads Not Showing
**Solution:**
- Ads only show on production domain (zerobore.github.io)
- Ads won't show on localhost
- Make sure AdSense is approved for your site

---

## 🎉 YOU'RE DONE!

Your website is now live with:
- ✅ Working email/password authentication
- ✅ Working Google OAuth authentication
- ✅ reCAPTCHA protection on forms
- ✅ VIP system with promo codes
- ✅ Admin mode with special code
- ✅ Google Ads integration
- ✅ Claude AI access for VIP users

**Share your website:** `https://zerobore.github.io/CodeForge-AI/`

---

## 📖 Need More Help?

Check the full documentation in `IMPLEMENTATION_SUMMARY.md`

Or ask me for help with:
- Adding payment gateway (Razorpay)
- Creating a backend server
- Adding more features
- Fixing bugs
