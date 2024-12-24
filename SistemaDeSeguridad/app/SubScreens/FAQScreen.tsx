import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const FAQScreen = () => {
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
      {/* Sección de Preguntas y Respuestas */}
      <Text style={styles.header}>Preguntas Frecuentes</Text>
      <View style={styles.qaSection}>
        <View style={styles.qaItem}>
          <Text style={styles.question}>¿Qué incluye la instalación?</Text>
          <Text style={styles.answer}>
            La instalación incluye el montaje de la cámara, configuración inicial del sistema y conexión a la nube.
          </Text>
        </View>
        <View style={styles.qaItem}>
          <Text style={styles.question}>¿Puedo cambiar mi plan después de contratar?</Text>
          <Text style={styles.answer}>
            Sí, puedes cambiar a un plan superior en cualquier momento. El cambio al plan inferior solo es posible después de 6 meses.
          </Text>
        </View>
        <View style={styles.qaItem}>
          <Text style={styles.question}>¿Qué pasa si supero mi límite de almacenamiento?</Text>
          <Text style={styles.answer}>
            Puedes adquirir almacenamiento adicional por un costo adicional. Contáctanos para más información.
          </Text>
        </View>
      </View>

      {/* Tabla de planes de suscripción */}
      <Text style={styles.header}>Planes de Suscripción</Text>
      <Text style={styles.note}>
        Todos los planes tienen un cargo mensual, además de un gasto único de instalación de $3,000 MXN por la cámara.
      </Text>
      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell]}>Plan</Text>
          <Text style={[styles.cell, styles.headerCell]}>Almacenamiento</Text>
          <Text style={[styles.cell, styles.headerCell]}>Escalabilidad</Text>
          <Text style={[styles.cell, styles.headerCell]}>Costo Mensual</Text>
        </View>

        {/* Fila: Basic */}
        <View style={styles.row}>
          <Text style={styles.cell}>Basic</Text>
          <Text style={styles.cell}>10 días / 5GB</Text>
          <Text style={styles.cell}>No escalable</Text>
          <Text style={styles.cell}>$450 MXN</Text>
        </View>

        {/* Fila: Premium */}
        <View style={[styles.row, styles.altRow]}>
          <Text style={styles.cell}>Premium</Text>
          <Text style={styles.cell}>30 días / 10GB</Text>
          <Text style={styles.cell}>1 sensor adicional ($260 USD)</Text>
          <Text style={styles.cell}>$560 MXN</Text>
        </View>

        {/* Fila: Admin */}
        <View style={styles.row}>
          <Text style={styles.cell}>Admin</Text>
          <Text style={styles.cell}>50 días / 30GB</Text>
          <Text style={styles.cell}>2 sensores adicionales ($299.99 USD)</Text>
          <Text style={styles.cell}>$699 MXN</Text>
        </View>
      </View>
    </ScrollView>
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2C3E50', // Azul oscuro
  },
  qaSection: {
    marginBottom: 20,
  },
  qaItem: {
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50', // Azul oscuro
  },
  answer: {
    fontSize: 14,
    color: '#555555', // Gris oscuro
    marginTop: 5,
  },
  note: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    borderWidth: 1,
    borderColor: '#C1D3FE', // Borde azul claro
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#C1D3FE', // Azul claro
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerRow: {
    backgroundColor: '#E0E0E0', // Gris claro para encabezado
  },
  altRow: {
    backgroundColor: '#F9F9F9', // Blanco para filas alternas
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#2C3E50', // Azul oscuro
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#2C3E50', // Azul oscuro para encabezados
  },
});

export default FAQScreen;
