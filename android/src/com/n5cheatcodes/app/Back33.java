package com.n5cheatcodes.app;

import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

/** Android 13+ only: route the system back gesture to the page. */
final class Back33 {
    private Back33() { }

    static void register(final MainActivity a) {
        a.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, new OnBackInvokedCallback() {
            @Override public void onBackInvoked() { a.handleBack(); }
        });
    }
}
