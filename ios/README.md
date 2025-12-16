# CoachHub Baseball - iOS App

This directory contains the native iOS application that wraps the CoachHub Baseball web app.

## Features

- **WKWebView Integration**: Loads the CoachHub web app (https://coach.z-q.me) in a native iOS container
- **File Upload Support**: Native file picker for uploading documents, photos, and spreadsheets
- **Pull-to-Refresh**: Native pull-to-refresh gesture to reload the app
- **Loading Indicators**: Activity spinner during page loads
- **Error Handling**: User-friendly error messages with retry functionality
- **JavaScript Support**: Full JavaScript alert, confirm, and prompt dialog support
- **Gesture Navigation**: Swipe gestures for back/forward navigation
- **Permissions**: Camera, photo library, and microphone access for document scanning and media uploads

## Project Structure

```
ios/CoachHub/
├── CoachHub.xcodeproj/         # Xcode project file
└── CoachHub/                    # Source code
    ├── AppDelegate.swift        # App lifecycle management
    ├── SceneDelegate.swift      # Scene lifecycle management
    ├── ViewController.swift     # Main WebView controller
    ├── Info.plist              # App configuration and permissions
    ├── Assets.xcassets/        # App icons and images
    ├── Base.lproj/
    │   ├── Main.storyboard     # Main UI storyboard
    │   └── LaunchScreen.storyboard  # Launch screen
    └── CoachHub.entitlements   # App entitlements (if needed)
```

## Building and Running

### Prerequisites

- macOS with Xcode 14.0 or later
- iOS 13.0 or later target device/simulator
- Apple Developer account (for device testing)

### Steps

1. **Open the project**:
   ```bash
   cd /Users/joeleboube/Development/travel-coach/ios/CoachHub
   open CoachHub.xcodeproj
   ```

2. **Select a target**:
   - Click on the device selector in the toolbar
   - Choose an iOS simulator (e.g., "iPhone 15 Pro")
   - Or select your physical device (requires signing)

3. **Build the project**:
   - Press `Cmd+B` or select Product > Build

4. **Run the app**:
   - Press `Cmd+R` or select Product > Run
   - The app will launch in the simulator or on your device

### Code Signing (for Physical Devices)

If running on a physical device:

1. Select the CoachHub project in the navigator
2. Select the CoachHub target
3. Go to "Signing & Capabilities"
4. Check "Automatically manage signing"
5. Select your Team from the dropdown
6. Xcode will automatically generate a provisioning profile

## Configuration

### App URL

The app loads the web app from `https://coach.z-q.me`. To change this:

1. Open `ViewController.swift`
2. Modify the `appURL` constant (line 15):
   ```swift
   let appURL = "https://your-domain.com"
   ```
3. Update `Info.plist` network security settings (lines 75-86) to match your domain

### Permissions

The app requests the following permissions (configured in Info.plist):

- **Camera**: For document scanning and team photos
- **Photo Library**: For uploading existing photos
- **Microphone**: For potential video recording features

To modify permission descriptions:
1. Open `Info.plist`
2. Edit the usage description strings (lines 90-99)

### Network Security

The app enforces HTTPS with TLS 1.2+ for the domain `coach.z-q.me`. To add additional domains:

1. Open `Info.plist`
2. Add new domain under `NSAppTransportSecurity` > `NSExceptionDomains` (lines 74-86)

## Key Files Explained

### ViewController.swift
Main view controller that:
- Sets up and manages WKWebView
- Handles navigation events (loading, errors)
- Implements file picker for document uploads
- Provides pull-to-refresh functionality
- Shows native alerts for JavaScript dialogs

**Key Methods**:
- `loadView()`: Configures WKWebView with proper settings
- `loadWebApp()`: Loads the web app URL
- `setupPullToRefresh()`: Adds pull-to-refresh gesture
- `webView(_:runOpenPanelWith:)`: Handles file uploads

### Info.plist
Configuration file containing:
- App metadata (name, version, bundle ID)
- Supported orientations
- Network security settings
- Permission usage descriptions
- Scene configuration

### AppDelegate.swift & SceneDelegate.swift
Standard iOS lifecycle management files. Generally don't need modification unless adding:
- Background tasks
- Push notifications
- Deep linking
- App extensions

## Testing

### Simulator Testing
1. Build and run in Xcode (Cmd+R)
2. Test all app features:
   - Login/authentication
   - Navigation between pages
   - Document uploads (use drag-and-drop on simulator)
   - Pull-to-refresh
   - Orientation changes

### Device Testing
1. Connect iPhone/iPad via USB
2. Trust the computer on the device
3. Select device in Xcode
4. Build and run (Cmd+R)
5. First launch will show "Untrusted Developer" warning
6. Go to Settings > General > VPN & Device Management
7. Trust your developer certificate
8. Test all features including camera and photo library access

## Troubleshooting

### Build Errors

**Error**: "Signing for CoachHub requires a development team"
- **Solution**: Select your Team in Signing & Capabilities

**Error**: "Code signing entitlements file not found"
- **Solution**: Create CoachHub.entitlements file or disable capabilities

### Runtime Issues

**Issue**: Blank white screen
- **Cause**: Network connectivity or invalid URL
- **Solution**: Check network settings and verify `appURL` is correct

**Issue**: File uploads not working
- **Cause**: Missing delegate implementation
- **Solution**: Verify `UIDocumentPickerDelegate` is properly implemented (lines 150-160 in ViewController.swift)

**Issue**: Camera/photo library access denied
- **Cause**: User denied permission or Info.plist missing descriptions
- **Solution**: Check Info.plist has usage descriptions and ask user to enable in Settings > CoachHub

### Network Issues

**Issue**: App can't connect to web app
- **Cause**: Local Docker environment may not be accessible from device
- **Solution**:
  - Ensure coach.z-q.me resolves correctly on the device's network
  - For testing, you may need to use ngrok or similar tunnel service
  - Or modify the URL to use the Mac's local IP address

## App Store Preparation

When ready to publish:

1. **App Icons**: Add all required icon sizes to Assets.xcassets/AppIcon
   - 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt
   - 2x and 3x variants

2. **Screenshots**: Capture screenshots for App Store listing
   - iPhone 6.7", 6.5", 5.5"
   - iPad Pro 12.9", 11"

3. **Metadata**: Prepare App Store listing
   - App name, description, keywords
   - Privacy policy URL
   - Support URL

4. **Version**: Update version numbers in Info.plist
   - CFBundleShortVersionString (e.g., "1.0.0")
   - CFBundleVersion (e.g., "1")

5. **Archive**: Create archive for distribution
   - Product > Archive
   - Upload to App Store Connect
   - Submit for review

## Future Enhancements

Potential native iOS features to add:

- [ ] Push notifications for game reminders
- [ ] Native calendar integration
- [ ] Share extension for sharing schedules
- [ ] Offline support with local caching
- [ ] Face ID/Touch ID authentication
- [ ] Widget for upcoming games
- [ ] Watch app for quick schedule viewing
- [ ] Siri shortcuts for common actions

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Apple's WKWebView documentation
- Contact the development team

## License

Copyright © 2025 CoachHub Baseball. All rights reserved.
