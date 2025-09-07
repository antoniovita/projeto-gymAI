// TestScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native'
import { useRAGChat } from '../hooks/useRAGChat' // ou '../hooks/useRAGChat'

const TestScreen = () => {
  const [query, setQuery] = useState('')

  const { run, loading, answer, error } = useRAGChat({
    skin: 'fuoco',        // troque a skin se quiser
    includeDefault: true, // inclui docs default no seed
    streaming: true,      // mostra a resposta chegando ao vivo
    nPredict: 256,
  })

  const handleAsk = async () => {
    if (!query.trim()) return
    await run(query)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Pergunte algo…"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button title={loading ? 'Processando…' : 'Perguntar'} onPress={handleAsk} disabled={loading || !query.trim()} />

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}

      {!!answer && <Text style={styles.answer}>{answer}</Text>}

      {!!error && <Text style={styles.error}>⚠️ {error}</Text>}
    </View>
  )
}

export default TestScreen

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 250, backgroundColor: '#fff' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  answer: { marginTop: 16, fontSize: 16, lineHeight: 22, color: '#111' },
  error: { marginTop: 12, color: '#d00' },
})
