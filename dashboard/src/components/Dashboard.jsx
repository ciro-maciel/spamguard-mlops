import React from 'react';
import { Card, Title, Text, Button, Center } from '@mantine/core';

export default function Dashboard() {
  // IMPORTANTE: Substitua pela URL do seu app MLflow na Fly.io
  const mlflowUiUrl = "https://spamguard-mlflow.fly.dev";

  return (
    <Card withBorder>
      <Center style={{ flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
        <Title order={3}>MLOps Dashboard</Title>
        <Text c="dimmed" mt="md" maw={600}>
          O rastreamento de experimentos foi atualizado para MLflow, a ferramenta padrão da indústria. A UI abaixo foi substituída por um dashboard profissional e interativo hospedado no nosso próprio servidor MLflow.
        </Text>
        <Button
          component="a"
          href={mlflowUiUrl}
          target="_blank"
          mt="xl"
          size="md"
        >
          Abrir Dashboard MLflow
        </Button>
      </Center>
    </Card>
  );
}
