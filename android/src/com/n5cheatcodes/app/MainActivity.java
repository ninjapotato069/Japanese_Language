package com.n5cheatcodes.app;

import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.util.Locale;

/** N5 Cheat Codes: one WebView running the bundled app, a Japanese text-to-speech bridge, daily notes, edge-to-edge insets and back handling. */
public class MainActivity extends Activity {
    private FrameLayout root;
    private WebView web;
    private TextToSpeech tts;
    private volatile boolean ttsReady = false;
    private SharedPreferences prefs;
    private static final String POST = "android.permission.POST_NOTIFICATIONS";
    private static final int REQ_NOTIFY = 7;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        prefs = getSharedPreferences("n5state", MODE_PRIVATE);
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        root = new FrameLayout(this);
        setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) Edge.enable(getWindow(), root);
        applyBars(night ? 0xFF181E39 : 0xFFFFFFFF, !night);
        createWeb(night);
        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status != TextToSpeech.SUCCESS || tts == null) return;
                int r = tts.setLanguage(Locale.JAPANESE);
                ttsReady = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { done(id); }
                    @Override public void onError(String id) { done(id); }
                });
            }
        });
        if (Build.VERSION.SDK_INT >= 33) Back33.register(this);
        Reminders.scheduleAll(this);   // alarms can be lost (force stop, some phone cleaners): opening the app puts them back
    }

    private void createWeb(boolean night) {
        web = new WebView(this);
        web.setBackgroundColor(night ? 0xFF0F1328 : 0xFFF3F5FA);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        s.setSupportZoom(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) { openExternal(url); return true; }
                return false;
            }
            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                // the page's process died (low memory): rebuild it from saved progress instead of closing the app
                if (view == web) { root.removeView(web); web.destroy(); web = null; createWeb(false); }
                return true;
            }
        });
        web.addJavascriptInterface(new TtsBridge(), "AndroidTTS");
        web.addJavascriptInterface(new AppBridge(), "AndroidApp");
        web.loadUrl("file:///android_asset/www/index.html");
    }

    /** Colours the area behind the system bars and picks dark or light bar icons. */
    void applyBars(int color, boolean light) {
        if (root != null) root.setBackgroundColor(color);
        Window w = getWindow();
        if (Build.VERSION.SDK_INT >= 30) { Edge.appearance(w, light); return; }
        w.setStatusBarColor(Build.VERSION.SDK_INT >= 23 || !light ? color : 0xFF1B2140);
        if (Build.VERSION.SDK_INT >= 26 || !light) w.setNavigationBarColor(color);
        if (Build.VERSION.SDK_INT >= 23) {
            View d = w.getDecorView();
            int f = d.getSystemUiVisibility();
            f = light ? (f | View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR) : (f & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
            if (Build.VERSION.SDK_INT >= 26) f = light ? (f | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR) : (f & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
            d.setSystemUiVisibility(f);
        }
    }

    /** Back: let the page close a sheet or go up a screen first; otherwise send the app to the background. */
    void handleBack() {
        if (web == null) { moveTaskToBack(true); return; }
        web.evaluateJavascript("(window.__back && window.__back()) ? 'y' : 'n'", new ValueCallback<String>() {
            @Override public void onReceiveValue(String v) { if (v == null || !v.contains("y")) moveTaskToBack(true); }
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() { handleBack(); }

    private void done(final String id) {
        if (id == null) return;
        final String safe = id.replaceAll("[^A-Za-z0-9_]", "");
        runOnUiThread(new Runnable() {
            @Override public void run() { if (web != null) web.evaluateJavascript("window.__ttsDone && window.__ttsDone('" + safe + "')", null); }
        });
    }

    private void openExternal(String url) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { }
    }

    /** "on" (notes can show), "ask" (Android can still show its permission prompt) or "blocked" (only phone settings can allow them). */
    String notifyState() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(POST) != PackageManager.PERMISSION_GRANTED) {
            boolean asked = Reminders.prefs(this).getBoolean("asked", false);
            return (!asked || shouldShowRequestPermissionRationale(POST)) ? "ask" : "blocked";
        }
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm == null) return "on";
        if (Build.VERSION.SDK_INT >= 24 && !nm.areNotificationsEnabled()) return "blocked";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = nm.getNotificationChannel(Reminders.CHANNEL);
            if (ch != null && ch.getImportance() == NotificationManager.IMPORTANCE_NONE) return "blocked";
        }
        return "on";
    }

    void requestNotify() {
        String st = notifyState();
        if ("ask".equals(st) && Build.VERSION.SDK_INT >= 33) {
            Reminders.prefs(this).edit().putBoolean("asked", true).commit();
            requestPermissions(new String[] { POST }, REQ_NOTIFY);
        } else if ("blocked".equals(st)) openNotifySettings();
        else permResult();
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        if (code == REQ_NOTIFY) permResult();
    }

    /** Tells the page whether notes can show now. */
    void permResult() {
        final String st = notifyState();
        runOnUiThread(new Runnable() {
            @Override public void run() { if (web != null) web.evaluateJavascript("window.__notifyPerm && window.__notifyPerm('" + st + "')", null); }
        });
    }

    void openNotifySettings() {
        Intent i = Build.VERSION.SDK_INT >= 26
            ? new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName())
            : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()));
        try { startActivity(i); } catch (Exception e) {
            try { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); } catch (Exception e2) { }
        }
    }

    class TtsBridge {
        @JavascriptInterface public boolean ready() { return ttsReady; }
        @JavascriptInterface public void speak(String text, float rate, float pitch, String id) {
            if (tts == null || !ttsReady) { done(id); return; }
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            tts.speak(text, TextToSpeech.QUEUE_ADD, new Bundle(), id);
        }
        @JavascriptInterface public void stop() { if (tts != null) tts.stop(); }
        @JavascriptInterface public void install() {
            try {
                Intent i = new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception e) {
                try { startActivity(new Intent("com.android.settings.TTS_SETTINGS")); } catch (Exception e2) { }
            }
        }
    }

    class AppBridge {
        /** Progress lives in SharedPreferences, which Android writes to disk before the app is stopped, so nothing is lost when it is swiped away. */
        @JavascriptInterface public void save(String json) { if (json != null && prefs != null) prefs.edit().putString("state", json).commit(); }
        @JavascriptInterface public String load() { return prefs == null ? "" : prefs.getString("state", ""); }
        @JavascriptInterface public void open(String url) {
            if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) openExternal(url);
        }
        /** Daily notes: times and messages from the page, permission state and prompt, and a test note. */
        @JavascriptInterface public void setReminders(String json) { Reminders.save(MainActivity.this, json); }
        @JavascriptInterface public String notifyState() { return MainActivity.this.notifyState(); }
        @JavascriptInterface public void askNotify() {
            runOnUiThread(new Runnable() { @Override public void run() { requestNotify(); } });
        }
        @JavascriptInterface public boolean testNotify(String slot) { return Reminders.post(MainActivity.this, Reminders.slotIndex(slot)); }
        @JavascriptInterface public void setBars(final String color, final boolean light) {
            runOnUiThread(new Runnable() {
                @Override public void run() { try { applyBars(Color.parseColor(color.trim()), light); } catch (Exception e) { } }
            });
        }
    }

    @Override protected void onPause() {
        if (web != null) web.evaluateJavascript("window.__flush && window.__flush()", null);
        super.onPause();
        if (tts != null) tts.stop();
        if (web != null) web.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        permResult();   // back from phone settings: the page refreshes what it shows about notes
    }
    @Override protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        if (web != null) { root.removeView(web); web.destroy(); web = null; }
        super.onDestroy();
    }
}
