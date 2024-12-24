import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleSignOut = async () => {
    try {
      // Eliminar token y datos del usuario del almacenamiento local
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userName');

      // Redirigir a la página principal
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/logo.png')} // Cambia esta ruta si es necesario
            style={styles.image}
          />
        </View>
        <Text style={styles.profileText}>Datos de la persona</Text>
      </View>

      <Link href="/SubScreens/AboutScreen" style={styles.optionContainer}>
        <Ionicons name="help-circle-outline" size={24} color="#6FCF97" />
        <Text style={styles.optionText}>Preguntas frecuentes</Text>
      </Link>

      <Link href="/SubScreens/ConfigScreen" style={styles.optionContainer}>
        <Ionicons name="settings-outline" size={24} color="#F2994A" />
        <Text style={styles.optionText}>Configuración</Text>
      </Link>

      <Link href="/SubScreens/FAQScreen" style={styles.optionContainer}>
        <Ionicons name="information-circle-outline" size={24} color="#56CCF2" />
        <Text style={styles.optionText}>Acerca de</Text>
      </Link>

      {/* Botón para eliminar el token y redirigir a la página inicial */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={24} color="#EB5757" />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4FF', // Fondo azul claro
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#C1D3FE',
    paddingBottom: 10,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  profileText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
    color: '#2C3E50',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
    color: '#EB5757', // Rojo para el texto de cerrar sesión
  },
});

export default SettingsScreen;
