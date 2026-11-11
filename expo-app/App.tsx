import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { isExternalHttp, isOwnSiteUrl, PRIVACY_URL, SITE_URL } from './src/links';

/**
 * WebView shell for the public Gym Everyday site.
 * Cloud sync and Google sign-in are off on that site. This shell does not add them.
 * The site does not use the camera or the photo library, so this app requests neither.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

function Shell() {
  const [target, setTarget] = useState(SITE_URL);
  const [pageUrl, setPageUrl] = useState(SITE_URL);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const retry = () => {
    setError(null);
    setReloadKey((n) => n + 1);
  };

  const openPrivacy = () => {
    setError(null);
    setTarget(PRIVACY_URL);
    setPageUrl(PRIVACY_URL);
    setReloadKey((n) => n + 1);
  };

  const onShare = async () => {
    const url = isOwnSiteUrl(pageUrl) ? pageUrl : SITE_URL;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { url, title: 'Gym Everyday' }
          : { message: url, title: 'Gym Everyday' },
      );
    } catch {
      // The sheet was dismissed.
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'right', 'bottom', 'left']}>
      <StatusBar style="light" />
      <View style={styles.bar}>
        <Text style={styles.brand} accessibilityRole="header">Gym Everyday</Text>
        <View style={styles.barActions}>
          <Pressable onPress={openPrivacy} accessibilityRole="button" accessibilityLabel="Privacy policy" style={styles.barBtn}>
            <Text style={styles.barBtnText}>Privacy</Text>
          </Pressable>
          <Pressable onPress={onShare} accessibilityRole="button" accessibilityLabel="Share Gym Everyday" style={styles.barBtn}>
            <Text style={styles.barBtnText}>Share</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.body}>
        {error ? (
          <View style={styles.center}>
            <Text style={styles.errTitle}>Gym Everyday didn’t load</Text>
            <Text style={styles.errBody}>{error}</Text>
            <Pressable onPress={retry} accessibilityRole="button" style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <WebView<object>
            key={`${reloadKey}:${target}`}
            source={{ uri: target }}
            style={styles.web}
            pullToRefreshEnabled
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
            domStorageEnabled
            contentInsetAdjustmentBehavior="never"
            allowsBackForwardNavigationGestures
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color="#ff7a3d" size="large" />
              </View>
            )}
            onNavigationStateChange={(nav: WebViewNavigation) => {
              if (nav.url && isOwnSiteUrl(nav.url)) setPageUrl(nav.url);
            }}
            onError={() => setError('Check your connection, then try again.')}
            onHttpError={(event) => {
              const { statusCode, url } = event.nativeEvent;
              // Subresource 404s (exercise photos) must not replace the page.
              const failed = url.split('#')[0];
              const documentUrl = target.split('#')[0];
              if (statusCode >= 400 && failed === documentUrl) {
                setError('The site returned an error. Try again.');
              }
            }}
            onShouldStartLoadWithRequest={(request) => {
              const url = request.url;
              if (!url || url === 'about:blank') return true;
              if (isOwnSiteUrl(url)) return true;
              if (request.isTopFrame === false) return true;
              if (isExternalHttp(url)) {
                void WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url).catch(() => {}));
                return false;
              }
              void Linking.openURL(url).catch(() => {});
              return false;
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0614' },
  bar: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2e2640',
  },
  brand: { color: '#f3eef8', fontSize: 17, fontWeight: '700' },
  barActions: { flexDirection: 'row', gap: 4 },
  barBtn: { minHeight: 44, paddingHorizontal: 10, justifyContent: 'center' },
  barBtnText: { color: '#ffb06a', fontSize: 16, fontWeight: '600' },
  body: { flex: 1 },
  web: { flex: 1, backgroundColor: '#0a0614' },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0614',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  errTitle: { color: '#f3eef8', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  errBody: { color: '#a89bb8', fontSize: 16, textAlign: 'center' },
  retry: {
    marginTop: 8,
    backgroundColor: '#ff7a3d',
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
