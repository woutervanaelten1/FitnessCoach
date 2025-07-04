import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

/**
 * Fallback screen for undefined routes.
 * Displays an error message and a link to return to the home screen.
 *
 * @returns {JSX.Element} NotFound screen component.
 */

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/(root)/(tabs)/home/index" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});
