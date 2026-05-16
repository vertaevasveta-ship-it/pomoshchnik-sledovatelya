// app/index.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  // Анимированные значения прозрачности
  const op1 = useRef(new Animated.Value(0)).current;
  const op2 = useRef(new Animated.Value(0)).current;
  const op3 = useRef(new Animated.Value(0)).current;
  const op4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    const runCycle = () => {
      if (!isMounted) return;

      // Сброс перед новым циклом
      op1.setValue(0); op2.setValue(0); op3.setValue(0); op4.setValue(0);

      Animated.sequence([
        // 1. Центральный след
        Animated.timing(op1, { toValue: 1, duration: 300, useNativeDriver: true }),
        // 2. Левее и выше
        Animated.timing(op2, { toValue: 1, duration: 300, useNativeDriver: true }),
        // 3. Еще левее и выше
        Animated.timing(op3, { toValue: 1, duration: 300, useNativeDriver: true }),
        // 4. Самый левый и высокий
        Animated.timing(op4, { toValue: 1, duration: 300, useNativeDriver: true }),
        // 5. Плавное исчезновение всех следов
        Animated.parallel([
          Animated.timing(op1, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(op2, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(op3, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(op4, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => {
        if (isMounted) setTimeout(runCycle, 800);
      });
    };

    runCycle();
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      {/* Контейнер анимации */}
      <View style={styles.animationContainer}>
        <Animated.View style={[styles.footprint, { left: '48%', bottom: 10, opacity: op1 }]}>
          <Text style={[styles.fpIcon, { transform: [{ rotate: '-15deg' }] }]}>👣</Text>
        </Animated.View>
        
        <Animated.View style={[styles.footprint, { left: '30%', bottom: 45, opacity: op2 }]}>
          <Text style={[styles.fpIcon, { transform: [{ rotate: '10deg' }] }]}>👣</Text>
        </Animated.View>
        
        <Animated.View style={[styles.footprint, { left: '12%', bottom: 80, opacity: op3 }]}>
          <Text style={[styles.fpIcon, { transform: [{ rotate: '-10deg' }] }]}>👣</Text>
        </Animated.View>
        
        <Animated.View style={[styles.footprint, { left: '-5%', bottom: 115, opacity: op4 }]}>
          <Text style={[styles.fpIcon, { transform: [{ rotate: '15deg' }] }]}>👣</Text>
        </Animated.View>
      </View>

      <Text style={styles.appName}>Помощник следователя</Text>
      <Text style={styles.subtitle}>Мобильное приложение для фиксации осмотра места происшествия</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.buttonText}>▶ Войти в систему</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Версия 1.0 | ВКР</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', justifyContent: 'center', alignItems: 'center', padding: 20 },
  animationContainer: { 
    position: 'absolute', 
    top: '20%', // ✅ ИЗМЕНЕНО: было '30%', теперь следы значительно выше текста
    width: '100%', 
    height: 160, 
    overflow: 'hidden'
  },
  footprint: { position: 'absolute' },
  fpIcon: { fontSize: 42 },
  appName: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7f8c8d', marginBottom: 40, textAlign: 'center', paddingHorizontal: 20 },
  button: { backgroundColor: '#2980b9', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  version: { position: 'absolute', bottom: 30, fontSize: 12, color: '#95a5a6' }
});