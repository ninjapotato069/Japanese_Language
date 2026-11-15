package com.n5cheatcodes.app;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.graphics.drawable.Icon;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Random;
import java.util.TimeZone;

/** Daily notes: good morning, good evening, good night. The page saves the times and the message lists here
 *  (setReminders); one alarm per switched-on note is kept set for its next time, and the message is chosen when it fires. */
final class Reminders {
    static final String PREFS = "n5notify", CHANNEL = "greetings";
    static final String[] SLOTS = { "morning", "evening", "night" };
    private static final Random RNG = new Random();
    private Reminders() { }

    static int slotIndex(String id) {
        for (int i = 0; i < SLOTS.length; i++) if (SLOTS[i].equals(id)) return i;
        return -1;
    }

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

    static JSONObject config(Context c) {
        try {
            String s = prefs(c).getString("cfg", "");
            return s.length() == 0 ? null : new JSONObject(s);
        } catch (Exception e) { return null; }
    }

    /** New settings from the page: keep them and reschedule. Anything that is not valid JSON is ignored. */
    static void save(Context c, String json) {
        if (json == null) return;
        try { new JSONObject(json); } catch (Exception e) { return; }
        prefs(c).edit().putString("cfg", json).commit();
        scheduleAll(c);
    }

    static JSONObject slot(JSONObject cfg, String id) {
        JSONArray a = cfg == null ? null : cfg.optJSONArray("slots");
        if (a == null) return null;
        for (int i = 0; i < a.length(); i++) {
            JSONObject s = a.optJSONObject(i);
            if (s != null && id.equals(s.optString("id"))) return s;
        }
        return null;
    }

    /** One alarm per switched-on note, at its next time; switched-off notes are cancelled. Safe to call any number of times. */
    static void scheduleAll(Context c) {
        JSONObject cfg = config(c);
        for (int i = 0; i < SLOTS.length; i++) {
            JSONObject s = slot(cfg, SLOTS[i]);
            if (s != null && s.optBoolean("on", false)) schedule(c, i, s.optInt("h", 8), s.optInt("m", 0));
            else cancel(c, i);
        }
    }

    private static int immutable() { return Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0; }

