import JSZip from 'jszip';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root project files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ReberwetJSSPortal"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.7.2")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.0.21")
    }
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`
  );

  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // App module files
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "ke.ac.reberwet.jssportal"
    compileSdk = 35

    defaultConfig {
        applicationId = "ke.ac.reberwet.jssportal"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "2.6.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`
  );

  zip.file(
    'app/proguard-rules.pro',
    `-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepattributes JavascriptInterface
-keepattributes *Annotation*

-keepclassmembers class ke.ac.reberwet.jssportal.WebAppInterface {
   public *;
}
`
  );

  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="ke.ac.reberwet.jssportal">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.ReberwetPortal"
        android:networkSecurityConfig="@xml/network_security_config"
        android:usesCleartextTraffic="false"
        tools:targetApi="35">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.ReberwetPortal">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https"
                    android:host="ais-pre-azyu2vozxqh6ytvyj4vnty-874645802870.europe-west2.run.app" />
            </intent-filter>
        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
`
  );

  // Kotlin code
  zip.file(
    'app/src/main/java/ke/ac/reberwet/jssportal/MainActivity.kt',
    `package ke.ac.reberwet.jssportal

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineLayout: LinearLayout
    private lateinit var btnRetry: Button

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val intentData = result.data
            val results: Array<Uri>? = when {
                intentData?.clipData != null -> {
                    val count = intentData.clipData!!.itemCount
                    Array(count) { i -> intentData.clipData!!.getItemAt(i).uri }
                }
                intentData?.data != null -> {
                    arrayOf(intentData.data!!)
                }
                else -> null
            }
            fileUploadCallback?.onReceiveValue(results)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    companion object {
        const val PRODUCTION_PORTAL_URL = "https://ais-pre-azyu2vozxqh6ytvyj4vnty-874645802870.europe-west2.run.app"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupWebView()
        setupBackNavigation()
        loadPortalUrl()
    }

    private fun initViews() {
        webView = findViewById(R.id.portal_webview)
        swipeRefreshLayout = findViewById(R.id.swipe_refresh_layout)
        progressBar = findViewById(R.id.loading_progress)
        offlineLayout = findViewById(R.id.layout_offline)
        btnRetry = findViewById(R.id.btn_retry_connection)

        swipeRefreshLayout.setColorSchemeColors(
            getColor(R.color.portal_maroon),
            getColor(R.color.portal_maroon_dark),
            getColor(R.color.portal_light_blue)
        )

        swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
                webView.reload()
            } else {
                swipeRefreshLayout.isRefreshing = false
                showOfflineNotice()
            }
        }

        btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
                loadPortalUrl()
            } else {
                Toast.makeText(this, "No internet connection detected.", Toast.LENGTH_SHORT).show()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        settings.cacheMode = if (isNetworkAvailable()) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent ReberwetAndroidApp/2.6.0 StandaloneMobile"

        webView.addJavascriptInterface(WebAppInterface(this, webView), "AndroidBridge")

        webView.webViewClient = PortalWebViewClient(
            swipeRefreshLayout = swipeRefreshLayout,
            onPageFinishedListener = {
                progressBar.visibility = View.GONE
                offlineLayout.visibility = View.GONE
                webView.visibility = View.VISIBLE
            },
            onErrorListener = {
                if (!isNetworkAvailable()) {
                    showOfflineNotice()
                }
            }
        )

        webView.webChromeClient = PortalChromeClient(
            onFileChooser = { callback ->
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = callback

                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "application/pdf", "text/csv"))
                }
                filePickerLauncher.launch(Intent.createChooser(intent, "Select File to Upload"))
            }
        )

        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val request = DownloadManager.Request(Uri.parse(url)).apply {
                    setMimeType(mimetype)
                    addRequestHeader("User-Agent", userAgent)
                    setDescription("Downloading Reberwet JSS Document")
                    setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                    setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, contentDisposition, mimetype)
                    )
                }
                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "Downloading file to Downloads folder...", Toast.LENGTH_SHORT).show()
            } catch (_: Exception) {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
            }
        }
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun loadPortalUrl() {
        progressBar.visibility = View.VISIBLE
        if (isNetworkAvailable()) {
            webView.loadUrl(PRODUCTION_PORTAL_URL)
        } else {
            webView.settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
            webView.loadUrl(PRODUCTION_PORTAL_URL)
        }
    }

    private fun showOfflineNotice() {
        progressBar.visibility = View.GONE
        offlineLayout.visibility = View.VISIBLE
        webView.visibility = View.GONE
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = connectivityManager.activeNetwork ?: return false
        val actNw = connectivityManager.getNetworkCapabilities(network) ?: return false
        return actNw.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
`
  );

  zip.file(
    'app/src/main/java/ke/ac/reberwet/jssportal/WebAppInterface.kt',
    `package ke.ac.reberwet.jssportal

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast

class WebAppInterface(private val context: Context, private val webView: WebView) {

    @JavascriptInterface
    fun isAndroidApp(): Boolean = true

    @JavascriptInterface
    fun getAppVersion(): String = "2.6.0"

    @JavascriptInterface
    fun showToast(message: String) {
        webView.post {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    @JavascriptInterface
    fun shareText(title: String, text: String) {
        val sendIntent = Intent().apply {
            action = Intent.ACTION_SEND
            putExtra(Intent.EXTRA_TITLE, title)
            putExtra(Intent.EXTRA_TEXT, text)
            type = "text/plain"
        }
        val shareIntent = Intent.createChooser(sendIntent, title)
        shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(shareIntent)
    }

    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                vibrator?.vibrate(durationMs)
            }
        } catch (_: Exception) {}
    }
}
`
  );

  zip.file(
    'app/src/main/java/ke/ac/reberwet/jssportal/PortalWebViewClient.kt',
    `package ke.ac.reberwet.jssportal

