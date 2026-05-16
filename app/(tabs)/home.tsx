// app/(tabs)/home.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../src/config/firebase';

export default function HomeScreen() {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Помощник Следователя </Text>
        <Text style={styles.subtitle}>Мобильный помощник следователя</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/protocol/new')}>
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardText}>Новый осмотр</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/archive')}>
          <Text style={styles.cardIcon}>📁</Text>
          <Text style={styles.cardText}>Архив протоколов</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/codes')}>
          <Text style={styles.cardIcon}>📖</Text>
          <Text style={styles.cardText}>Справочник кодексов</Text>
        </TouchableOpacity>

        {/* ✅ НОВАЯ КАРТОЧКА */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/expert')}>
          <Text style={styles.cardIcon}>🔬</Text>
          <Text style={styles.cardText}>Заключение эксперта</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Выйти из системы</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: { padding: 20, backgroundColor: '#2c3e50', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: '#bdc3c7', fontSize: 14, marginTop: 5 },
  menu: { padding: 15 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardIcon: { fontSize: 32, marginRight: 15 },
  cardText: { fontSize: 18, fontWeight: '600', color: '#2c3e50' },
  logoutButton: { margin: 20, padding: 15, backgroundColor: '#e74c3c', borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});