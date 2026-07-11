package com.example.pdftriangle.ui.main

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.navigation3.runtime.NavKey

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
) {
  val context = LocalContext.current
  
  // Storage for WebView file upload callback
  var uploadMessage by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
  
  // Launcher for the File Chooser Intent
  val fileChooserLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.StartActivityForResult()
  ) { result ->
    val results = if (result.resultCode == Activity.RESULT_OK) {
      val data = result.data
      if (data != null) {
        val clipData = data.clipData
        if (clipData != null) {
          val uris = Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
          uris
        } else {
          val uri = data.data
          if (uri != null) arrayOf(uri) else null
        }
      } else {
        null
      }
    } else {
      null
    }
    uploadMessage?.onReceiveValue(results)
    uploadMessage = null
  }

  // Request storage & camera permissions on startup to ensure standard capabilities
  val permissionsToRequest = remember {
    mutableListOf(Manifest.permission.CAMERA).apply {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        add(Manifest.permission.READ_MEDIA_IMAGES)
        add(Manifest.permission.READ_MEDIA_VIDEO)
        add(Manifest.permission.POST_NOTIFICATIONS)
      } else {
        add(Manifest.permission.READ_EXTERNAL_STORAGE)
        add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
      }
    }.toTypedArray()
  }

  val permissionLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.RequestMultiplePermissions()
  ) { permissions ->
    // Handle permissions callback if needed
  }

  LaunchedEffect(Unit) {
    val needsRequest = permissionsToRequest.any {
      ContextCompat.checkSelfPermission(context, it) != PackageManager.PERMISSION_GRANTED
    }
    if (needsRequest) {
      permissionLauncher.launch(permissionsToRequest)
    }
  }

  AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { ctx ->
      WebView(ctx).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        webViewClient = WebViewClient()
        webChromeClient = object : WebChromeClient() {
          // Grant HTML5 permissions (like camera for document scans)
          override fun onPermissionRequest(request: PermissionRequest?) {
            request?.grant(request.resources)
          }

          // Handle file upload click inside WebView
          override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
          ): Boolean {
            // Cancel any existing callback
            uploadMessage?.onReceiveValue(null)
            uploadMessage = filePathCallback

            val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
              type = "*/*"
              addCategory(Intent.CATEGORY_OPENABLE)
            }
            // Allow multiple file selection (important for merge PDF!)
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)

            try {
              fileChooserLauncher.launch(intent)
            } catch (e: Exception) {
              uploadMessage?.onReceiveValue(null)
              uploadMessage = null
              return false
            }
            return true
          }
        }
        
        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          databaseEnabled = true
          cacheMode = WebSettings.LOAD_DEFAULT
        }
        loadUrl("https://pdftriangle.netlify.app/")
      }
    },
    update = {}
  )
}
