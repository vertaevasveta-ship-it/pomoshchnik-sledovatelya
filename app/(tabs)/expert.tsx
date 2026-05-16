import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet, Share } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export default function ExpertScreen() {
  const [loading, setLoading] = useState(false);
  
  // Данные эксперта
  const [expertName, setExpertName] = useState('');
  const [expertPosition, setExpertPosition] = useState('');
  const [expertiseName, setExpertiseName] = useState('');
  
  // Вопросы
  const [questions, setQuestions] = useState([{ id: 1, text: '' }]);
  
  // Вывод
  const [conclusionType, setConclusionType] = useState('');
  const [conclusionValue, setConclusionValue] = useState('');
  
  // Файлы
  const [filesList, setFilesList] = useState([]);

  const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: '' }]);
  const removeQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));
  const updateQuestion = (id, text) => setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));

  // Прикрепление файлов
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled) {
        const file = result.assets[0];
        setFilesList(prev => [...prev, { id: Date.now(), name: file.name, uri: file.uri, type: file.mimeType || 'file' }]);
      }
    } catch (err) { Alert.alert('Ошибка', 'Не удалось выбрать файл'); }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Ошибка', 'Нужен доступ к галерее');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images, allowsEditing: false, quality: 0.8 });
    if (!result.canceled) {
      const img = result.assets[0];
      setFilesList(prev => [...prev, { id: Date.now(), name: img.fileName || 'photo.jpg', uri: img.uri, type: 'image' }]);
    }
  };

  // Сохранение
  const handleSave = async () => {
    if (!expertName || !expertiseName || questions.some(q => !q.text)) {
      return Alert.alert('Ошибка', 'Заполните ФИО, название экспертизы и все вопросы');
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'expertConclusions'), {
        authorId: auth.currentUser.uid,
        authorEmail: auth.currentUser.email,
        expertName, expertPosition, expertiseName,
        questions, conclusionType, conclusionValue,
        filesList,
        createdAt: serverTimestamp()
      });
      Alert.alert('✅ Успех', 'Заключение сохранено в архив!');
      // Очистка формы
      setExpertName(''); setExpertPosition(''); setExpertiseName('');
      setQuestions([{ id: 1, text: '' }]); setConclusionType(''); setConclusionValue(''); setFilesList([]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить');
    } finally { setLoading(false); }
  };

  // Экспорт
  const handleExport = async () => {
    const qText = questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n');
    const fText = filesList.map(f => f.name).join(', ') || '—';
    
    let valText = '';
    if (conclusionType === 'categorical') valText = `Категорический: ${conclusionValue === 'positive' ? '✅ Положительный' : '❌ Отрицательный'}`;
    else if (conclusionType === 'probabilistic') valText = `Вероятностный: ${conclusionValue === 'positive' ? '✅ Положительный' : '❌ Отрицательный'}`;
    else if (conclusionType === 'alternative') valText = 'Альтернативный';
    else if (conclusionType === 'impossible') valText = 'Не представилось возможным дать ответ';

    const text = `🔬 ЗАКЛЮЧЕНИЕ ЭКСПЕРТА\n👤 ${expertName}\n💼 ${expertPosition || '—'}\n📋 ${expertiseName}\n\n❓ Вопросы:\n${qText}\n\n📝 Вывод:\n${valText || '—'}\n\n📎 Приложения: ${fText}\n📝 Помощник Следователя`;
    
    try { await Share.share({ message: text, title: 'Заключение эксперта' }); }
    catch (e) { Alert.alert('Ошибка', 'Не удалось поделиться'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🔬 Заключение эксперта</Text>
      <ScrollView style={styles.form} contentContainerStyle={{paddingBottom: 40}}>
        
        <Section title="👤 Данные эксперта">
          <Field label="ФИО эксперта" value={expertName} onChange={setExpertName} placeholder="Иванов И.И." />
          <Field label="Должность" value={expertPosition} onChange={setExpertPosition} placeholder="Эксперт-криминалист" />
          <Field label="Название экспертизы" value={expertiseName} onChange={setExpertiseName} placeholder="Трасологическая..." />
        </Section>

        <Section title="❓ Вопросы эксперту">
          {questions.map((q, i) => (
            <View key={q.id} style={styles.questionRow}>
              <TextInput style={styles.input} placeholder={`Вопрос ${i + 1}`} value={q.text} onChangeText={t => updateQuestion(q.id, t)} />
              {questions.length > 1 && <TouchableOpacity onPress={() => removeQuestion(q.id)}><Text style={styles.delBtn}>❌</Text></TouchableOpacity>}
            </View>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addQuestion}><Text style={styles.addText}>+ Добавить вопрос</Text></TouchableOpacity>
        </Section>

        <Section title="📝 Вывод">
          <Text style={styles.label}>Тип вывода:</Text>
          <View style={styles.radioGroup}>
            {[
              { id: 'categorical', label: 'Категорический' },
              { id: 'probabilistic', label: 'Вероятностный' },
              { id: 'alternative', label: 'Альтернативный' },
              { id: 'impossible', label: 'Не представилось возможным' }
            ].map(opt => (
              <TouchableOpacity key={opt.id} style={[styles.radioBtn, conclusionType === opt.id && styles.radioBtnActive]} onPress={() => { setConclusionType(opt.id); setConclusionValue(''); }}>
                <Text style={[styles.radioText, conclusionType === opt.id && styles.radioTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {(conclusionType === 'categorical' || conclusionType === 'probabilistic') && (
            <View style={styles.subRadioGroup}>
              <Text style={styles.label}>Значение:</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity style={[styles.radioBtn, conclusionValue === 'positive' && styles.radioBtnPositive]} onPress={() => setConclusionValue('positive')}>
                  <Text style={[styles.radioText, conclusionValue === 'positive' && styles.radioTextPositive]}>✅ Положительный</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.radioBtn, conclusionValue === 'negative' && styles.radioBtnNegative]} onPress={() => setConclusionValue('negative')}>
                  <Text style={[styles.radioText, conclusionValue === 'negative' && styles.radioTextNegative]}>❌ Отрицательный</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Section>

        <Section title="📎 Приложения">
          <View style={{flexDirection:'row', gap:10}}>
            <TouchableOpacity style={[styles.addBtn, {flex:1}]} onPress={handlePickFile}><Text style={styles.addText}>📄 Файл</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, {flex:1}]} onPress={handlePickImage}><Text style={styles.addText}>🖼️ Фото</Text></TouchableOpacity>
          </View>
          {filesList.map(f => <Text key={f.id} style={styles.fileText}>📎 {f.name}</Text>)}
        </Section>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>💾 Сохранить</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}><Text style={styles.exportText}>📤 Экспорт</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Вспомогательные компоненты ---
function Section({ title, children }) { return (<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>); }
function Field({ label, value, onChange, placeholder }) { return (<View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#95a5a6" /></View>); }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', padding: 15, textAlign: 'center', backgroundColor: '#fff' },
  form: { flex: 1 },
  section: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  field: { marginBottom: 12 },
  label: { fontSize: 14, color: '#7f8c8d', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15, flex: 1 },
  questionRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  delBtn: { fontSize: 18 },
  addBtn: { marginTop: 5, padding: 10, backgroundColor: '#ecf0f1', borderRadius: 6, alignItems: 'center' },
  addText: { color: '#2c3e50', fontWeight: 'bold', fontSize: 13 },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  radioBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#bdc3c7', backgroundColor: '#fff' },
  radioBtnActive: { backgroundColor: '#2980b9', borderColor: '#2980b9' },
  radioBtnPositive: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  radioBtnNegative: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  radioText: { fontSize: 13, color: '#7f8c8d' },
  radioTextActive: { color: '#fff' },
  radioTextPositive: { color: '#fff' },
  radioTextNegative: { color: '#fff' },
  subRadioGroup: { marginTop: 5, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#ecf0f1' },
  fileText: { fontSize: 13, color: '#2980b9', marginBottom: 4, marginTop: 5 },
  buttonRow: { flexDirection: 'row', gap: 10, padding: 15 },
  saveBtn: { flex: 1, backgroundColor: '#2980b9', padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  exportBtn: { flex: 1, backgroundColor: '#e74c3c', padding: 14, borderRadius: 10, alignItems: 'center' },
  exportText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});