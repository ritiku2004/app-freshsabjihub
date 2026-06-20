import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../theme';
import { loaderBase64 } from '../assets/loaderBase64';

export const Loader = ({ text = 'Freshness on the way' }) => {
  const videoSrc = `data:video/webm;base64,${loaderBase64}`;
  
  // HTML layout designed to scale webm video to full size of component with white background
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          video {
            width: 100%;
            height: 100%;
            max-width: 240px;
            max-height: 240px;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <video autoplay loop muted playsinline>
          <source src="${videoSrc}" type="video/webm">
        </video>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.loaderWrapper}>
        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={styles.webview}
          scrollEnabled={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          scalesPageToFit={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
        />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderWrapper: {
    width: 300,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  webview: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
  },
  tipText: {
    marginTop: -55,
    fontSize: theme.typography.sizes.sm + 1,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 35,
    lineHeight: 20,
  },
});

export default Loader;
