package com.n5cheatcodes.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Shows a daily note when its alarm fires, and puts all alarms back after a restart, an app update or a clock change. */
public class ReminderReceiver extends BroadcastReceiver {
    static final String FIRE = "com.n5cheatcodes.app.NOTE";

    @Override
    public void onReceive(Context c, Intent it) {
        String a = it == null ? null : it.getAction();
        if (a == null) return;
        if (FIRE.equals(a)) {
            int i = it.getIntExtra("slot", -1);
            long at = it.getLongExtra("at", 0);
            if (!ReminderMath.isStale(at, System.currentTimeMillis())) Reminders.post(c, i);
        }
        Reminders.scheduleAll(c);   // set the next morning, evening and night
    }
}
