package com.example.pdftriangle.ui.main

import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation3.runtime.NavKey

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
) {
  AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )
        webViewClient = WebViewClient()
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
