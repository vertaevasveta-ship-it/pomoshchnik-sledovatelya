// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { auth } from '../src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function RootLayout() {
  const [user, setUser] = useState(undefined);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      // После входа запоминаем, что нужно показать вкладки
      if (u) setInitialRoute('/(tabs)/home');
    });
    return unsubscribe;
  }, []);

  // Пока проверяем авторизацию — показываем пустой экран
  if (user === undefined) return null;

  // ❌ Не авторизован: показываем экраны входа
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
      </Stack>
    );
  }

  // ✅ Авторизован: показываем главное меню
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}