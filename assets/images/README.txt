GPS Context Assistant App Identity Assets

Copy these files into:
assets/images/

Files:
- icon.png
- android-icon-foreground.png
- android-icon-background.png
- android-icon-monochrome.png
- notification-icon.png
- splash-icon.png

Then update app.json using app-json-example.json as a reference.

Build a real installable APK:
eas build --profile preview --platform android

For dev build:
eas build --profile development --platform android
