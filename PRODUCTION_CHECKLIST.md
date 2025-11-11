# Daash Wallet - Production Readiness Checklist

**Current Status:** Development Complete, Ready for Production Setup
**Target:** App Store (iOS) & Google Play Store (Android)

---

## 🎯 Production Readiness Overview

### ✅ Completed (Ready)
- [x] Core wallet functionality (create, import, send, receive)
- [x] Stellar blockchain integration
- [x] Transaction history and details
- [x] Navigation and UI/UX
- [x] In-app notifications system
- [x] Firebase Cloud Messaging (code ready)
- [x] iOS Live Activities & Dynamic Island (code ready)
- [x] On-ramp/Off-ramp integration (Ramp Network)
- [x] Supabase backend integration
- [x] Profile and settings management
- [x] Transaction detail modal
- [x] Security (encrypted storage, secure keypairs)

### ⏳ Remaining Tasks (Before Production)

---

## 📋 Critical Production Tasks

### 1. Switch from Testnet to Mainnet ⚠️ CRITICAL

**Current State:** App uses Stellar testnet
**Required Action:** Switch to mainnet

**File:** `src/services/stellarService.ts`

**Change:**
```typescript
// Line 6: Change from
const USE_TESTNET = true;

// To:
const USE_TESTNET = false;
```

**Impact:** All transactions will use real XLM/USDC on Stellar mainnet

**Testing Required:**
- ✅ Test wallet creation
- ✅ Test sending small amount (0.1 XLM)
- ✅ Test receiving
- ✅ Verify transaction history
- ✅ Confirm correct network in Stellar Explorer

**Estimated Time:** 5 minutes + 30 minutes testing

---

### 2. Firebase Configuration 🔥 REQUIRED

**Current State:** Code ready, credentials needed

#### 2a. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name: "Daash Wallet" (or your preference)
4. Enable Google Analytics: ✓ (recommended)
5. Select/create Analytics account
6. Click "Create Project"

**Estimated Time:** 5 minutes

#### 2b. Add Android App to Firebase

1. In Firebase Console, click Android icon
2. Android package name: `com.daash.app`
3. App nickname: "Daash Android"
4. Debug signing certificate: (optional for now)
5. Click "Register app"
6. Download `google-services.json`
7. **Place file in:** `/home/user/Daash/google-services.json` (project root)

**Estimated Time:** 5 minutes

#### 2c. Add iOS App to Firebase

1. In Firebase Console, click iOS icon
2. iOS bundle ID: `com.daash.app`
3. App nickname: "Daash iOS"
4. App Store ID: (leave blank for now)
5. Click "Register app"
6. Download `GoogleService-Info.plist`
7. **Place file in:** `/home/user/Daash/GoogleService-Info.plist` (project root)

**Estimated Time:** 5 minutes

#### 2d. Set Up Firebase Admin SDK

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file (e.g., `daash-wallet-firebase-adminsdk.json`)
4. Copy contents of the JSON file

5. Go to Supabase Dashboard → Project Settings → Secrets
6. Add new secret:
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste entire JSON contents
   - Click "Save"

**Estimated Time:** 10 minutes

#### 2e. Deploy Supabase Infrastructure

```bash
# 1. Run database migration
cd supabase
supabase db push

# 2. Deploy Edge Functions
supabase functions deploy send-push-notification
supabase functions deploy monitor-transactions

# 3. Set up secrets for Edge Functions
supabase secrets set FIREBASE_SERVICE_ACCOUNT="<paste-json-here>"
supabase secrets set STELLAR_HORIZON_URL="https://horizon.stellar.org"
```

**Estimated Time:** 15 minutes

#### 2f. Test Push Notifications

Use the test command from `FIREBASE_SETUP.md`:

```bash
curl -X POST https://YOUR_SUPABASE_URL/functions/v1/send-push-notification \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "YOUR_WALLET_ADDRESS",
    "title": "Test Notification",
    "body": "Firebase push notifications are working!"
  }'
```

**Estimated Time:** 10 minutes
**Total Firebase Setup Time:** ~50 minutes

---

### 3. iOS Live Activities Setup 📱 iOS Only

**Current State:** Code ready, needs Xcode configuration

#### 3a. Generate iOS Project

```bash
eas build --profile development --platform ios
```

**Estimated Time:** 20-30 minutes (includes build time)

#### 3b. Configure Widget Extension in Xcode

Follow detailed steps in `LIVE_ACTIVITIES_SETUP.md`:

1. Open `ios/Daash.xcworkspace` in Xcode
2. File → New → Target → Widget Extension
3. Name: `DaashWalletWidget`
4. Include Live Activity: ✓
5. Copy Swift code from `ios/DaashWalletWidget/DaashWalletWidgetLiveActivity.swift`
6. Configure signing & capabilities
7. Build and test

