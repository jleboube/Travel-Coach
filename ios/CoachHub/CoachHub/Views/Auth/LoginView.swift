//
//  LoginView.swift
//  CoachHub
//
//  Login screen with Sign in with Apple and biometric auth
//

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @StateObject private var viewModel = AuthViewModel()
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [
                    Color(red: 0.118, green: 0.251, blue: 0.686), // #1e40af
                    Color(red: 0.094, green: 0.196, blue: 0.529)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                // Logo and Title
                VStack(spacing: 20) {
                    Image(systemName: "baseball.fill")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 100, height: 100)
                        .foregroundColor(.white)

                    Text("CoachHub")
                        .font(.system(size: 42, weight: .bold))
                        .foregroundColor(.white)

                    Text("Baseball Team Management")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }

                Spacer()

                // Authentication Buttons
                VStack(spacing: 16) {
                    // Biometric Auth Button (if available)
                    if viewModel.showBiometricOption {
                        Button(action: {
                            Task {
                                await viewModel.handleBiometricAuth()
                            }
                        }) {
                            HStack {
                                Image(systemName: viewModel.biometricType == .faceID ? "faceid" : "touchid")
                                    .font(.title2)
                                Text(viewModel.biometricButtonTitle)
                                    .font(.headline)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.white.opacity(0.2))
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(viewModel.isLoading)
                    }

                    // Sign in with Apple Button
                    SignInWithAppleButton(
                        onRequest: { request in
                            request.requestedScopes = [.fullName, .email]
                        },
                        onCompletion: { result in
                            switch result {
                            case .success(let authorization):
                                Task {
                                    await viewModel.handleSignInWithApple(authorization)
                                }
                            case .failure(let error):
                                viewModel.errorMessage = error.localizedDescription
                            }
                        }
                    )
                    .signInWithAppleButtonStyle(
                        colorScheme == .dark ? .white : .black
                    )
                    .frame(height: 50)
                    .cornerRadius(10)
                }
                .padding(.horizontal, 40)

                // Error Message
                if let errorMessage = viewModel.errorMessage {
                    Text(errorMessage)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .padding()
                        .background(Color.white.opacity(0.9))
                        .cornerRadius(10)
                        .padding(.horizontal, 40)
                }

                Spacer()

                // Privacy Notice
                Text("By signing in, you agree to our Terms of Service and Privacy Policy")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
                    .padding(.bottom, 20)
            }

            // Loading Overlay
            if viewModel.isLoading {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()

                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)
            }
        }
    }
}

#Preview {
    LoginView()
}
