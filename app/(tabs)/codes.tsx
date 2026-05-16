import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '../../src/db/initLegalDB';

const CODES_LIST = ['Все', 'УК РФ', 'УПК РФ', 'ГК РФ', 'ГПК РФ', 'КоАП РФ', 'СК РФ', 'ТК РФ', 'НК РФ'];

export default function CodesScreen() {
  const [db, setDb] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState('Все');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Инициализация базы
  useEffect(() => {
    const setup = async () => {
      try {
        const database = await initDatabase();
        setDb(database);
        await loadArticles(database);
      } catch (error) {
        console.error('Ошибка инициализации БД:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить базу кодексов');
      } finally {
        setLoading(false);
      }
    };
    setup();
    return () => db?.closeAsync();
  }, []);

  // Загрузка статей
  const loadArticles = async (database) => {
    const result = await database.getAllAsync(
      'SELECT * FROM codes ORDER BY code_name, article_number'
    );
    setArticles(result);
    filterArticles(result, searchQuery, selectedCode);
  };

  // Фильтрация
  const filterArticles = (data, query, code) => {
    let filtered = data;
    if (code !== 'Все') {
      filtered = filtered.filter(item => item.code_name === code);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(item =>
        item.article_number.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
      );
    }
    setFilteredArticles(filtered);
  };

  // Поиск
  const handleSearch = (text) => {
    setSearchQuery(text);
    filterArticles(articles, text, selectedCode);
  };

  // Фильтр по кодексу
  const handleCodeFilter = (code) => {
    setSelectedCode(code);
    filterArticles(articles, searchQuery, code);
  };

  // Открыть на pravo.gov.ru
  const openOfficialSource = async (article) => {
    const codeMap = {
      'УК РФ': 'uk', 'УПК РФ': 'upk', 'ГК РФ': 'gk', 'ГПК РФ': 'gpk',
      'КоАП РФ': 'koap', 'СК РФ': 'sk', 'ТК РФ': 'tk', 'НК РФ': 'nk'
    };
    const shortCode = codeMap[article.code_name];
    if (shortCode) {
      const url = `https://pravo.gov.ru/proxy/ips/?docbody=&nd=${shortCode}${article.article_number}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Ошибка', 'Не удалось открыть ссылку');
    }
  };

  // Детальный просмотр
  if (selectedArticle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedArticle(null)}>
            <Text style={styles.backBtn}>⬅ Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedArticle.code_name} {selectedArticle.article_number}</Text>
          <TouchableOpacity onPress={() => openOfficialSource(selectedArticle)}>
            <Text style={styles.linkBtn}>🔗 Актуальность</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.articleTitle}>{selectedArticle.title}</Text>
          {selectedArticle.part ? <Text style={styles.partLabel}>{selectedArticle.part}</Text> : null}
          <Text style={styles.articleText}>{selectedArticle.text}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2980b9" />
        <Text style={styles.loadingText}>Загрузка базы кодексов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚖️ Справочник по кодексам</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Поиск по номеру, названию или тексту..."
        value={searchQuery}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />

      <FlatList
        horizontal
        data={CODES_LIST}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.codeChip, selectedCode === item && styles.codeChipActive]}
            onPress={() => handleCodeFilter(item)}
          >
            <Text style={[styles.codeChipText, selectedCode === item && styles.codeChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      />

      {filteredArticles.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Ничего не найдено</Text>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => setSelectedArticle(item)}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.code_name}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.article_number}. {item.title}</Text>
                {item.part ? <Text style={styles.partBadge}>{item.part}</Text> : null}
                <Text style={styles.cardPreview} numberOfLines={2}>{item.text}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', padding: 15, textAlign: 'center' },
  searchInput: { backgroundColor: '#fff', marginHorizontal: 15, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#bdc3c7', marginBottom: 10, fontSize: 14 },
  chipsContainer: { paddingHorizontal: 10, paddingVertical: 5 },
  codeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ecf0f1', marginRight: 8 },
  codeChipActive: { backgroundColor: '#2980b9' },
  codeChipText: { fontSize: 13, color: '#7f8c8d', fontWeight: '500' },
  codeChipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 15, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', elevation: 1 },
  badge: { backgroundColor: '#e8f0fe', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, marginRight: 12 },
  badgeText: { color: '#1a73e8', fontWeight: 'bold', fontSize: 11 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 3 },
  partBadge: { fontSize: 10, color: '#95a5a6', marginBottom: 4 },
  cardPreview: { fontSize: 12, color: '#7f8c8d' },
  arrow: { fontSize: 20, color: '#bdc3c7', marginLeft: 10 },
  emptyText: { fontSize: 16, color: '#95a5a6' },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 14 },
  // Детали
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', justifyContent: 'space-between' },
  backBtn: { fontSize: 15, color: '#2980b9', fontWeight: 'bold' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
  linkBtn: { fontSize: 13, color: '#27ae60', fontWeight: '600' },
  content: { padding: 20 },
  articleTitle: { fontSize: 19, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  partLabel: { fontSize: 13, color: '#95a5a6', marginBottom: 12, fontStyle: 'italic' },
  articleText: { fontSize: 16, color: '#34495e', lineHeight: 24 }
});