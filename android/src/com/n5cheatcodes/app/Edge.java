package com.n5cheatcodes.app;

import android.graphics.Color;
import android.graphics.Insets;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;

/** Android 11+ only: draw edge to edge and pad the content clear of the status bar, navigation bar, cutouts and keyboard. */
final class Edge {
    private Edge() { }

    static void enable(Window w, View root) {
        w.setDecorFitsSystemWindows(false);
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);
        w.setNavigationBarContrastEnforced(false);
        root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets in) {
                Insets bars = in.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                Insets ime = in.getInsets(WindowInsets.Type.ime());
                v.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
                return WindowInsets.CONSUMED;
            }
        });
        root.requestApplyInsets();
    }

    static void appearance(Window w, boolean light) {
        WindowInsetsController c = w.getInsetsController();
        if (c == null) return;
        int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
        c.setSystemBarsAppearance(light ? mask : 0, mask);
    }
}
