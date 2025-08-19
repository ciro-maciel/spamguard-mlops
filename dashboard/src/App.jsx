import React, { useState } from 'react';
import { AppShell, Group, Title, Container, Tabs } from '@mantine/core';
import SpamChecker from './components/SpamChecker.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [tab, setTab] = useState('checker');

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" align="center" justify="space-between">
          <Title order={3}>SpamGuard MLOps</Title>
          <Tabs value={tab} onChange={setTab} keepMounted={false}>
            <Tabs.List>
              <Tabs.Tab value="checker">Spam Checker</Tabs.Tab>
              <Tabs.Tab value="dashboard">MLOps Dashboard</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" pt="md">
          {tab === 'checker' ? <SpamChecker /> : <Dashboard />}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
