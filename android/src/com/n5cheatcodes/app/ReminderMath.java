package com.n5cheatcodes.app;

import java.util.Calendar;
import java.util.Locale;
import java.util.Random;
import java.util.TimeZone;

/** Plain-Java helpers for the daily notes. No Android classes, so they can be tested on a computer. */
final class ReminderMath {
    static final int DAY_START_H = 4;                 // the app's study day runs 4 am to 4 am
    static final long STALE_MS = 90L * 60 * 1000;     // a note that arrives more than 90 minutes late is skipped
    private ReminderMath() { }

    /** The next moment the clock shows h:m in this time zone: today if that is still ahead, otherwise tomorrow. */
    static long nextTrigger(long now, int h, int m, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(now);
        c.set(Calendar.HOUR_OF_DAY, h);
        c.set(Calendar.MINUTE, m);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        if (c.getTimeInMillis() <= now + 1000) c.add(Calendar.DAY_OF_MONTH, 1);
        return c.getTimeInMillis();
    }

    /** The study day (yyyy-MM-dd) the app is counting at this moment, the same key it uses for "days". */
    static String studyDay(long now, TimeZone tz) {
        Calendar c = Calendar.getInstance(tz);
        c.setTimeInMillis(now - DAY_START_H * 3600000L);
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    static boolean isStale(long scheduledAt, long now) { return scheduledAt > 0 && now - scheduledAt > STALE_MS; }

    /** A random message index, never the one used last time when there is a choice. */
    static int pickIndex(int n, int last, Random r) {
        if (n <= 1) return 0;
        boolean skip = last >= 0 && last < n;
        int k = r.nextInt(skip ? n - 1 : n);
        if (skip && k >= last) k++;
        return k;
    }

    /** Puts a nickname in place of each {n}. With no nicknames the placeholder goes, along with its comma or space. */
    static String fill(String text, String[] names, Random r) {
        if (text == null) return "";
        if (names == null || names.length == 0) return text.replace(", {n}", "").replace(" {n}", "").replace("{n}", "").trim();
        StringBuilder out = new StringBuilder();
        int i = 0, j;
        while ((j = text.indexOf("{n}", i)) >= 0) {
            out.append(text, i, j).append(names[r.nextInt(names.length)]);
            i = j + 3;
        }
        return out.append(text.substring(i)).toString();
    }

    /** Morning has one message list; evening and night pick theirs by whether today's session is done. */
    static String listKey(String slot, boolean studied) { return "morning".equals(slot) ? "morning" : slot + (studied ? ".done" : ".todo"); }
}