**Estimated Time:** 30-45 minutes

#### 3c. Test Live Activities

Use `LiveActivityTestScreen` to verify:
- ✅ Transaction Live Activity
- ✅ On-ramp Live Activity
- ✅ Lock Screen display
- ✅ Dynamic Island (iPhone 14 Pro+)

**Estimated Time:** 15 minutes
**Total iOS Live Activities Time:** ~1.5 hours

---

### 4. Production Builds 📦 REQUIRED

**Current State:** Development builds only

#### 4a. Configure EAS Build for Production

**File:** Create `eas.json` (if doesn't exist)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### 4b. Build for Production

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

**Estimated Time:** 30-45 minutes per platform
**Total Build Time:** ~1.5 hours

---

### 5. App Store Preparation 🏪 REQUIRED

#### 5a. App Icons

**Required Sizes:**

**iOS:**
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 76x76 (iPad)

**Android:**
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

**Current Status:** Have placeholder icons
**Action Required:** Create production-quality icons

**Tools:** Figma, Adobe Illustrator, or online icon generators
**Estimated Time:** 2-4 hours (design) or use existing design

#### 5b. App Screenshots

**iOS Required Screenshots:**
- iPhone 6.7" (iPhone 14 Pro Max)
- iPhone 6.5" (iPhone 11 Pro Max)
- iPhone 5.5" (iPhone 8 Plus)
- iPad Pro 12.9" (2nd gen)

**Android Required Screenshots:**
- At least 2 screenshots
- Recommended: 4-8 screenshots
- Sizes: 1080x1920 (portrait) or 1920x1080 (landscape)

**Screens to Screenshot:**
1. Home screen (with balance)
2. Transaction history
3. Send screen
4. Transaction detail modal
5. Profile/Settings
6. Live Activity (iOS only)

**Estimated Time:** 2-3 hours

#### 5c. App Store Listing

**Required Content:**

**App Name:**
- "Daash - Stellar Wallet" or similar
- Max 30 characters (iOS), 50 characters (Android)

**Subtitle (iOS only):**
- "Fast, Secure Stellar Payments"
- Max 30 characters

**Description:**
Write compelling description highlighting:
- Stellar blockchain wallet
- Fast, low-cost transactions
- Secure encrypted storage
- Buy crypto with fiat (on-ramp)
- iOS Live Activities
- Easy to use

**Keywords (iOS):**
- stellar, wallet, cryptocurrency, xlm, usdc, blockchain, crypto

**Category:**
- Primary: Finance
- Secondary: Productivity (optional)

**Estimated Time:** 2-3 hours

---

### 6. Legal & Compliance 📄 REQUIRED

#### 6a. Privacy Policy

**Required Content:**
- What data you collect (wallet addresses, transaction history)
- How you use it (display balance, transaction history)
- Third-party services (Firebase, Supabase, Ramp Network)
- User rights (access, deletion, etc.)
- Contact information

**Current Status:** Referenced in app, needs to be written
**Action:** Write privacy policy and host at a URL

**Tools:**
- [TermsFeed Privacy Policy Generator](https://www.termsfeed.com/privacy-policy-generator/)
- [Freeprivacypolicy.com](https://www.freeprivacypolicy.com/)

**Estimated Time:** 2-3 hours

#### 6b. Terms of Service

**Required Content:**
- Usage terms
- User responsibilities
- Liability limitations
- Account termination
- Dispute resolution

**Estimated Time:** 2-3 hours

#### 6c. Host Legal Documents

Options:
1. Create simple website with legal docs
2. Use GitHub Pages (free)
3. Host on your domain

**Example URLs:**
- `https://daash.app/privacy`
- `https://daash.app/terms`

Update these in app (LegalScreen.tsx)

**Estimated Time:** 1 hour

**Total Legal Time:** ~6 hours (can use templates)

---

### 7. Environment Variables & Configuration 🔧

#### 7a. Production Environment Variables

**Create:** `.env.production`

```bash
# Stellar Network
STELLAR_NETWORK=PUBLIC
STELLAR_HORIZON_URL=https://horizon.stellar.org

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key

# Ramp Network
RAMP_API_KEY=your-production-api-key

# Firebase (if using for analytics)
FIREBASE_PROJECT_ID=your-project-id
```

**Estimated Time:** 30 minutes

#### 7b. App Version & Build Numbers

**File:** `app.json`

```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

**Estimated Time:** 5 minutes

#### 7c. Remove Test/Debug Code

Search for and remove:
- `console.log()` statements (or use production logger)
- Test notifications
- Debug flags
- Commented code

**Estimated Time:** 30 minutes

**Total Configuration Time:** ~1 hour

---

### 8. Security Audit 🔒

#### 8a. Review Security Practices

**Checklist:**
- [ ] Private keys encrypted at rest (✅ Already done with SecureStore)
- [ ] No secrets in code (API keys, etc.)
- [ ] HTTPS for all network requests
- [ ] Input validation for user data
- [ ] Secure random number generation for wallets
- [ ] Biometric authentication (optional, add if needed)
- [ ] Certificate pinning (optional, advanced)

**Estimated Time:** 2-3 hours

#### 8b. Test Security Scenarios

- [ ] Test with invalid private keys
- [ ] Test with malformed transactions
- [ ] Test network failures
- [ ] Test background/foreground transitions
- [ ] Test app deletion/reinstallation

**Estimated Time:** 2 hours

**Total Security Audit Time:** ~5 hours

---

### 9. Testing 🧪

#### 9a. End-to-End Testing on Real Devices

**Test on:**
- iPhone (iOS 16.1+)
- iPhone Pro (for Dynamic Island)
- Android phone (latest OS)
- iPad (optional)
- Android tablet (optional)

**Test Flows:**
1. ✅ Create new wallet
2. ✅ Import existing wallet
3. ✅ Send transaction (small amount)
4. ✅ Receive transaction
5. ✅ View transaction history
6. ✅ View transaction details
7. ✅ Test notifications (push & local)
8. ✅ Test Live Activities (iOS)
9. ✅ Test on-ramp (Ramp Network)
10. ✅ Profile management
11. ✅ Settings changes
12. ✅ App background/foreground
13. ✅ Network offline/online
14. ✅ Low balance scenarios

**Estimated Time:** 4-6 hours

#### 9b. Beta Testing

**TestFlight (iOS):**
1. Upload build to App Store Connect
2. Set up TestFlight
3. Invite beta testers (10-20 people)
4. Collect feedback
5. Fix issues

**Google Play Internal Testing (Android):**
1. Upload APK to Play Console
2. Create internal testing track
3. Invite testers
4. Collect feedback
5. Fix issues

**Estimated Time:** 1-2 weeks

**Total Testing Time:** ~2 weeks

---

### 10. Monitoring & Analytics 📊

#### 10a. Error Tracking

**Recommended:** Sentry

```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android
```

Configure error reporting for:
- Crashes
- Unhandled errors
- Network failures
- Transaction failures

**Estimated Time:** 2 hours

#### 10b. Analytics

**Options:**
- Firebase Analytics (already integrated)
- Mixpanel
- Amplitude

**Track:**
- User signups (wallet creation)
- Transactions sent
- Transactions received
- On-ramp usage
- Screen views
- Feature usage

**Estimated Time:** 2-3 hours

**Total Monitoring Time:** ~5 hours

---

### 11. App Review Preparation 📝

#### 11a. Apple App Review

**Required:**
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Demo account (if needed)
- [ ] Review notes (how to test)
- [ ] Contact information
- [ ] Age rating information
- [ ] Content rights declaration

**Common Rejection Reasons:**
- Missing privacy policy
- Cryptocurrency compliance (provide clear description)
- In-app purchases (none in your app)
- Crashes during review
- Incomplete information

**Estimated Time:** 2 hours (prep) + 1-3 days (review time)

#### 11b. Google Play Review

**Required:**
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target audience
- [ ] Data safety form
- [ ] Store listing complete

**Estimated Time:** 2 hours (prep) + 1-3 days (review time)

**Total Review Prep Time:** ~4 hours

---

### 12. Production Deployment Checklist ✈️

#### Final Checklist Before Submission

**Code:**
- [ ] Switched to Stellar mainnet
- [ ] All test code removed
- [ ] Production environment variables set
- [ ] Version numbers updated
- [ ] No console.logs in production

**Firebase:**
- [ ] Firebase project created
- [ ] google-services.json added
- [ ] GoogleService-Info.plist added
- [ ] Firebase Admin SDK configured
- [ ] Push notifications tested

**Supabase:**
- [ ] Database migrations run
- [ ] Edge Functions deployed
- [ ] Secrets configured
- [ ] Push tokens table created

**iOS:**
- [ ] Widget Extension configured
- [ ] Live Activities tested
- [ ] Production build created
- [ ] TestFlight tested

**Android:**
- [ ] Production build created
- [ ] Internal testing completed

**Legal:**
- [ ] Privacy policy written and hosted
- [ ] Terms of service written and hosted
- [ ] URLs updated in app

**App Store:**
- [ ] App icons ready (all sizes)
- [ ] Screenshots captured (all devices)
- [ ] Description written
- [ ] Keywords added
- [ ] Category selected

**Testing:**
- [ ] All core features tested
- [ ] All critical flows tested
- [ ] Beta testing completed
- [ ] Issues fixed

**Monitoring:**
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] Crash reporting working

**Review:**
- [ ] App Store Connect listing complete
- [ ] Google Play Console listing complete
- [ ] Demo instructions ready
- [ ] Contact information provided

---

## 📅 Estimated Timeline

### Minimum Path to Production (Critical Only)

| Task | Time Required | Can Start |
|------|---------------|-----------|
| 1. Switch to Mainnet | 1 hour | Immediately |
| 2. Firebase Setup | 1 hour | Immediately |
| 3. iOS Live Activities | 2 hours | After Firebase |
| 4. Production Builds | 2 hours | After testing |
| 5. App Store Prep | 8 hours | In parallel |
| 6. Legal Docs | 6 hours | In parallel |
| 7. Configuration | 1 hour | Immediately |
| 8. Security Audit | 5 hours | In parallel |
| 9. Testing | 1 week | After builds |
| 10. Monitoring | 5 hours | In parallel |
| 11. Review Prep | 4 hours | After testing |

**Total Active Work:** ~35-40 hours
**Total Calendar Time:** 2-3 weeks (including testing & review)

### Fast Track (Experienced Developer)

- Week 1: Setup (Firebase, builds, legal) - 20 hours
- Week 2: Testing & polish - 20 hours
- Week 3: Submit & iterate on review feedback - 10 hours

**Total:** 3 weeks

### Realistic Timeline (First Production App)

- Week 1-2: Setup, configuration, builds - 30 hours
- Week 3-4: Testing, bug fixes, polish - 30 hours
- Week 5: Legal, app store prep, screenshots - 15 hours
- Week 6: Beta testing & feedback - 10 hours
- Week 7: Final fixes & submission - 10 hours
- Week 8+: App review process (1-7 days per platform)

**Total:** 6-8 weeks

---

## 🎯 Priority Order (Recommended)

### Phase 1: Critical Setup (Week 1)
1. Switch to Stellar mainnet
2. Firebase configuration
3. Test push notifications
4. Production environment variables
5. Remove test code

### Phase 2: Builds & Testing (Week 2)
1. Create production builds
2. iOS Live Activities setup
3. End-to-end testing on devices
4. Security audit
5. Fix critical bugs

### Phase 3: Legal & Assets (Week 3)
1. Write privacy policy & terms
2. Host legal documents
3. Create app icons
4. Capture screenshots
5. Write app descriptions

### Phase 4: Submission (Week 4)
1. Set up monitoring
2. Complete app store listings
3. Internal testing
4. Beta testing (TestFlight/Internal)
5. Submit for review

### Phase 5: Launch (Week 5+)
1. Respond to review feedback
2. Fix any issues
3. Get approved
4. Release to production
5. Monitor initial users

---

## 🚨 Critical Warnings

### ⚠️ MUST DO BEFORE PRODUCTION

1. **Switch to Mainnet** - Currently on testnet, transactions use fake XLM
2. **Test with Real Money** - Send small amount (0.1 XLM) to verify
3. **Backup Test Wallet** - Keep test wallet secret key for testing
4. **Firebase Setup** - Push notifications won't work without it
5. **Legal Documents** - Apple/Google will reject without privacy policy

### ⚠️ FINANCIAL RISKS

- Using mainnet = real money transactions
- Test thoroughly with small amounts first
- Have support system ready for user issues
- Consider transaction limits for new users

### ⚠️ COMPLIANCE

- Cryptocurrency apps have strict rules
- On-ramp/off-ramp may require KYC/AML compliance
- Check regulations in your target countries
- Consider consulting with legal expert

---

## 📞 Support & Resources

### Documentation
- `FIREBASE_SETUP.md` - Firebase & push notification setup
- `LIVE_ACTIVITIES_SETUP.md` - iOS Live Activities setup
- Apple Developer: https://developer.apple.com/
- Google Play Console: https://play.google.com/console

### Tools
- EAS Build: https://docs.expo.dev/build/introduction/
- Firebase Console: https://console.firebase.google.com/
- Supabase Dashboard: https://supabase.com/dashboard
- App Store Connect: https://appstoreconnect.apple.com/
- Google Play Console: https://play.google.com/console

---

## ✅ Ready When...

You're ready for production when:

- [ ] All critical checklist items complete
- [ ] App tested on real devices with real transactions
- [ ] Firebase push notifications working
- [ ] iOS Live Activities working (iOS only)
- [ ] Privacy policy and terms hosted
- [ ] App store listings complete
- [ ] Beta testing successful
- [ ] No critical bugs
- [ ] Monitoring and error tracking active
- [ ] Support system ready for users

---

**Current Status:** Development Complete ✅
**Next Step:** Start with Phase 1 (Critical Setup)
**Estimated Time to Production:** 3-6 weeks

Good luck with your launch! 🚀
