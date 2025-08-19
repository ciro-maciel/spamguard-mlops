import React, { useEffect, useMemo, useState } from 'react';
import { Card, Group, Loader, Table, Text, Title, Badge } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:3001/dashboard');
        const data = await res.json();
        setRuns(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Erro ao carregar');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData = useMemo(() => {
    const ordered = [...runs].reverse();
    return ordered.map((r, idx) => ({
      idx,
      accuracy: (r.metrics && r.metrics.accuracy) || 0,
      createdAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : ''
    }));
  }, [runs]);

  return (
    <>
      <Title order={4} mb="sm">Evolução de Métricas</Title>
      <Card withBorder mb="lg" style={{ width: '100%', height: 280 }}>
        {loading ? (
          <Group justify="center" align="center" style={{ height: '100%' }}>
            <Loader />
          </Group>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : (
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(v) => (v*100).toFixed(1) + '%'} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Title order={4} mb="sm">Execuções</Title>
      <Card withBorder>
        {loading ? (
          <Group justify="center" align="center"><Loader /></Group>
        ) : (
          <Table highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Commit</Table.Th>
                <Table.Th>Acurácia</Table.Th>
                <Table.Th>F1</Table.Th>
                <Table.Th>Criado em</Table.Th>
                <Table.Th>Produção</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {runs.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{r.id}</Table.Td>
                  <Table.Td><code>{r.gitCommit || '-'}</code></Table.Td>
                  <Table.Td>{r.metrics ? (r.metrics.accuracy*100).toFixed(1)+'%' : '-'}</Table.Td>
                  <Table.Td>{r.metrics ? (r.metrics.f1Score*100).toFixed(1)+'%' : '-'}</Table.Td>
                  <Table.Td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</Table.Td>
                  <Table.Td>
                    {r.isProduction ? <Badge color="green">Sim</Badge> : <Badge variant="light">Não</Badge>}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
