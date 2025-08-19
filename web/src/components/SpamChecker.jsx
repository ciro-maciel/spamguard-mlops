import React, { useState } from 'react';
import { Button, Card, Group, Textarea, Title, Text, Stack } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SpamChecker() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePredict() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('http://localhost:3001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.prediction);
    } catch (e) {
      setError(e.message || 'Erro ao prever');
    } finally {
      setLoading(false);
    }
  }

  const chartData = (result || []).map((r) => ({ label: r.label, value: r.value }));
  const top = (result || []).slice().sort((a,b)=>b.value-a.value)[0];

  return (
    <Stack>
      <Title order={4}>Classifique uma mensagem</Title>
      <Textarea
        placeholder="Digite sua mensagem aqui"
        minRows={4}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />
      <Group>
        <Button loading={loading} onClick={handlePredict} disabled={!message.trim()}>Analisar</Button>
      </Group>
      {error && <Text c="red">{error}</Text>}
      {result && (
        <Card withBorder>
          <Text fw={600} mb="sm">Resultado</Text>
          {top && <Text mb="sm">Predição: <b>{top.label}</b> ({(top.value*100).toFixed(1)}%)</Text>}
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(v)=> (v*100).toFixed(1) + '%'} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </Stack>
  );
}
