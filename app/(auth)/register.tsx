// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Валидация полей
    if (!fullName || !email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }
    
    setLoading(true);
    try {
      // 2. Создаём пользователя в Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 3. Сохраняем профиль в Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        createdAt: new Date().toISOString()
      });
      
      // ✅ 4. Успех: принудительно переходим на главное меню
      Alert.alert('Успех', 'Аккаунт создан!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Исправлено: используем replace с правильным путём к вкладкам
            router.replace('/(tabs)/home');
          } 
        }
      ]);
      
    } catch (error) {
      let msg = 'Ошибка регистрации';
      if (error.code === 'auth/email-already-in-use') msg = 'Этот email уже занят';
      if (error.code === 'auth/invalid-email') msg = 'Некорректный формат email';
      if (error.code === 'auth/weak-password') msg = 'Пароль слишком слабый';
      if (error.code === 'auth/network-request-failed') msg = 'Нет соединения с интернетом';
      
      Alert.alert('Ошибка', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Регистрация</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="ФИО" 
        value={fullName} 
        onChangeText={setFullName} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Пароль" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Повторите пароль" 
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
        secureTextEntry 
      />
      
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Зарегистрироваться</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f0f4f8' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#bdc3c7' },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { color: '#3498db', textAlign: 'center', marginTop: 20, fontSize: 14 }
});