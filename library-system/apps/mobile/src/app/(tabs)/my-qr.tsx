// apps/mobile/src/app/(tabs)/my-qr.tsx
import 'react-native-get-random-values'; // <-- THIS MUST BE LINE 1. DO NOT MOVE IT.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { URI } from 'otpauth'; 

export default function MyQrScreen() {
  const STUDENT_SECRET = 'JBSWY3DPEHPK3PXP'; 
  const STUDENT_ID = '2026-0001';

  const [token, setToken] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);

  useEffect(() => {
    const otpUri = `otpauth://totp/LibLog:Attendance?secret=${STUDENT_SECRET}&issuer=LibLog&algorithm=SHA1&digits=6&period=30`;
    const totp = URI.parse(otpUri);

    const updateToken = () => {
      const currentToken = totp.generate();
      const payload = JSON.stringify({ studentId: STUDENT_ID, scannedToken: currentToken });
      setToken(payload);

      const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
      setSecondsLeft(seconds);
    };

    updateToken();
    const interval = setInterval(updateToken, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library Digital ID</Text>
      
      <View style={styles.qrContainer}>
        {token ? (
          <QRCode
            value={token}
            size={250}
            color="black"
            backgroundColor="white"
          />
        ) : (
          <Text>Initializing secure environment...</Text>
        )}
      </View>

      <Text style={styles.timerText}>
        QR Code refreshes in: <Text style={styles.timerCountdown}>{secondsLeft}s</Text>
      </Text>
      <Text style={styles.subtitle}>ID: {STUDENT_ID}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#111827',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  timerText: {
    marginTop: 30,
    fontSize: 16,
    color: '#4B5563',
  },
  timerCountdown: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  }
});