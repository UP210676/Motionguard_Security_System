import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface EventLog {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
}

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [personCount, setPersonCount] = useState(0);
  const [objectCount, setObjectCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<EventLog | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          setIsAuthenticated(true);
        } else {
          router.push('/'); // Redirige al login si no está autenticado
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchEvents = async () => {
        try {
          const response = await fetch('https://deteccionmovimiento-dhbabfg6etdkgxbk.canadacentral-01.azurewebsites.net/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                query {
                  eventLogs {
                    id
                    eventType
                    description
                    timestamp
                  }
                }
              `,
            }),
          });
          const jsonResponse = await response.json();
          const eventLogs: EventLog[] = jsonResponse.data.eventLogs || [];
          setEvents(eventLogs);

          // Contar eventos
          const personEvents = eventLogs.filter(event => event.eventType === 'Persona detectada');
          const objectEvents = eventLogs.filter(event => event.eventType === 'Objeto detectado');
          setPersonCount(personEvents.length);
          setObjectCount(objectEvents.length);

          // Encontrar el último evento
          if (eventLogs.length > 0) {
            const sortedEvents = eventLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setLastEvent(sortedEvents[0]);
          }
        } catch (error) {
          console.error('Error fetching event logs:', error);
        }
      };

      fetchEvents();
    }
  }, [isAuthenticated]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Ya se redirige al login en el efecto
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="home-outline" size={32} color="#2C3E50" />
        <Text style={styles.headerTitle}>Inicio</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="person-outline" size={32} color="#6FCF97" />
          <Text style={styles.summaryText}>Personas detectadas</Text>
          <View style={styles.countCard}>
            <Text style={styles.countText}>{personCount}</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="cube-outline" size={32} color="#F2994A" />
          <Text style={styles.summaryText}>Proximidad detectada</Text>
          <View style={styles.countCard}>
            <Text style={styles.countText}>{objectCount}</Text>
          </View>
        </View>
      </View>

      {lastEvent && (
        <View style={styles.lastEventContainer}>
          <Text style={styles.lastEventTitle}>Último evento</Text>
          <Text style={styles.lastEventText}>{lastEvent.eventType}: {lastEvent.description}</Text>
          <Text style={styles.lastEventTimestamp}>{formatTimestamp(lastEvent.timestamp)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F0F4FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C1D3FE',
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
    marginHorizontal: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
  },
  countCard: {
    marginTop: 8,
    backgroundColor: '#E0E0E0',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  countText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  lastEventContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  lastEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  lastEventText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#2C3E50',
  },
  lastEventTimestamp: {
    fontSize: 14,
    color: '#666',
  },
});
