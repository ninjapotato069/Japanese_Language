#!/bin/bash
# Build the signed Android app from the page that tools/build.py writes to android/apkdir/assets/www/index.html.
#
# Needs: a JDK (javac, jar, java), apktool, uber-apk-signer, dex2jar's d2j-jar2dex and an Android platform android.jar.
# Point these variables at them (defaults are the paths used on the build machine):
#   APK_TOOLS    folder with apktool.jar, uber-apk-signer.jar and dex/dex-tools-*/d2j-jar2dex.sh
#   ANDROID_JAR  android.jar of API level 36
#   KEYSTORE     the release keystore (keep it out of this repository)
#   KS_ALIAS, KS_PASS, KS_KEY_PASS   keystore alias and passwords
# Output: releases/JLPT-Cheat-Codes-v<version>.apk
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
APK_TOOLS="${APK_TOOLS:-/home/claude/apk/tools}"
ANDROID_JAR="${ANDROID_JAR:-/home/claude/apk/dl36/android-36.jar}"
KEYSTORE="${KEYSTORE:-/home/claude/apk/build/n5-release.jks}"
KS_ALIAS="${KS_ALIAS:-n5}"
: "${KS_PASS:?set KS_PASS to the keystore password}"
KS_KEY_PASS="${KS_KEY_PASS:-$KS_PASS}"
VERSION="$(grep -o "versionName: .*" "$HERE/apkdir/apktool.yml" | cut -d' ' -f2)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Java: Java 8 bytecode against API 36, then dex
mkdir -p "$WORK/classes"
javac -nowarn -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d "$WORK/classes" "$HERE"/src/com/n5cheatcodes/app/*.java 2>&1 | grep -E "error" || true
(cd "$WORK/classes" && jar cf "$WORK/classes.jar" com)
"$APK_TOOLS"/dex/dex-tools-*/d2j-jar2dex.sh -f -o "$WORK/classes.dex" "$WORK/classes.jar" 2>&1 | grep -iE "error|exception" || true

# package: copy the project so the build never writes into the repository
cp -r "$HERE/apkdir" "$WORK/apkdir"
cp "$WORK/classes.dex" "$WORK/apkdir/classes.dex"
java -jar "$APK_TOOLS/apktool.jar" b "$WORK/apkdir" -o "$WORK/unsigned.apk" 2>&1 | grep -E "Built apk|rror" || true
(cd "$WORK" && java -jar "$APK_TOOLS/uber-apk-signer.jar" -a unsigned.apk --allowResign --ks "$KEYSTORE" --ksAlias "$KS_ALIAS" --ksPass "$KS_PASS" --ksKeyPass "$KS_KEY_PASS" 2>&1 | grep -E "signature verified|zipalign verified|rror" || true)
mkdir -p "$ROOT/releases"
cp "$WORK/unsigned-aligned-signed.apk" "$ROOT/releases/JLPT-Cheat-Codes-v$VERSION.apk"
ls -la "$ROOT/releases/JLPT-Cheat-Codes-v$VERSION.apk"
