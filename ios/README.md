# CoachHub iOS App

Native iOS app for CoachHub baseball team management, built with SwiftUI.

## Requirements

- Xcode 15.0+
- iOS 15.0+
- macOS 13.0+ (for development)
- Active Apple Developer account (for Sign in with Apple)

## Project Setup

### 1. Open the Project

```bash
cd ios/CoachHub
open CoachHub.xcodeproj
```

### 2. Configure Signing & Capabilities

1. In Xcode, select the CoachHub target
2. Go to "Signing & Capabilities" tab
3. Select your development team
4. Ensure bundle identifier is set to: `com.travelcoach.coachhub`
5. Verify the following capabilities are enabled:
   - **Sign in with Apple**
   - **Keychain Sharing**

### 3. Add Apple Service ID

For Sign in with Apple to work:

1. Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list)
2. Create an App ID for CoachHub with "Sign in with Apple" enabled
3. Create a Service ID for the web callback
4. Configure the service ID with return URLs for your backend

### 4. Backend Configuration

Ensure your backend at `https://coach.z-q.me` has:
- `/api/auth/apple` endpoint configured
- Apple auth verification setup
- JWT token generation

### 5. Build and Run

1. Select a simulator or connect your device
2. Press Cmd+R to build and run
3. The app will launch with the Login screen

## Architecture

### Project Structure

```
CoachHub/
├── Models/              # Data models matching backend schema
│   ├── User.swift
│   ├── Player.swift
│   ├── Event.swift
│   ├── Tournament.swift
│   ├── Workout.swift
│   └── ...
├── Services/           # API communication layer
│   ├── APIClient.swift
│   ├── AuthService.swift
│   ├── EventService.swift
│   ├── PlayerService.swift
│   └── ...
├── ViewModels/         # Business logic
│   ├── AuthViewModel.swift
│   └── DashboardViewModel.swift
├── Views/              # SwiftUI views
│   ├── Auth/
│   ├── Dashboard/
│   ├── Schedule/
│   ├── Roster/
│   ├── Travel/
│   ├── Workouts/
│   └── Profile/
├── Utilities/          # Helper classes
│   ├── KeychainManager.swift
│   └── BiometricAuthManager.swift
├── Config.swift        # App configuration
└── CoachHubApp.swift   # App entry point
```

### Authentication Flow

1. User taps "Sign in with Apple" button
2. iOS presents Apple ID authentication
3. App receives identity token and authorization code
4. Sends to backend `/api/auth/apple` endpoint
5. Backend verifies token and returns JWT
6. App stores JWT in Keychain
7. Subsequent API requests include JWT in Authorization header

### Biometric Authentication

- Face ID/Touch ID can be enabled in Profile settings
- Stored preference in UserDefaults
- Used for quick re-authentication

## API Integration

Base URL: `https://coach.z-q.me/api`

### Endpoints Used

- `POST /auth/apple` - Apple sign in
- `GET /events` - Fetch events
- `POST /events` - Create event
- `GET /players` - Fetch players
- `POST /players` - Create player
- `GET /tournaments` - Fetch tournaments
- `POST /tournaments` - Create tournament
- `GET /workouts` - Fetch workouts
- `POST /workouts` - Create workout

All requests (except auth) include:
```
Authorization: Bearer <JWT_TOKEN>
```

## Features

### ✅ Implemented

- Sign in with Apple authentication
- Face ID / Touch ID support
- Dashboard with upcoming events and stats
- Schedule view with event management
- Roster management
- Tournament/travel planning
- Workout program builder
- User profile with settings

### 🚧 Coming Soon

- Push notifications
- Offline support
- Photo upload for players
- Document scanning
- Game stats tracking
- RSVP functionality
- Carpooling coordination

## Development

### Adding New Files

When adding new Swift files to the project:

1. Create the file in the appropriate directory
2. In Xcode: File > Add Files to "CoachHub"
3. Ensure "Add to targets: CoachHub" is checked
4. Verify the file appears in the Project Navigator

### Building for Release

1. Update version in Info.plist
2. Archive the app: Product > Archive
3. Distribute to App Store or TestFlight
4. Ensure all capabilities are properly configured

### Testing

- Use iOS Simulator for quick testing
- Test on physical device for biometric auth
- Verify network calls work with production API
- Test error handling and loading states

## Troubleshooting

### Build Errors

**"No such module" errors**
- Clean build folder: Cmd+Shift+K
- Close and reopen Xcode
- Check that all files are added to target

**Signing errors**
- Verify team selection in Signing & Capabilities
- Ensure bundle ID matches provisioning profile
- Check that Apple Developer account is active

### Runtime Issues

**Sign in with Apple not working**
- Verify capability is enabled in Xcode
- Check Apple Developer console configuration
- Ensure bundle ID matches service ID
- Verify backend endpoint is accessible

**API calls failing**
- Check network connectivity
- Verify JWT token is being stored/retrieved
- Check API base URL in Config.swift
- Review backend logs for errors

**Keychain errors**
- Reset simulator: Device > Erase All Content and Settings
- On device: Delete and reinstall app

## Support

For issues or questions:
1. Check ARCHITECTURE.md and DEVELOPMENT_STATUS.md
2. Review backend API documentation
3. Contact the development team

## License

Proprietary - All rights reserved
