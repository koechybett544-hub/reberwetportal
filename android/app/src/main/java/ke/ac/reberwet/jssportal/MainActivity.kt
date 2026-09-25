package ke.ac.reberwet.jssportal

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

    // Launcher for file selection (student photos, reports, csv)
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
        // Direct Standalone Reberwet Portal URL - Launches directly with zero AI Studio dependencies
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
                Toast.makeText(this, "No internet connection detected. Please check data/Wi-Fi.", Toast.LENGTH_SHORT).show()
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

        // Cache configuration for fast loading and offline resilience
        settings.cacheMode = if (isNetworkAvailable()) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // Custom User Agent identifier to tell portal it is running as a native Android app
        val defaultUserAgent = settings.userAgentString
        settings.userAgentString = "$defaultUserAgent ReberwetAndroidApp/2.6.0 StandaloneMobile"

        // Inject Native JavaScript Bridge
        webView.addJavascriptInterface(WebAppInterface(this, webView), "AndroidBridge")

        // Attach Clients
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
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf("image/*", "application/pdf", "text/csv", "application/vnd.ms-excel"))
                }
                filePickerLauncher.launch(Intent.createChooser(intent, "Select File to Upload"))
            }
        )

        // Native Download Listener for report cards, certificates, CSV exports
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
            } catch (e: Exception) {
                // If it's a blob/data URI or custom scheme
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
            // Attempt to load from cache
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
