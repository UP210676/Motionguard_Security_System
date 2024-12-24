import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const AboutScreen = () => {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('@/assets/images/logo.png')} // Asegúrate de que la ruta sea correcta
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>Acerca de Nuestra App</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>¿Quiénes somos?</Text>
        <Text style={styles.paragraph}>
          Somos un equipo apasionado por la tecnología y la innovación. Nuestra aplicación fue creada 
          con el objetivo de brindar soluciones prácticas y efectivas para tus necesidades diarias 
          relacionadas con la seguridad y el control remoto.
        </Text>

        <Text style={styles.subtitle}>¿Qué ofrecemos?</Text>
        <Text style={styles.paragraph}>
          Nuestra app combina funcionalidades avanzadas de detección de movimiento, almacenamiento 
          en la nube y notificaciones instantáneas para mantenerte informado y protegido en todo momento. 
          Todo esto respaldado por tecnologías modernas como Microsoft Azure y Expo.
        </Text>

        <Text style={styles.subtitle}>Nuestra misión</Text>
        <Text style={styles.paragraph}>
          Queremos hacer que la tecnología sea accesible, segura y útil para todos. Creemos que la 
          tecnología no solo resuelve problemas, sino que también mejora nuestra calidad de vida.
        </Text>

        <Text style={styles.subtitle}>Contacto</Text>
        <Text style={styles.paragraph}>
          Si tienes alguna pregunta o sugerencia, no dudes en contactarnos en 
          <Text style={styles.highlight}> up210752@alumnos.upa.edu.mx</Text>. Estaremos encantados de ayudarte.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF', // Fondo azul claro
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  header: {
    backgroundColor: '#2C3E50', // Azul oscuro
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF', // Texto blanco
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2C3E50', // Azul oscuro
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555', // Gris oscuro
    marginBottom: 20,
  },
  highlight: {
    color: '#F2994A', // Naranja
    fontWeight: 'bold',
  },
});

export default AboutScreen;
