/**
 * ==========================================
 * CODE FORGE - Configuration & Constants
 * ==========================================
 * 
 * Updated with Firebase, reCAPTCHA, Google OAuth, and AdSense
 */

const CONFIG = {
    // ==========================================
    // API Keys (PLACEHOLDERS - Load from backend)
    // ==========================================
    
    /**
     * OpenAI API Configuration
     * IMPORTANT: Add your API key below or via environment variables
     */
    OPENAI: {
        API_KEY: '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', // Add your OpenAI API key here
        MODEL: 'gpt-4o-mini',
        ENDPOINT: '/api/ai/chatgpt',
        MAX_TOKENS: 4096,
        TEMPERATURE: 0.7,
        AVAILABLE: true,
        REQUIRE_AUTH: false,
        REQUIRE_VIP: false,
        CONFIGURED: false // Set to true when you add your API key
    },

    /**
     * Google Gemini API Configuration
     * IMPORTANT: Add your API key below or via environment variables
     */
    GEMINI: {
        API_KEY: 'AQ.Ab8RN6JJfGT41-lh1dHfPg2ZtG92QyaYVp01L6R5dwwT0SrpQg', // Add your Google Gemini API key here
        MODEL: 'gemini-1.5-flash',
        ENDPOINT: '/api/ai/gemini',
        MAX_TOKENS: 8192,
        TEMPERATURE: 0.7,
        AVAILABLE: true,
        REQUIRE_AUTH: true,
        REQUIRE_VIP: false,
        CONFIGURED: false // Set to true when you add your API key
    },

    /**
     * Anthropic Claude API Configuration
     * IMPORTANT: Add your API key below or via environment variables
     */
    CLAUDE: {
        API_KEY: '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', // Add your Claude API key here
        MODEL: 'claude-3-5-sonnet-20241022',
        ENDPOINT: '/api/ai/claude',
        MAX_TOKENS: 8192,
        TEMPERATURE: 0.7,
        AVAILABLE: true,
        REQUIRE_AUTH: true,
        REQUIRE_VIP: true,
        CONFIGURED: false // Set to true when you add your API key
    },

    // ==========================================
    // Authentication Configuration
    // ==========================================
    
    AUTH: {
        // Firebase Configuration
        FIREBASE: {
            apiKey: "AIzaSyDMPwjv590v_5x49j3IzVM94tBQPEccmUE",
            authDomain: "codeforge-ai-58fc6.firebaseapp.com",
            projectId: "codeforge-ai-58fc6",
            storageBucket: "codeforge-ai-58fc6.firebasestorage.app",
            messagingSenderId: "1077519287632",
            appId: "1:1077519287632:web:4149e0be924d1d1a859855",
            measurementId: "G-R767BP20DK"
        },
        
        // Google OAuth 2.0 Configuration
        GOOGLE: {
            CLIENT_ID: '638961823178-k8rg6vpa4nhq32igp6fi9kl470ltlkbj.apps.googleusercontent.com',
            REDIRECT_URI: window.location.origin + '/auth/google/callback',
            SCOPE: 'email profile openid',
            ENDPOINT: '/auth/google',
            CONFIGURED: true
        },
        
        // reCAPTCHA Configuration
        RECAPTCHA: {
            SITE_KEY: '6LczmJEtAAAAAAB6XzfY3WzMQ-OPRLCL-iealzhp',
            SECRET_KEY: '6LczmJEtAAAAAMVePtTDL8RFbs6c_5PjiFlHaQYx',
            VERSION: 'v3',
            CONFIGURED: true
        },
        
        // Session storage key
        SESSION_KEY: 'codeforge_session',
        
        // Token refresh interval (in milliseconds)
        TOKEN_REFRESH_INTERVAL: 30 * 60 * 1000,
        
        // Session duration (in milliseconds)
        SESSION_DURATION: 24 * 60 * 60 * 1000
    },

    // ==========================================
    // Payment/Subscription Configuration
    // ==========================================
    
    PAYMENT: {
        // Payment gateway (options: 'razorpay', 'stripe', 'paypal')
        PROVIDER: 'promo-only', // Using promo codes only for now
        
        // Promo Codes for VIP
        PROMO_CODES: [
            'X7K9-P2L4-MN6R-Q8W2',
            'B5T8-V3C9-D7F1-K2P4',
            'Z4M6-N8B2-R5T7-Y3H9',
            'Q2W9-E4R6-T8Y1-U3I5',
            'L8K3-J6H2-M9N4-P5G7',
            'D4F7-G9H1-K2L8-M6N3',
            'R5T2-Y7U8-I4O9-P6A1',
            'M3N6-B8V2-C9X4-Z7L1',
            'H7J1-K4L9-M2N5-P8Q3',
            'S6D2-F8G3-H1J4-K5L7'
        ],
        
        // Admin promo code
        ADMIN_PROMO_CODE: 'ZB-00-11-22-33',
        
        // Subscription plan details
        VIP_PLAN: {
            ID: 'vip_monthly',
            NAME: 'VIP Plan',
            PRICE: 0, // Free via promo codes
            CURRENCY: 'INR',
            BILLING_PERIOD: 'monthly',
            FEATURES: [
                'Full access to Claude AI assistant',
                'Access to Gemini AI (with Google auth)',
                'All 50+ projects unlocked',
                'Premium project templates',
                'Advanced playground features',
                'Ad-free experience',
                'Priority support'
            ]
        }
    },

    // ==========================================
    // Google Ads Configuration
    // ==========================================
    
    ADS: {
        ADSENSE: {
            PUBLISHER_ID: 'ca-pub-3080788861593401',
            ENABLED: true,
            AD_TYPES: ['display', 'in-article']
        }
    },

    // ==========================================
    // Application Settings
    // ==========================================
    
    APP: {
        NAME: 'Code Forge',
        VERSION: '1.0.0',
        DESCRIPTION: 'Learn, Code, Build & Create with AI',
        
        // Theme settings
        DEFAULT_THEME: 'dark',
        THEME_STORAGE_KEY: 'codeforge_theme',
        
        // User preferences storage key
        PREFS_STORAGE_KEY: 'codeforge_prefs',
        
        // Learning progress storage key
        PROGRESS_STORAGE_KEY: 'codeforge_progress',
        
        // Projects storage key
        PROJECTS_STORAGE_KEY: 'codeforge_projects',
        
        // Max chat history messages to keep
        MAX_CHAT_HISTORY: 50,
        
        // Playground settings
        PLAYGROUND: {
            AUTO_RUN_DELAY: 500,
            MAX_OUTPUT_SIZE: 100000,
            SUPPORTED_LANGUAGES: ['html-css-js', 'javascript']
        }
    },

    // ==========================================
    // API Endpoints (Backend)
    // ==========================================
    
    API: {
        BASE_URL: '',
        
        // Authentication endpoints
        AUTH: {
            LOGIN: '/auth/login',
            SIGNUP: '/auth/signup',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            GOOGLE: '/auth/google',
            ME: '/auth/me',
            VERIFY_PROMO: '/api/verify-promo'
        },
        
        // User endpoints
        USER: {
            PROFILE: '/user/profile',
            PREFERENCES: '/user/preferences',
            DASHBOARD: '/user/dashboard'
        },
        
        // Subscription endpoints
        SUBSCRIPTION: {
            STATUS: '/subscription/status',
            CREATE: '/subscription/create',
            CANCEL: '/subscription/cancel'
        }
    },

    // ==========================================
    // Error Messages
    // ==========================================
    
    ERRORS: {
        // Auth errors
        INVALID_CREDENTIALS: 'Invalid email or password',
        EMAIL_REQUIRED: 'Email address is required',
        PASSWORD_REQUIRED: 'Password is required',
        PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
        PASSWORDS_DONT_MATCH: 'Passwords do not match',
        NAME_REQUIRED: 'Name is required',
        RECAPTCHA_FAILED: 'reCAPTCHA verification failed. Please try again.',
        
        // Promo code errors
        INVALID_PROMO_CODE: 'Invalid promo code. Please check and try again.',
        PROMO_CODE_USED: 'This promo code has been used.',
        
        // AI errors
        AI_NOT_CONFIGURED: 'AI provider is not configured.',
        AI_RATE_LIMITED: 'Too many requests. Please try again later.',
        AI_NETWORK_ERROR: 'Network error. Please check your connection.',
        AI_RESPONSE_ERROR: 'Error processing response. Please try again.',
        
        // Provider-specific errors
        GEMINI_REQUIRES_AUTH: 'Gemini requires Google authentication. Please sign in with Google.',
        CLAUDE_REQUIRES_VIP: 'Claude is exclusive to VIP members. Enter a promo code to upgrade.',
        
        // General errors
        NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
        UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
        
        // Project errors
        PROJECT_SAVE_FAILED: 'Failed to save project. Please try again.',
        PROJECT_LOAD_FAILED: 'Failed to load project.'
    },

    // ==========================================
    // Success Messages
    // ==========================================
    
    SUCCESS: {
        LOGIN_SUCCESS: 'Welcome back!',
        LOGOUT_SUCCESS: 'You have been logged out successfully.',
        PROFILE_UPDATED: 'Profile updated successfully!',
        PASSWORD_UPDATED: 'Password updated successfully!',
        PROJECT_SAVED: 'Project saved successfully!',
        CODE_COPIED: 'Code copied to clipboard!',
        PROMO_CODE_ACTIVATED: 'VIP Access Activated! Enjoy premium features.',
        ADMIN_MODE_ACTIVATED: 'Admin Mode Activated! Full access granted.'
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
