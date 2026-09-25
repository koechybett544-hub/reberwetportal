package ke.ac.reberwet.jssportal

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
