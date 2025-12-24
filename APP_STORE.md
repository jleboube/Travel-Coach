# Travel-Coach App Store Submission Guide

> Complete reference for submitting Travel-Coach to the iOS App Store

---

## Table of Contents

1. [App Store Connect - New App Setup](#1-app-store-connect---new-app-setup)
2. [App Information](#2-app-information)
3. [Pricing and Availability](#3-pricing-and-availability)
4. [App Privacy](#4-app-privacy)
5. [App Store Listing](#5-app-store-listing)
6. [App Review Information](#6-app-review-information)
7. [Version Information](#7-version-information)
8. [TestFlight Setup](#8-testflight-setup)
9. [Submission Checklist](#9-submission-checklist)

---

## 1. App Store Connect - New App Setup

**URL**: https://appstoreconnect.apple.com/

### Create New App

Navigate to: **My Apps** → **+** → **New App**

| Field | Value |
|-------|-------|
| Platforms | ☑️ iOS |
| Name | `Travel-Coach` |
| Primary Language | `English (U.S.)` |
| Bundle ID | `com.joeleboube.CoachHub` |
| SKU | `coachhub-2024` |
| User Access | `Full Access` |

---

## 2. App Information

Navigate to: **App Store** → **App Information**

### General Information

| Field | Value |
|-------|-------|
| Name | `Travel-Coach` |
| Subtitle | `Travel Baseball Team Manager` |
| Primary Category | `Sports` |
| Secondary Category | `Productivity` (optional) |
| Content Rights | `Does not contain, show, or access third-party content` |

### Age Rating

Click **Edit** next to Age Rating and answer:

| Question | Answer |
|----------|--------|
| Cartoon or Fantasy Violence | `None` |
| Realistic Violence | `None` |
| Prolonged Graphic or Sadistic Realistic Violence | `None` |
| Profanity or Crude Humor | `None` |
| Mature/Suggestive Themes | `None` |
| Horror/Fear Themes | `None` |
| Medical/Treatment Information | `None` |
| Alcohol, Tobacco, or Drug Use or References | `None` |
| Simulated Gambling | `None` |
| Sexual Content or Nudity | `None` |
| Graphic Sexual Content and Nudity | `None` |
| Unrestricted Web Access | `No` |
| Gambling with Real Currency | `No` |

**Result**: Age Rating will be **4+**

---

## 3. Pricing and Availability

Navigate to: **App Store** → **Pricing and Availability**

| Field | Value |
|-------|-------|
| Price | `Free` |
| Availability | `Available in all territories` (or select specific countries) |
| Pre-Orders | `No` |

---

## 4. App Privacy

Navigate to: **App Store** → **App Privacy**

### Privacy Policy URL

```
https://coach.z-q.me/privacy
```

### Data Collection

**Do you or your third-party partners collect data from this app?**
→ Select: **Yes, we collect data from this app**

### Data Types

Click **Get Started** and select the following data types:

#### Contact Info
- ☑️ **Name**
  - Usage: `App Functionality`
  - Linked to User: `Yes`
  - Tracking: `No`

- ☑️ **Email Address**
  - Usage: `App Functionality`
  - Linked to User: `Yes`
  - Tracking: `No`

#### Identifiers
- ☑️ **User ID**
  - Usage: `App Functionality`
  - Linked to User: `Yes`
  - Tracking: `No`

#### Usage Data
- ☑️ **Product Interaction**
  - Usage: `Analytics`
  - Linked to User: `No`
  - Tracking: `No`

#### Diagnostics
- ☑️ **Crash Data**
  - Usage: `App Functionality`
  - Linked to User: `No`
  - Tracking: `No`

### Data Linked to User Summary

After completing the above, your privacy nutrition label will show:

**Data Linked to You:**
- Contact Info (Name, Email)
- Identifiers (User ID)

**Data Not Linked to You:**
- Usage Data
- Diagnostics

---

## 5. App Store Listing

Navigate to: **App Store** → **[Version]** (e.g., 1.0)

### Screenshots

Required sizes (provide at least one set):
- **6.7" Display** (iPhone 15 Pro Max): 1290 x 2796 pixels
- **6.5" Display** (iPhone 11 Pro Max): 1284 x 2778 pixels
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208 pixels

*Tip: Take screenshots from Simulator or device, then upload*

### Promotional Text (170 characters max)

```
Simplify your travel baseball season. Manage rosters, schedules, tournaments, and team communications all in one app. Built by coaches, for coaches.
```

### Description (4000 characters max)

```
Travel-Coach is the complete team management solution designed specifically for travel baseball teams. Whether you're a head coach, assistant, team manager, or parent, Travel-Coach keeps everyone connected and organized throughout the season.

KEY FEATURES:

ROSTER MANAGEMENT
• Track complete player profiles with jersey numbers, positions, and stats
• Store player performance metrics including velocity and sprint times
• Manage parent/guardian contact information
• Organize players by graduation year

SCHEDULE & EVENTS
• Create and manage practices, games, and team events
• View team calendar with all upcoming activities
• Set event locations with map integration
• Track RSVPs and attendance

TOURNAMENT COORDINATION
• Plan travel baseball tournaments with all details in one place
• Hotel booking coordination and travel logistics
• Tournament schedules and bracket information
• 90-day advance reminders for travel planning

TEAM COMMUNICATIONS
• Send announcements to the entire team instantly
• Priority messaging for urgent updates
• Push notifications for important events
• Keep parents and players informed

DOCUMENT MANAGEMENT
• Upload and store important team documents
• Share waivers, medical forms, and schedules
• AI-powered document parsing for quick data entry
• Secure cloud storage

SECURE & PRIVATE
• Sign in securely with Apple ID
• Role-based access (Coach, Manager, Parent, Player)
• Your team's data stays private
• Face ID/Touch ID support for quick access

Perfect for:
• Travel baseball team coaches
• Team managers and administrators
• Baseball parents keeping track of schedules
• Youth baseball organizations

Download Travel-Coach today and spend less time organizing and more time on the field!
```

### Keywords (100 characters max, comma-separated)

```
baseball,travel baseball,team management,youth sports,coaching,roster,schedule,tournament,softball
```

### Support URL

```
https://coach.z-q.me
```

### Marketing URL (optional)

```
https://coach.z-q.me
```

### Version

```
1.0.0
```

### Copyright

```
2025 Joe LeBoube
```

---

## 6. App Review Information

Navigate to: **App Store** → **[Version]** → **App Review Information**

### Contact Information

| Field | Value |
|-------|-------|
| First Name | `Joe` |
| Last Name | `LeBoube` |
| Phone Number | `[Your phone number]` |
| Email | `[Your email address]` |

### Sign-In Information

| Field | Value |
|-------|-------|
| Sign-in required | ☑️ Yes |
| Demo Account | `N/A - Uses Apple Sign In` |

### Notes for Review

```
Travel-Coach is a team management app for travel baseball teams.

AUTHENTICATION:
This app uses Sign in with Apple for authentication. No demo credentials are needed - reviewers can sign in with any Apple ID.

FIRST-TIME USER EXPERIENCE:
1. Tap "Sign in with Apple"
2. Complete Apple authentication
3. Choose to create a new team or browse the app
4. If creating a team, enter team name and details
5. Add players and events from the dashboard

KEY FEATURES TO TEST:
• Sign in with Apple ID
• Create a new team
• Add players to the roster
• Create events and view the schedule
• Send an announcement
• Upload a document

PUSH NOTIFICATIONS:
Push notifications are enabled for event reminders and announcements. The app will request notification permission on first launch.

PRIVACY & LEGAL:
• Privacy Policy: https://coach.z-q.me/privacy
• Terms of Service: https://coach.z-q.me/terms

CONTACT:
If you have any questions during review, please contact me at [your email].

Thank you for reviewing Travel-Coach!
```

### Attachment (optional)

*You can attach a video walkthrough if desired*

---

## 7. Version Information

Navigate to: **App Store** → **[Version]** → **Version Information**

### What's New in This Version

```
Initial release of Travel-Coach!

• Roster management with player profiles and stats
• Team calendar with practices, games, and events
• Tournament planning with travel coordination
• Team announcements and communications
• Push notifications for upcoming events
• Document upload and management
• Secure Sign in with Apple
• Face ID/Touch ID support
```

---

## 8. TestFlight Setup

Navigate to: **TestFlight** tab

### App Information for TestFlight

| Field | Value |
|-------|-------|
| Beta App Description | `Travel-Coach beta - Help us test the app before public release!` |
| Feedback Email | `[Your email address]` |
| Privacy Policy URL | `https://coach.z-q.me/privacy` |
| License Agreement | `Use Standard Apple License Agreement` |

### Test Information

| Field | Value |
|-------|-------|
| What to Test | (see below) |
| Beta App Review Notes | Same as App Review Notes above |

#### What to Test

```
Thank you for testing Travel-Coach!

Please test the following features:

1. SIGN IN
   - Sign in with your Apple ID
   - Verify biometric authentication works (Face ID/Touch ID)

2. TEAM SETUP
   - Create a new team
   - Edit team details

3. ROSTER
   - Add new players
   - Edit player information
   - View player profiles

4. SCHEDULE
   - Create practice events
   - Create game events
   - View calendar
   - Test event notifications

5. TOURNAMENTS
   - Create a tournament
   - Add tournament details
   - View tournament schedule

6. ANNOUNCEMENTS
   - Send a team announcement
   - Test push notification delivery

7. DOCUMENTS
   - Upload a document
   - View document list

Please report any bugs or issues to: [your email]
```

### Internal Testing Group

1. Click **Internal Testing** → **+** (Create Group)
2. Group Name: `Internal Testers`
3. Add testers by Apple ID email (must be App Store Connect users)

### External Testing Group (Optional)

1. Click **External Testing** → **+** (Create Group)
2. Group Name: `Beta Testers`
3. Add testers by email
4. Submit for Beta App Review (usually 24-48 hours)

---

## 9. Submission Checklist

### Before Building in Xcode

- [ ] Update version number in Xcode (1.0.0)
- [ ] Update build number in Xcode (1)
- [ ] Verify Bundle ID matches: `com.joeleboube.CoachHub`
- [ ] Verify Team is selected in Signing & Capabilities
- [ ] Push Notification capability is added
- [ ] App icon is set (all sizes)

### Before Uploading to App Store Connect

- [ ] Select "Any iOS Device (arm64)" as build target
- [ ] Product → Archive
- [ ] Validate archive (Organizer → Validate App)
- [ ] Distribute to App Store Connect

### In App Store Connect

- [ ] Privacy Policy URL entered
- [ ] App Privacy questionnaire completed
- [ ] Screenshots uploaded (all required sizes)
- [ ] Description entered
- [ ] Keywords entered
- [ ] Support URL entered
- [ ] Contact information entered
- [ ] App Review notes entered
- [ ] Age rating completed
- [ ] Pricing set (Free)
- [ ] Build selected from uploaded builds

### Final Submission

- [ ] Review all information
- [ ] Click "Add for Review"
- [ ] Answer export compliance questions (No custom encryption)
- [ ] Answer advertising identifier question (No IDFA)
- [ ] Click "Submit for Review"

---

## Export Compliance Questions

When submitting, you'll be asked:

**Does your app use encryption?**
→ Select: **Yes**

**Does your app qualify for any of the exemptions provided in Category 5, Part 2 of the U.S. Export Administration Regulations?**
→ Select: **Yes**

*Explanation: The app uses HTTPS for network communication, which is standard encryption exempt from export regulations.*

**Does your app contain, display, or access third-party content?**
→ Select: **No**

---

## Advertising Identifier (IDFA)

**Does this app use the Advertising Identifier (IDFA)?**
→ Select: **No**

---

## Common Rejection Reasons & How to Avoid

| Reason | Prevention |
|--------|------------|
| Crashes | Test thoroughly on multiple devices |
| Broken links | Verify Privacy Policy and Support URLs work |
| Incomplete information | Fill out all required fields |
| Poor screenshots | Use high-quality, accurate screenshots |
| Missing features | Ensure all described features work |
| Login issues | Sign in with Apple must work flawlessly |

---

## Useful Links

- **App Store Connect**: https://appstoreconnect.apple.com/
- **Apple Developer Portal**: https://developer.apple.com/account
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/

---

## Support

- **Privacy Policy**: https://coach.z-q.me/privacy
- **Terms of Service**: https://coach.z-q.me/terms
- **Support Website**: https://coach.z-q.me

---

*Last Updated: December 23, 2025*