    static void schedule(Context c, int i, int h, int m) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        long at = ReminderMath.nextTrigger(System.currentTimeMillis(), h, m, TimeZone.getDefault());
        Intent it = new Intent(c, ReminderReceiver.class).setAction(ReminderReceiver.FIRE).putExtra("slot", i).putExtra("at", at);
        PendingIntent pi = PendingIntent.getBroadcast(c, 100 + i, it, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else if (Build.VERSION.SDK_INT >= 23) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else am.setExact(AlarmManager.RTC_WAKEUP, at, pi);
        } catch (SecurityException e) {
            // exact alarms not allowed on this phone: an inexact one still arrives, at most about an hour late
            if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else am.set(AlarmManager.RTC_WAKEUP, at, pi);
        }
        prefs(c).edit().putLong("next." + SLOTS[i], at).apply();
    }

    static void cancel(Context c, int i) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        Intent it = new Intent(c, ReminderReceiver.class).setAction(ReminderReceiver.FIRE);
        PendingIntent pi = PendingIntent.getBroadcast(c, 100 + i, it, PendingIntent.FLAG_NO_CREATE | immutable());
        if (pi != null) {
            if (am != null) am.cancel(pi);
            pi.cancel();
        }
        prefs(c).edit().remove("next." + SLOTS[i]).apply();
    }

    /** Whether today's session is finished, read from the progress the app saves (days[studyDay].sess). */
    static boolean studiedToday(Context c) {
        try {
            String s = c.getSharedPreferences("n5state", Context.MODE_PRIVATE).getString("state", "");
            if (s.length() == 0) return false;
            JSONObject days = new JSONObject(s).optJSONObject("days");
            JSONObject d = days == null ? null : days.optJSONObject(ReminderMath.studyDay(System.currentTimeMillis(), TimeZone.getDefault()));
            return d != null && d.optInt("sess", 0) == 1;
        } catch (Exception e) { return false; }
    }

    /** Shows the note for slot i now. Returns false if there is nothing to show. */
    static boolean post(Context c, int i) {
        JSONObject cfg = config(c);
        if (cfg == null || i < 0 || i >= SLOTS.length) return false;
        JSONObject msgs = cfg.optJSONObject("msgs");
        if (msgs == null) return false;
        String key = ReminderMath.listKey(SLOTS[i], studiedToday(c));
        JSONArray list = msgs.optJSONArray(key);
        if (list == null || list.length() == 0) { key = SLOTS[i]; list = msgs.optJSONArray(key); }
        if (list == null || list.length() == 0) return false;
        SharedPreferences p = prefs(c);
        int k = ReminderMath.pickIndex(list.length(), p.getInt("last." + key, -1), RNG);
        p.edit().putInt("last." + key, k).apply();
        JSONArray msg = list.optJSONArray(k);
        if (msg == null) return false;
        String[] names = strings(cfg.optJSONArray("names"));
        String title = ReminderMath.fill(msg.optString(0, ""), names, RNG);
        String body = ReminderMath.fill(msg.optString(1, ""), names, RNG);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return false;
        Notification.Builder b;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel(CHANNEL, cfg.optString("channel", "Daily notes"), NotificationManager.IMPORTANCE_DEFAULT));
            b = new Notification.Builder(c, CHANNEL);
        } else {
            b = legacyBuilder(c);
        }
        b.setContentTitle(title).setContentText(body).setStyle(new Notification.BigTextStyle().bigText(body))
            .setAutoCancel(true).setShowWhen(true).setWhen(System.currentTimeMillis())
            .setContentIntent(openApp(c, i)).setColor(color(cfg.optString("color", "#D63F6B")));
        if (Build.VERSION.SDK_INT >= 23) b.setSmallIcon(Icon.createWithBitmap(glyph(cfg.optString("glyph", "合"))));
        else b.setSmallIcon(c.getApplicationInfo().icon);
        try {
            nm.notify(10 + i, b.build());
            return true;
        } catch (Exception e) { return false; }
    }

    @SuppressWarnings("deprecation")
    private static Notification.Builder legacyBuilder(Context c) {
        Notification.Builder b = new Notification.Builder(c);
        b.setPriority(Notification.PRIORITY_DEFAULT);
        b.setDefaults(Notification.DEFAULT_SOUND);
        return b;
    }

    /** Tapping a note opens the app (or brings it to the front). */
    static PendingIntent openApp(Context c, int i) {
        Intent it = new Intent(c, MainActivity.class).setAction(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED);
        return PendingIntent.getActivity(c, 200 + i, it, PendingIntent.FLAG_UPDATE_CURRENT | immutable());
    }

    /** Status-bar icon drawn from one character (a heart, or the 合 stamp): Android uses its shape only. */
    static Bitmap glyph(String g) {
        int s = 96;
        Bitmap bm = Bitmap.createBitmap(s, s, Bitmap.Config.ARGB_8888);
        Canvas cv = new Canvas(bm);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setColor(Color.WHITE);
        p.setTextAlign(Paint.Align.CENTER);
        p.setTypeface(Typeface.DEFAULT_BOLD);
        p.setTextSize(s * 0.8f);
        Paint.FontMetrics fm = p.getFontMetrics();
        cv.drawText(g == null || g.length() == 0 ? "合" : g, s / 2f, s / 2f - (fm.ascent + fm.descent) / 2f, p);
        return bm;
    }

    static int color(String hex) {
        try { return Color.parseColor(hex); } catch (Exception e) { return 0xFFD63F6B; }
    }

    static String[] strings(JSONArray a) {
        if (a == null) return new String[0];
        String[] out = new String[a.length()];
        for (int i = 0; i < out.length; i++) out[i] = a.optString(i, "");
        return out;
    }
}
