import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Definición de tipos
interface EventLog {
  id: string;
  eventType: string;
  description: string;
  timestamp: string;
  photoUrl?: string | null;
}

const Cloud: React.FC = () => {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificación de autenticación
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

  // Fetch de eventos
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
        } catch (error) {
          console.error('Error fetching event logs:', error);
        }
      };

      fetchEvents();
    }
  }, [isAuthenticated]);

  // Fetch de fotos
  useEffect(() => {
    if (isAuthenticated) {
      const fetchPhotoUrls = async () => {
        try {
          const response = await fetch(
            'https://photosstoragemotionguard.blob.core.windows.net/photos?restype=container&comp=list'
          );
          const text = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'text/xml');
          const blobs = xmlDoc.getElementsByTagName('Blob');
          const urls: Record<string, string> = Array.from(blobs).reduce(
            (acc, blob) => {
              const name = blob.getElementsByTagName('Name')[0].textContent || '';
              const url = `https://photosstoragemotionguard.blob.core.windows.net/photos/${name}`;
              const timestamp = name.split('_')[1]?.split('.')[0];
              if (timestamp) acc[timestamp] = url;
              return acc;
            },
            {} as Record<string, string>
          );
          setPhotoUrls(urls);
        } catch (error) {
          console.error('Error fetching photo URLs:', error);
        }
      };

      fetchPhotoUrls();
    }
  }, [isAuthenticated]);

  // Asignar URLs de fotos a los eventos
  useEffect(() => {
    if (isAuthenticated && events.length > 0 && Object.keys(photoUrls).length > 0) {
      const usedPhotos = new Set<string>();
      const updatedEvents = events.map((event) => {
        const eventTimestamp = new Date(event.timestamp).getTime();
        let closestPhotoUrl: string | null = null;
        let closestTimeDifference = Infinity;

        Object.keys(photoUrls).forEach((photoTimestamp) => {
          const photoTime = new Date(
            `${photoTimestamp.slice(0, 4)}-${photoTimestamp.slice(4, 6)}-${photoTimestamp.slice(6, 8)}T${photoTimestamp.slice(9, 11)}:${photoTimestamp.slice(11, 13)}:${photoTimestamp.slice(13, 15)}`
          ).getTime();
          const timeDifference = Math.abs(eventTimestamp - photoTime);

          if (timeDifference < closestTimeDifference && !usedPhotos.has(photoUrls[photoTimestamp])) {
            closestTimeDifference = timeDifference;
            closestPhotoUrl = photoUrls[photoTimestamp];
          }
        });

        if (closestPhotoUrl) {
          usedPhotos.add(closestPhotoUrl);
        }

        return { ...event, photoUrl: closestPhotoUrl };
      });
      setEvents(updatedEvents);
    }
  }, [photoUrls]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
  };

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

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
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>Reporte de eventos</Text>
      </View>

      <View style={styles.sorterContainer}>
        <Text style={styles.sorterLabel}>Ordenar por fecha:</Text>
        <Picker
          selectedValue={sortOrder}
          style={styles.picker}
          onValueChange={(itemValue: 'asc' | 'desc') => setSortOrder(itemValue)}
        >
          <Picker.Item label="Más reciente primero" value="desc" />
          <Picker.Item label="Más antiguo primero" value="asc" />
        </Picker>
      </View>

      {sortedEvents.map((event) => (
        <View key={event.id} style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.eventText}>
              {event.eventType}: {event.description}
            </Text>
            <Text style={styles.timestamp}>{formatTimestamp(event.timestamp)}</Text>
          </View>
          {event.photoUrl ? (
            <Image source={{ uri: event.photoUrl }} style={styles.photo} />
          ) : (
            <Ionicons name="image-outline" size={40} color="gray" />
          )}
        </View>
      ))}
    </ScrollView>
  );
};

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
    marginBottom: 20,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#C1D3FE',
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C3E50',
  },
  sorterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sorterLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  picker: {
    height: 50,
    width: 200,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cardText: {
    flex: 1,
  },
  eventText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default Cloud;