import android.content.Intent
import android.graphics.Bitmap
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class PortalWebViewClient(
    private val swipeRefreshLayout: SwipeRefreshLayout,
    private val onPageFinishedListener: () -> Unit,
    private val onErrorListener: () -> Unit
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url?.toString() ?: return false
        val uri = request.url

        if (url.contains("run.app") || url.contains("localhost") || url.contains("google.com/accounts")) {
            return false
        }

        if (url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("whatsapp:") || url.startsWith("sms:")) {
            try {
                val intent = Intent(Intent.ACTION_VIEW, uri)
                view?.context?.startActivity(intent)
                return true
            } catch (_: Exception) {
                return false
            }
        }

        return false
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        swipeRefreshLayout.isRefreshing = false
        onPageFinishedListener()
    }

    override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            swipeRefreshLayout.isRefreshing = false
            onErrorListener()
        }
    }
}
`
  );

  zip.file(
    'app/src/main/java/ke/ac/reberwet/jssportal/PortalChromeClient.kt',
    `package ke.ac.reberwet.jssportal

import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView

class PortalChromeClient(
    private val onFileChooser: (ValueCallback<Array<Uri>>?) -> Unit
) : WebChromeClient() {

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        onFileChooser(filePathCallback)
        return true
    }
}
`
  );

  // Resources
  zip.file(
    'app/src/main/res/layout/activity_main.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/portal_background">

    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipe_refresh_layout"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <FrameLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent">

            <WebView
                android:id="@+id/portal_webview"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:overScrollMode="never" />

            <LinearLayout
                android:id="@+id/layout_offline"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:orientation="vertical"
                android:gravity="center"
                android:padding="24dp"
                android:visibility="gone"
                android:background="@color/portal_background">

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Reberwet JSS Portal"
                    android:textColor="@color/portal_maroon"
                    android:textSize="20sp"
                    android:textStyle="bold" />

                <TextView
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="You are currently offline"
                    android:textColor="#44403c"
                    android:textSize="16sp"
                    android:textStyle="bold"
                    android:layout_marginTop="8dp" />

                <Button
                    android:id="@+id/btn_retry_connection"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="Retry Connection"
                    android:backgroundTint="@color/portal_maroon"
                    android:textColor="#ffffff"
                    android:layout_marginTop="20dp" />

            </LinearLayout>

            <ProgressBar
                android:id="@+id/loading_progress"
                style="?android:attr/progressBarStyleHorizontal"
                android:layout_width="match_parent"
                android:layout_height="4dp"
                android:indeterminate="true"
                android:progressTint="@color/portal_maroon" />

        </FrameLayout>
    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
</androidx.coordinatorlayout.widget.CoordinatorLayout>
`
  );

  zip.file(
    'app/src/main/res/values/colors.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="portal_maroon">#6B1426</color>
    <color name="portal_maroon_dark">#540D1E</color>
    <color name="portal_light_blue">#0284C7</color>
    <color name="portal_background">#FCFAF8</color>
    <color name="white">#FFFFFF</color>
    <color name="black">#000000</color>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Reberwet JSS</string>
    <string name="app_full_name">Reberwet Junior Secondary School Portal</string>
</resources>
`
  );

  zip.file(
    'app/src/main/res/values/themes.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.ReberwetPortal" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/portal_maroon</item>
        <item name="colorPrimaryVariant">@color/portal_maroon_dark</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="colorSecondary">@color/portal_light_blue</item>
        <item name="android:statusBarColor">@color/portal_maroon</item>
        <item name="android:navigationBarColor">@color/portal_background</item>
    </style>
</resources>
`
  );

  zip.file(
    'app/src/main/res/xml/network_security_config.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
`
  );

  zip.file(
    'app/src/main/res/xml/file_paths.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <files-path name="files" path="." />
</paths>
`
  );

  zip.file(
    'app/src/main/res/drawable/ic_launcher_background.xml',
    `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#6B1426"
        android:pathData="M0,0h108v108h-108z" />
</vector>`
  );

  zip.file(
    'app/src/main/res/drawable/ic_launcher_foreground.xml',
    `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group android:scaleX="0.65" android:scaleY="0.65" android:translateX="18.9" android:translateY="18.9">
        <path android:fillColor="#BAE6FD" android:pathData="M54,20 L12,38 L54,56 L96,38 Z" />
        <path android:fillColor="#FFFFFF" android:pathData="M24,47.5 L24,66 C24,76 37,84 54,84 C71,84 84,76 84,66 L84,47.5 L54,60.5 Z" />
    </group>
</vector>`
  );

  zip.file(
    'README.md',
    `# Reberwet Junior Secondary School Portal - Android Application

To build:
1. Open this directory in Android Studio.
2. Run \`./gradlew assembleDebug\` to build the standalone debug APK.
3. Run \`./gradlew bundleRelease\` to generate the Google Play Store App Bundle (.AAB).
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
