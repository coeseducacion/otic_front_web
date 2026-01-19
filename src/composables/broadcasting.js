import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configurar Pusher como global para Laravel Echo
window.Pusher = Pusher;

// Obtener variables de entorno (Vite usa import.meta.env)
const getEnvVar = (key, defaultValue = '') => {
    return import.meta.env[key] || defaultValue;
};

// Configuración de Reverb desde variables de entorno
const reverbConfig = {
    broadcaster: 'reverb',
    key: getEnvVar('VITE_REVERB_APP_KEY', 'somekey'),
    wsHost: getEnvVar('VITE_REVERB_HOST', 'localhost'),
    wsPort: getEnvVar('VITE_REVERB_PORT', '8080'),
    wssPort: getEnvVar('VITE_REVERB_PORT', '8080'),
    forceTLS: (getEnvVar('VITE_REVERB_SCHEME', 'http') === 'https'),
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
};

// Log de configuración para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
    console.log('🔧 Configuración de Echo:', {
        broadcaster: reverbConfig.broadcaster,
        host: reverbConfig.wsHost,
        port: reverbConfig.wsPort,
        scheme: getEnvVar('VITE_REVERB_SCHEME', 'http'),
        key: reverbConfig.key.substring(0, 10) + '...',
    });
}

// Configurar Laravel Echo para Reverb
window.Echo = new Echo(reverbConfig);

// Opción alternativa: Usar Pusher (comentar lo anterior y descomentar esto)
/*
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: getEnvVar('VITE_PUSHER_APP_KEY'),
    cluster: getEnvVar('VITE_PUSHER_APP_CLUSTER', 'mt1'),
    forceTLS: true,
    encrypted: true,
});
*/

export default window.Echo;
