# CoachHub iOS Native App - Development Status

**Last Updated**: December 16, 2024
**Current Phase**: Foundation & Authentication
**Target Completion**: 7-10 days (full app)

## Project Overview

Building a complete native iOS app to replace the PWA. The app will use:
- **Authentication**: Sign in with Apple + Face ID/Touch ID
- **Architecture**: SwiftUI + MVVM
- **Backend**: Existing Next.js API (modifications needed)
- **Target**: iOS 15+

## Development Progress

### ✅ Completed

**Project Setup**:
- [x] Xcode project created
- [x] Project structure defined
- [x] Architecture documentation (ARCHITECTURE.md)
- [x] Configuration file (Config.swift)

**Security & Authentication**:
- [x] KeychainManager for secure token storage
- [x] BiometricAuthManager for Face ID/Touch ID
- [x] User model with Apple Auth support

### ⏳ In Progress

**Authentication System**:
- [ ] AuthService with Sign in with Apple
- [ ] AuthViewModel for state management
- [ ] LoginView UI with Apple Sign In button
- [ ] Biometric authentication flow

### 📋 Pending

**Data Models** (20+ files):
- [ ] Player model
- [ ] Event model
- [ ] Tournament model
- [ ] Workout model
- [ ] Game model
- [ ] RSVP model
- [ ] (15+ more models)

**Networking Layer**:
- [ ] APIClient base class
- [ ] EventService
- [ ] PlayerService
- [ ] TournamentService
- [ ] WorkoutService
- [ ] Error handling

**Main Views**:
- [ ] Dashboard/Home
- [ ] Schedule (calendar view)
- [ ] Roster (player list)
- [ ] Travel (tournaments)
- [ ] Workouts
- [ ] Settings/Profile

**Backend Modifications**:
- [ ] Apple Sign In endpoint (`/api/auth/apple`)
- [ ] JWT token generation
- [ ] CORS configuration for iOS
- [ ] User registration with Apple ID

## Timeline Estimate

### Week 1: Foundation (Days 1-3)
**Day 1**:
- ✅ Project setup
- ⏳ Authentication (Sign in with Apple)
- ⏳ Biometric auth
- ⏳ Backend auth endpoint

**Day 2**:
- Data models (all entities)
- Networking layer (APIClient)
- Service classes (API calls)

**Day 3**:
- Dashboard view
- Navigation structure
- Basic UI components

### Week 2: Core Features (Days 4-7)
**Day 4**:
- Schedule view with calendar
- Event list and details
- Create/edit events

**Day 5**:
- Roster view with player list
- Player details
- Create/edit players

**Day 6**:
- Travel view with tournaments
- Tournament details
- Carpools and expenses

**Day 7**:
- Workouts view
- Workout details
- Create/edit workouts

### Week 3: Polish (Days 8-10)
**Day 8**:
- Document upload (camera/photos)
- Image handling
- File management

**Day 9**:
- Pull-to-refresh
- Search and filters
- Loading states
- Error handling

**Day 10**:
- Testing and bug fixes
- UI polish
- Performance optimization
- App Store preparation

## Current Status: Day 1

### What's Done Today:
1. ✅ Project architecture planned
2. ✅ Keychain security implemented
3. ✅ Biometric auth ready
4. ✅ User models created
5. ⏳ Building Sign in with Apple integration

### Next Immediate Steps:
1. Complete AuthService (Sign in with Apple)
2. Build LoginView UI
3. Create backend Apple auth endpoint
4. Test authentication flow
5. Move to data models

## Backend Requirements

### New Endpoints Needed:

**POST `/api/auth/apple`**:
```typescript
Request:
{
  identityToken: string,
  authorizationCode: string,
  fullName?: { givenName: string, familyName: string },
  email?: string
}

Response:
{
  user: User,
  token: string (JWT),
  isNewUser: boolean
}
```

### Modifications Needed:
1. Add JWT token generation
2. Add CORS for iOS app
3. Handle Apple ID verification
4. Create/update user with Apple ID

## Dependencies

### iOS Frameworks Used:
- SwiftUI (UI)
- Combine (Reactive programming)
- AuthenticationServices (Sign in with Apple)
- LocalAuthentication (Face ID/Touch ID)
- Security (Keychain)

### No External Dependencies:
- Using native URLSession (no Alamofire)
- Using native Swift (no third-party libraries)
- Keeping it lightweight and maintainable

## Testing Plan

### Unit Tests:
- ViewModels
- Services
- Model transformations

### Integration Tests:
- API calls
- Authentication flow
- Data persistence

### Manual Testing:
- Physical device testing
- Different iOS versions (15, 16, 17)
- Face ID and Touch ID
- Different screen sizes
- Dark mode

## Risks & Mitigation

**Risk 1**: Backend Apple Auth Integration
- **Mitigation**: Well-documented Apple APIs, standard implementation

**Risk 2**: Timeline Accuracy
- **Mitigation**: Phased approach, can deliver MVP first

**Risk 3**: App Store Approval
- **Mitigation**: Following Apple guidelines, proper privacy policy

## Notes

- This is a complete rewrite, not a wrapper
- All UI is native SwiftUI
- No web views or HTML/CSS/JS
- True iOS-native experience
- Eventually replaces PWA

## Questions/Decisions

1. ✅ Authentication: Sign in with Apple (confirmed)
2. ✅ Biometrics: Face ID/Touch ID (confirmed)
3. ⏳ Offline mode: Phase 2 (not in MVP)
4. ⏳ Push notifications: Phase 3
5. ⏳ Widgets: Phase 4

---

**Status**: 🟡 In Active Development
**Confidence**: High (architecture solid, clear path forward)
**ETA**: 7-10 days for complete app
**Current Blocker**: None (building authentication now)
