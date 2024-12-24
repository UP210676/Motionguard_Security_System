import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Photo {
  name: string;
  url: string;
}

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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
      const fetchPhotos = async () => {
        try {
          const response = await fetch(
            'https://photosstoragemotionguard.blob.core.windows.net/photos?restype=container&comp=list'
          );
          const text = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'text/xml');
          const blobs = xmlDoc.getElementsByTagName('Blob');
          const fetchedPhotos: Photo[] = Array.from(blobs).map((blob) => {
            const name = blob.getElementsByTagName('Name')[0].textContent || '';
            const url = `https://photosstoragemotionguard.blob.core.windows.net/photos/${name}`;
            return { name, url };
          });
          setPhotos(fetchedPhotos);
        } catch (error) {
          console.error('Error fetching photos:', error);
        }
      };

      fetchPhotos();
    }
  }, [isAuthenticated]);

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
        <Image
          source={require('@/assets/images/logo.png')} // Ajusta la ruta del logo según sea necesario.
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>Fotos</Text>
      </View>

      {photos.map((photo) => (
        <View key={photo.name} style={styles.card}>
          <Image source={{ uri: photo.url }} style={styles.photo} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F0F4FF', // Fondo azul claro.
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
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Blanco para las tarjetas.
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    resizeMode: 'cover',
  },
});

export default Photos;
