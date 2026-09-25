package ke.ac.reberwet.jssportal

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
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

        // Keep all portal urls, localhost, and OAuth within the WebView
        if (url.contains("run.app") || url.contains("localhost") || url.contains("google.com/accounts")) {
            return false
        }

        // External protocols like mailto, tel, whatsapp should trigger native intents
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

    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        swipeRefreshLayout.isRefreshing = false
        onPageFinishedListener()
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            swipeRefreshLayout.isRefreshing = false
            onErrorListener()
        }
    }
}
