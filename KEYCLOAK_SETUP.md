# Configuración Keycloak para Sidenagerd (backoffice)

## 1. Crear el cliente en el backoffice de Keycloak

En **Keycloak Admin Console** (`http://localhost:8081`):

1. Realm: **master** (o el realm que uses).
2. **Clients** → **Create client**.
3. Configuración:
   - **Client type:** OpenID Connect
   - **Client ID:** `sidenagerd-web`
   - **Name:** (opcional) Sidenagerd Web
   - **Next**

4. **Capability config:**
   - **Client authentication:** OFF (cliente público)
   - **Authorization:** OFF
   - **Authentication flow:**
     - ✅ Standard flow
     - ✅ Direct access grants (opcional)
   - **Next**

5. **Login settings:**
   - **Root URL:** `http://localhost:5173` (o la URL de tu app en producción)
   - **Home URL:** (opcional) `http://localhost:5173`
   - **Valid redirect URIs:**
     - `http://localhost:5173/callback`
     - `http://localhost:5173/*`
   - **Valid post logout redirect URIs:** `http://localhost:5173`
   - **Web origins (obligatorio para evitar CORS):** pon **exactamente** `http://localhost:5173` (o `+` para permitir los mismos que Valid redirect URIs). Sin esto, el navegador bloqueará la petición al token endpoint.
   - **Save**

## 2. Callback (redirect URI)

La app espera que Keycloak redirija al usuario a:

- **Desarrollo (Vite):** `http://localhost:5173/callback`
- **Producción:** `https://tu-dominio.com/callback`

Esa ruta debe estar incluida en **Valid redirect URIs** del cliente.

## 3. Variables de entorno (.env)

```env
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=master
VITE_KEYCLOAK_CLIENT_ID=sidenagerd-web
```

En producción, usa la URL real de Keycloak (ej. `https://keycloak-otic.ejemplo.gob.pe`).

## 4. CORS: "No 'Access-Control-Allow-Origin' header"

Si al hacer login con Keycloak ves en consola:

```
Access to fetch at 'http://localhost:8081/realms/master/protocol/openid-connect/token' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa:** Keycloak no está enviando el header CORS para tu origen porque el cliente no tiene **Web origins** bien configurado.

**Solución:**

1. Keycloak Admin → **Clients** → **sidenagerd-web**
2. Pestaña **Settings** (o la sección de login settings)
3. En **Web origins** debe aparecer **exactamente** el origen de tu app:
   - Desarrollo: `http://localhost:5173`  
   - O el valor `+` (permite los mismos orígenes que Valid redirect URIs)
4. **Save**
5. Prueba de nuevo el login; no hace falta reiniciar Keycloak.

Si usas Keycloak en Docker, asegúrate de que el cliente se creó en el realm correcto y que Web origins está guardado (a veces la UI no muestra el valor hasta recargar).

## 5. Resumen

| Concepto        | Valor                          |
|-----------------|---------------------------------|
| Client ID       | `sidenagerd-web`                |
| Callback / Redirect URI | `http://localhost:5173/callback` |
| Web origins     | `http://localhost:5173` o `+` **(necesario para CORS)** |
| Client type     | public (sin client secret)       |
