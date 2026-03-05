# OutLoud MVP – Test Plan (20–30 core scenarios)

## 1. Accounts & identity
- [ ] 1.1 Sign up with email and password (min 6 chars) succeeds and creates user doc
- [ ] 1.2 Sign in with existing email/password succeeds
- [ ] 1.3 Sign in with wrong password shows error
- [ ] 1.4 Create profile: username (unique) and display name required
- [ ] 1.5 Create profile: duplicate username shows "Username is already taken"
- [ ] 1.6 After create profile, user lands on Home
- [ ] 1.7 Log out returns to Auth screen

## 2. Contacts / relationships
- [ ] 2.1 Search by username finds user and shows Add button
- [ ] 2.2 Search for non-existent username shows "User not found"
- [ ] 2.3 Sending request creates relationship with status pending
- [ ] 2.4 Receiver sees request under Requests tab
- [ ] 2.5 Approve request sets status approved; toast "Approved — can speak OutLoud now"
- [ ] 2.6 Deny request removes or blocks request
- [ ] 2.7 Only approved contacts can send messages (enforced in Cloud Function)

## 3. Thread & messaging
- [ ] 3.1 After approval, thread appears in Home inbox
- [ ] 3.2 Opening thread shows message list (empty or history)
- [ ] 3.3 Sending message adds it to thread and updates last preview on Home
- [ ] 3.4 Message text limited to 200 chars
- [ ] 3.5 Outgoing bubbles violet, incoming deep ink; OutLoud badge visible
- [ ] 3.6 Priority toggle (pill) can be set before send

## 4. Playback (TTS)
- [ ] 4.1 Tapping an incoming OutLoud message opens Playback overlay and speaks message
- [ ] 4.2 Playback shows sender name and message text
- [ ] 4.3 Replay button speaks again
- [ ] 4.4 Dismiss closes overlay
- [ ] 4.5 Reply navigates to thread
- [ ] 4.6 Settings: preface "Message from …" toggle affects spoken intro
- [ ] 4.7 Settings: voice speed persists and affects TTS

## 5. Safety & control
- [ ] 5.1 Block user from thread settings removes ability to receive messages (Function rejects)
- [ ] 5.2 Quiet Hours: when enabled, auto-speak is suppressed (client check)
- [ ] 5.3 Speak From: "Favorites only" vs "Approved contacts" filters who can trigger auto-speak
- [ ] 5.4 First-run: Auto Speak is OFF by default
- [ ] 5.5 Rate limit: Cloud Function enforces messages per minute (e.g. 10/min)

## 6. Settings & persistence
- [ ] 6.1 Settings: Auto Speak, Speak From, Preface, Quiet Hours persist to Firestore
- [ ] 6.2 Blocked users screen (placeholder) opens from Settings
- [ ] 6.3 Report a problem entry point present

## 7. Push & notifications
- [ ] 7.1 App registers for push and stores token in user doc (deviceTokens)
- [ ] 7.2 On notification tap (when supported), app opens and navigates to Playback with message data
- [ ] 7.3 In-app new message can trigger playback when Auto Speak ON and not Quiet Hours

## 8. Edge cases
- [ ] 8.1 Empty inbox shows empty state and "Add contact" CTA
- [ ] 8.2 Sending message when relationship not approved does not deliver (Function validation)
- [ ] 8.3 Thread with no messages shows composer only
- [ ] 8.4 Mark message as played updates deliveryStatus in Firestore when Playback runs

Total: 30 scenarios.
