import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { useFocusEffect } from '@react-navigation/native';

const tenantID = '566887ff-71d5-42bf-b3c3-24486d1d358e';
const clientID = 'ae45fff1-f557-45f1-981e-92b4ad9f1556';

WebBrowser.maybeCompleteAuthSession();

export default function OfficeSignIn() {
  const [discovery, $discovery]: any = useState({});
  const [authRequest, $authRequest]: any = useState({});
  const [authorizeResult, $authorizeResult]: any = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = useRouter();
  const scopes = ['openid', 'profile', 'email', 'offline_access'];
  const domain = `https://login.microsoftonline.com/${tenantID}/v2.0`;
  const redirectUrl = AuthSession.makeRedirectUri(__DEV__ ? { scheme: 'myapp' } : {});

  useEffect(() => {
    const getSession = async () => {
      const d = await AuthSession.fetchDiscoveryAsync(domain);

      const authRequestOptions: AuthSession.AuthRequestConfig = {
        prompt: AuthSession.Prompt.SelectAccount,
        responseType: AuthSession.ResponseType.Code,
        scopes: scopes,
        usePKCE: true,
        clientId: clientID,
        redirectUri: __DEV__ ? redirectUrl : redirectUrl + 'example',
      };
      const authRequest = new AuthSession.AuthRequest(authRequestOptions);
      $authRequest(authRequest);
      $discovery(d);
    };
    getSession();
    checkSignInStatus();
  }, []);

  useEffect(() => {
    const getCodeExchange = async () => {
      try {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            code: authorizeResult.params.code,
            clientId: clientID,
            redirectUri: __DEV__ ? redirectUrl : redirectUrl + 'example',
            extraParams: {
              code_verifier: authRequest.codeVerifier || '',
            },
          },
          discovery
        );

        const { accessToken, idToken } = tokenResult;

        const decodedToken: any = jwtDecode(idToken || accessToken);
        const userName = decodedToken.name;
        const userEmail = decodedToken.preferred_username;

        console.log('Decoded Token:', decodedToken);

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userEmail', userEmail);
        await AsyncStorage.setItem('userName', userName);

        setIsSignedIn(true);
      } catch (error) {
        console.error('Error during token exchange:', error);
      }
    };

    if (authorizeResult && authorizeResult.type === 'success' && authRequest && authRequest.codeVerifier) {
      getCodeExchange();
    }
  }, [authorizeResult, authRequest]);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/tabs/home');
    }
  }, [isSignedIn]);

  const handleSignIn = async () => {
    const result = await authRequest.promptAsync(discovery);
    $authorizeResult(result);
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userName');
    setIsSignedIn(false);
  };

  const checkSignInStatus = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    setIsSignedIn(!!token);
  };

  useFocusEffect(
    React.useCallback(() => {
      checkSignInStatus();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Admin security system</Text>
      {authRequest && discovery ? (
        isSignedIn ? (
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <Text style={styles.buttonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSignIn}>
            <TouchableOpacity style={styles.microsoftButton} onPress={handleSignIn}>
              <Image
                source={require('../assets/images/logo.png')}
                style={styles.microsoftLogo}
              />
              <Text style={styles.microsoftText}>Iniciar sesión con Microsoft</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F4FF', // Fondo azul claro del Home
  },
  logo: {
    width: 100, // Tamaño destacado para el logo
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24, // Tamaño similar al título del Home
    fontWeight: '700',
    marginBottom: 20,
    color: '#2C3E50', // Azul oscuro usado en el Home
    textAlign: 'center',
  },
  signOutButton: {
    width: '100%',
    height: 48, // Botón grande
    backgroundColor: '#6FCF97', // Verde usado en "Personas detectadas"
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF', // Texto blanco para contraste
    fontSize: 16,
    fontWeight: '600',
  },
  microsoftButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2994A', // Naranja como en "Proximidad detectada"
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  microsoftLogo: {
    width: 24, // Tamaño más grande para mayor visibilidad
    height: 24,
    marginRight: 12,
  },
  microsoftText: {
    color: '#FFFFFF', // Texto blanco
    fontSize: 16,
    fontWeight: '600',
  },
});
