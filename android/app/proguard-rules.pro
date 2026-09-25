# ProGuard rules for Reberwet JSS Portal Android App

# Preserve native JavaScript Interface bridge methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepattributes JavascriptInterface
-keepattributes *Annotation*

# WebKit rules
-keepclassmembers class ke.ac.reberwet.jssportal.WebAppInterface {
   public *;
}

# AndroidX Core & Lifecycle
-keep class androidx.core.app.** { *; }
-keep class androidx.webkit.** { *; }
