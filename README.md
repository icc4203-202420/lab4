# Laboratorio 4: Autenticación con JSON Web Token (JWT) y Formularios

En este laboratorio continuaremos desarrollando la aplicación de clima agregando autenticación de usuarios con token JWT, y usando de formularios con Formik y Yup como hemos visto en clases. La aplicación utiliza la API de OpenWeather para acceder a información climática.

Ahora nuestra aplicación se compone por el frontend que ya conocemos (ahora bajo el directorio `/frontend`), desarrollado con React y Vite, a lo cual hemos agregado un backend desarrollado con Sinatra (en el directorio `/backend`). Sinatra una biblioteca para ruby que permite desarrollar aplicaciones web o APIs ligeras. El backend desarrollado con Sinatra lo utilizamos para implementar una API simple que permite a los usuarios del frontend autenticarse para obtener un token JWT, y luego llamar servicios que permiten recuperar y actualizar la lista de ubicaciones favoritas para consultar la información de clima.

## Pasos iniciales (OJO: Se debe actualizar .env)

Si ya cuentas con el archivo `/frontend/.env` que hemos utilizado en laboratorios pasados, entonces, debes añadir una variable de entorno que permita a la aplicación de frontend saber a qué backend conectarse.

```sh
VITE_BACKEND_URL="http://localhost:4567"
```

Esto es en general una práctica común en desarrollo. Recuerda que `yarn build` en el proyecto del frontend compilará todo el código del frontend y sustituirá todas las ocurrencias de la variable `VITE_BACKEND_URL` por su valor literal, `http://localhost:4567`. Por lo tanto, es sumamente importante que la dirección del backend nunca la "hardcodees". Es decir, jamás escribir `http://localhost:4567` en el código Javascript, usa en vez de eso una variable de entorno como `VITE_BACKEND_URL`. Así, la URL de backend puede ser incorporada al código de producción del frontend en tiempo flexible durante la compilación.

Luego, si no has configurado la API key de OpenWeatherMap, puedes hacerlo también ahora. Para obtener una API key y agregarla, te recordamos los pasos. Primero, debes obtener la API key de OpenWeatherMap. Puedes usar para esto tu correo personal o institucional. Luego, ingresando al portal de OpenWeather, puedes pinchar en el menú en donde aparece tu login arriba a la derecha en la _top bar_ del sitio, y allí acceder a la opción "My API keys". Ingresando allí, verás la API Key que OpenWeather ha creado automáticamente para tu uso gratuito (máximo 1000 consultas diarias).

Actualiza el archivo `.env` en el directorio `/frontend` de este repositorio para contener las líneas de configuración siguientes:

```sh
VITE_BACKEND_URL="http://localhost:4567"
VITE_OPENWEATHER_API_KEY=#[copia y pega aquí la API Key y elimina los corchetes y el caracter gato]
```

Luego, puedes ejecutar:

```sh
yarn install
```

Esto instalará todos los paquetes o módulos especificados en el archivo `package.json` que requiere la aplicación. Preferimos utilizar Yarn para gestión de módulos y dependencias de Javascript.

Con esto, la aplicación estará lista para ejecutar:

```sh
yarn dev
```

El comando anterior ejecuta la aplicación en modo de desarrollo. Puedes abrir el navegador web en [http://localhost:5173/](http://localhost:5173/) para ver el funcionamiento.

Finalmente, puedes iniciar la aplicación del backend. Para esto, debes ir al directorio `/backend`, y allí ejecutar:

```sh
bundle exec ruby app.rb
```

## Marco Teórico: Autenticación con Token JWT y medidas de seguridad

Hemos visto que las aplicaciones web móviles con arquitectura SPA se integran con uno o más sistemas de backend desde donde consumen servicios (APIs), en nuestro caso, de tipo REST/JSON. Es común la necesidad de autenticar usuarios en nuestras aplicaciones para brindarles funciones privadas y personalizadas. Para esto, debemos permitir que la aplicación frontend requiera autorización para utilizar las APIs del backend. La autorización se logra a través del proceso de autenticación, por ejemplo, mediante un nombre de usuario y una contraseña. Cuando el usuario se autentica correctamente desde la aplicación frontend, esta aplicación puede luego crear, modificar, leer y eliminar recursos cuyo acceso es protegido por el sistema de backend.

Las APIs de tipo REST/JSON se caracterizan por operar sin mantener estado de sesión en el servidor. Se basan directamente en el funcionamiento del protocolo HTTP, el cual no mantiene estado por sí mismo. Esto significa que cada petición a un endpoint de una API REST/JSON debe contener toda la información necesaria para ser procesada. Si se introducen cookies para manejar información de estado, se estaría violando este principio de diseño.

Un método común de autenticación (aunque no el único) para consumir APIs REST/JSON desde nuestras aplicaciones frontend es el uso de JSON Web Tokens (JWTs). Vimos en clases el formato de un token JWT: contiene una cabecera, una carga útil (payload) y una firma. La carga útil incluye el campo `sub` (subject) que contiene un identificador de usuario válido en el backend, y un campo `exp` (timestamp de expiración). Cuando el usuario se autentica exitosamente con la API, por ejemplo, utilizando nombre de usuario y contraseña, el servidor entrega al frontend un token JWT, que luego se envía en cada petición HTTP a la API en una cabecera (header) llamada `Authorization` con el valor `Bearer [Token JWT]`. El frontend comúnmente almacena el token JWT en `localStorage` o `sessionStorage`.

Cuando el frontend almacena el token JWT en localStorage, es una buena práctica validarlo contra el backend en cada uso, ya que, al estar en `localStorage`, cualquier otro código JavaScript que se ejecute en el navegador web podría modificar o sobreescribir el token accidentalmente o con malas intenciones.

Es importante notar que usar tokens JWT requiere varias medidas de seguridad. Al menos las siguientes se deben tener en consideración:

* Configurar correctamente [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) en la aplicación de backend, de manera que sólo se permitan peticiones desde código de frontend cargado desde orígenes conocidos y permitidos.
* Sin embargo, anterior no previene que puedan ocurrir ataques de Cross-Site Scripting XSS. En estos ataques, el adversario inyecta un código malicioso que se ejecuta en el frontend legítimo. Por ejemplo, si nuestra aplicación de frontend implementa algo como un hilo de comentarios escritos por los usuarios, o un foro, un atacante podría dejar sembrado un código invisible en mensajes del foro, capaz de acceder al token JWT y utilizarlo para realizar peticiones al backend que el usuario no consiente.
* React es robusto para prevenir lo anterior. Todos los inputs de formularios son debidamente escapados y sanitizados para evitar la inyección de código malicioso en las vistas. Existen, sin embargo, malos usos de React que podrían dar origen a vulnerabilidades. Por ejemplo, existe una función en React llamada `dangerouslySetInnerHTML`, la cual permite modificar el estado de elementos HTML, y evitar la sanitización de valores que hace React. Si se está usando dicha función para actualizar elementos, entonces, un atacante podría llegar a utilizarla para inyectar código malicioso en la aplicación de frontend, capaz de recuperar el token JWT y utilizarlo indebidamente contra el backend.

Finalmente, cuando el usuario requiere hacer logout/sign-out, una opción es que el frontend elimine (olvide) el token JWT. De esta manera, cuando el usuario vuelve a acceder a la aplicación, al no encontrar el token en `localStorage` o `sessionStorage`, se redirige al usuario al formulario de login para obtener un nuevo token JWT.

Sin embargo, este enfoque permite que un token JWT válido y no expirado pueda ser robado por un tercero, mediante ingeniería social u otras técnicas, y luego ser utilizado por el atacante para suplantar al usuario legítimo en la aplicación. Por esto, es recomendable implementar listas de revocación de tokens JWT en la aplicación backend. Es decir, cuando se realiza una operación de logout/sign-out, el frontend elimina el token, y el backend lo añade a una lista de tokens revocados, invalidando su uso posterior. Los tokens expirados pueden ser eliminados automáticamente de la lista de revocación.

**Biblioteca react-router-dom y hook useNavigate**

`react-router-dom` es una biblioteca de enrutamiento para aplicaciones React que permite la navegación entre diferentes vistas o componentes de una Single Page Application (SPA). En lugar de recargar toda la página, `react-router-dom` permite cambiar el contenido visualizado en función de la URL, manteniendo la experiencia del usuario fluida y dinámica.

Componentes Clave de react-router-dom: 

1. `BrowserRouter`: Envuelve toda la aplicación (ver `main.jsx`) y permite que funcione el enrutamiento basado en la URL del navegador. Utiliza la API de la historia (History API) del navegador para mantener las URLs limpias (sin el # que se ve en otros tipos de enrutadores como `HashRouter`).

Es común ver aplicaciones que utilizan `BrowserRouter` en la raíz de su componente principal para habilitar el enrutamiento en toda la aplicación.

2. `Routes` y `Route`:

`Routes`: Es un contenedor que agrupa diferentes rutas definidas en la aplicación(ver `App.jsx`).
`Route`: Define una ruta específica en la aplicación. Cada Route tiene un path que corresponde a la URL y un element que es el componente que se renderiza cuando la URL coincide con el path.

3. `Link` y `NavLink`:

`Link`: Es un componente que reemplaza a la etiqueta `<a>` estándar de HTML para navegar entre diferentes rutas dentro de la aplicación sin recargar la página.
`NavLink`: Similar a `Link`, pero con la capacidad de aplicar estilos o clases CSS adicionales cuando el enlace está activo, es decir, cuando la URL coincide con el path del `NavLink`.

Finalmente, el hook `useNavigate` es proporcionado por `react-router-dom` que permite programáticamente cambiar la URL y navegar a diferentes rutas dentro de la aplicación sin necesidad de utilizar enlaces (`Link` o `NavLink`). Es especialmente útil para realizar redirecciones después de ciertas acciones, como el envío de un formulario, o al manejar ciertas condiciones lógicas.

**Construcción de formularios con Formik y Yup**

Hemos visto en clases que construir componentes para implementar formularios en React puede ser bastante tedioso, engorroso e incluso, requerir bastante programación procedural para implementar funcionalidad de validación. Es muy importante tener presente que cuando el frontend envía datos de formulario al backend, es fundamental que el frontend realice validación primero. Esto tiene por lo menos dos efectos positivos; en primer lugar, se da validación instantánea al usuario, y en segundo lugar, se evita enviar al backend peticiones inútiles con datos erróneos. Luego, cuando los datos llegan al backend, es también fundamental que el backend haga validación de los parámetros, e incluso sanitice los parámetros que llegan para evitar ataques como los de inyección de código SQL, _Cross-Site Scripting_, etc.

Dado que el proceso de validación de un formulario en el frontend tiene generalmente siempre los requisitos funcionales, por ejemplo, se debe validar un campo si el usuario se mueve a llenar otro campo, se deben validar todos los campos previo al envío, y finalmente, se deben desplegar en forma consistente los errores, por ejemplo, con mensajes debajo de los elementos de formulario, es claro que toda esta funcionalidad puede ser implementada sin tener que "reinventar la rueda cada vez".

Para desarrollar nuestros formularios con aplicaciones React, es recomendable el uso de los módulos Formik y Yup.

Formik es una biblioteca que simplifica la creación y manejo de formularios en React. Proporciona un conjunto de herramientas y componentes que ayudan a gestionar el estado del formulario, manejar el envío (_submission_) y gestionar la validación. Las principales características de Formik son:

Gestión del estado del formulario: Formik controla automáticamente el estado de los valores de los campos del formulario, errores de validación, y si el formulario ha sido tocado o no. Puedes acceder y manipular el estado del formulario a través de los _props_ proporcionados por Formik.

Manejo del envío del formulario: Formik facilita la ejecución de una función de envío cuando el formulario es enviado. También maneja el estado de envío, permitiendo mostrar indicadores de carga u otras interacciones mientras se procesa el envío.

Compatibilidad con validación de formularios: Formik puede integrar validaciones utilizando funciones de validación manuales o a través de esquemas de validación, como los que proporciona Yup.

Componentes principales de Formik:

- `<Formik>`: Componente que envuelve todo el formulario y gestiona su estado.
- `<Form>`: Componente que envuelve los campos del formulario y se conecta automáticamente con Formik.
- `<Field>`: Componente que conecta automáticamente un campo de entrada con el estado de Formik.
- `<ErrorMessage>`: Componente para mostrar mensajes de error asociados a un campo específico.

Yup es una biblioteca de validación de esquemas que se usa con frecuencia junto con Formik para definir reglas de validación claras y reutilizables para formularios. Las características principales de Yup son las siguientes:

Definición de esquemas de validación: Yup permite definir esquemas de validación detallados, como tipos de datos (string, number, etc.), validaciones de campo (email, required, etc.), y relaciones entre campos (por ejemplo, un campo debe coincidir con otro).

Validación declarativa: En lugar de escribir funciones de validación personalizadas, con Yup puedes declarar las reglas de validación de manera concisa y reutilizable.

Integración con Formik: Yup se integra fácilmente con Formik para realizar validaciones basadas en esquemas. Formik usará automáticamente el esquema Yup para validar los valores del formulario antes de enviar los datos.

El siguiente código ejemplifica cómo Formik y Yup pueden usarse conjuntamente para construcción y validación de formularios:

```es6
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Required'),
  password: Yup.string().min(6, 'Password too short').required('Required'),
});

function MyForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log('Form data', values);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <label htmlFor="email">Email:</label>
          <Field id="email" name="email" type="email" />
          <ErrorMessage name="email" component="div" />

          <label htmlFor="password">Password:</label>
          <Field id="password" name="password" type="password" />
          <ErrorMessage name="password" component="div" />

          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default MyForm;
```

Debe tenerse presente que es enteramente posible utilizar componentes de MUI para construir el formulario, integrando Formik y Yup. Esto lo hemos visto en los ejemplos de la clase anterior a este laboratorio.

Para mayores detalles sobre cómo usar Formik y Yup, recomendamos revisar la documentación correspondiente a cada uno:

* API reference de Formik: [https://formik.org/docs/api/formik](https://formik.org/docs/api/formik)
* Yup: documentación en página README de GitHub: [https://github.com/jquense/yup?tab=readme-ov-file](https://github.com/jquense/yup?tab=readme-ov-file)

## Descripción de la Aplicación React

Nuestra aplicación React en su tercera iteración ha crecido en funcionalidad. Ahora permite contar con cuentas de usuario, aunque ficticias, con finalidad de demostrar un formulario de login, y el manejo de token JWT. Al contar con un backend, las lista de ubicaciones favoritas de los usuarios para la información de clima puede quedar "persistida" allí. Veremos en este laboratorio que el backend es muy simple y no usa una base de datos, de hecho, mantiene los datos en memoria y estos se reestablecen a sus valores originales cada vez que el backend se reinicia. Sin embargo, es posible verificar dos aspectos interesantes respecto al frontend:

* La aplicación de frontend puede continuar funcionando en el browser si el backend se cierra, debido a que la información de ubicaciones favoritas del usuario actual se mantiene en local storage, y además, la información de clima es provista por un serivicio diferente (OpenWeatherMap). 
* Una aplicación de frontend puede acceder a APIs de distintos proveedores, e incluso APIs alojadas en distintos sistemas de backend.

### Componentes de la Aplicación

**Index**

La página de carga de la aplicación SPA desarrollada con React es `index.html`. En este archivo se declara un elemento raíz de tipo `div` con `id` con valor `root`, y se carga el archivo `main.jsx`. Este último archivo instancia el componente principal de la aplicación llamado `App` (ver `App.jsx`):

```es6
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; // Asegúrate de importar el tema

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
        </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

No hay cambios en esta parte de la aplicación desde el laboratorio anterior.

**Theme de MUI**

Existe un _theme_ de MUI (Material UI) configurado para la aplicación que se encuentra descrito en `src/theme.js`. Es posible variar la tipografía Roboto utilizada en la aplicación, el esquema de colores, y en general alterar todas las propiedades personalizables de los componentes de MUI.

El componente `ThemeProvider` decora `App` con el _theme_ cargado en el propio archivo `main.jsx`.

Los estilos de MUI no han sido modificados desde el laboratorio anterior.

**BrowserRouter**

Esta aplicación siempre ha usado el componente `BrowserRouter`, provisto por React, sobre el cual hemos provisto algo más de detalles en el marco teórico. Permite que la aplicación de frontend pueda tener sus propios enlaces (hipervínculos) locales, y procesar los paths que hay en la barra de direcciones del navegador interpretándolos en el contexto local del frontend. Los enlaces permiten acceder a distintos componentes de la aplicación que quedan instanciados por el componente `App`.

**React.StrictMode**

Finalmente `React.StrictMode` permite comunicar advertencias o errores al desarrollador respecto a prácticas erróneas en el desarrollo de la aplicación, asociadas a potenciales problemas de calidad.

**Componente App**

El archivo `App.jsx` declara el componente principal de la aplicación `App`, junto con componentes que se instancian cuando se está en la ruta raíz `/` (`Home`) y en la ruta `/search` (`Search`). 

El componente `App` maneja varias variables de estado con el hook de _state_. La variable `drawerOpen` permite alternar la vista del menú de navegación, haciendo click en el botón que se encuentra en la barra superior (ver `AppBar` y uso de la variable de estado `toggleDrawer`).

La variable `isAuthenticated` determina si el usuario se ha autenticado con el backend. La variable `username` contiene el nombre del usuario autenticado (o string vacío). La variable `loading` se utiliza para la carga inicial del componente, y para controlar la inicialización de la lista de ubicaciones favoritas. 

Existe un efecto configurado que rastrea cambios a `favorites`, `isAuthenticated`, `token` y `loading`. El propósito de este efecto es actualizar la lista de favoritos en el backend cuando ésta cambia localmente, es decir, realiza sincronización automática de la lista cuando hay cambios.

El menú de navegación está construido con un componente tipo `List` de React que permite que los ítemes queden enlazados a otros componentes; `Home` y `Search`. Se ha añadido despliegue condicional de enlaces de inicio y cierre de sesión al sidebar, jjunto con el nombre del usuario que se encuentra autenticado.

En las líneas finales de `App.jsx` se encuentra el componente `Routes` que en forma análoga a `routes.rb` en el backend de la aplicación Rails, define una lista de rutas que son válidas para la aplicación que se ejecuta en el _frontend_.

**Componente LoginForm**

Este es un nuevo componente en la aplicación que permite al usuario autenticarse con nombre de usuario (email) y contraseña. Hay dos cuentas de usuario creadas en el backend: 

* user1@miuandes.cl, password1
* user2@miuandes.cl, password2

Es posible ver que el componente define un esquema de validación con Yup para los campos de email y password.

Además, es posible ver que el componente usa el hook `useNavigate` de `react-router-dom` para cambiar el componente activo de la aplicación cuando ocurre una autenticación exitosa.

El componente `LoginForm` define un hook de axios, mediante el cual envía los campos del formulario al backend. Los campos van al backend en formato `application/x-www-form-urlencoded` en este caso. Este es el [formato "tradicional"](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) en que los browsers codifican los datos que provienen de un formulario HTML para enviarlos al servidor. Los datos, sin embargo, podrían ir serializados al backend como un objeto en formato JSON.

Cuando la autenticación es exitosa, la función `handleSubmit` llama a `tokenHandler`, handler que es implementado en el componente `App`, pues el diseño es tal que solamente el componente `App` modifica el estado del token JWT en local storage.

Finalmente, es posible ver que el formulario de login utiliza componentes de material UI, y aparece anidado con Formik. Formik usa el esquema de validación definido al inicio del archivo `Login.jsx`:

```es6
const validationSchema = Yup.object({
  email: Yup.string().email('Email no válido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
```

**Componente Home**

El componente `Home` no ha cambiado desde el laboratorio anterior. Incluye algunos componentes de MUI, como el de [`Card`](https://mui.com/material-ui/react-card/) y `CardContent`. Sin embargo, el propósito de `Card` es proveer un área en la cual instanciar el componente `Weather` que realiza las acciones relevantes en nuestra aplicación.

**Componente Weather**

Este componente también se ha mantenido sin cambios desde el laboratorio anterior. Recordemos que hay dos hooks de React relevantes que son instanciados:

* `state` (variable `weather`): Esta variable contiene el objeto actual de clima cargado mediante la API de OpenWeather.
* `effect`: Este hook que no recibe ningún objeto para vigilar en su arreglo de argumentos, y ejecuta _automáticamente y una sola vez cuando se termina de renderizar_ el componente `Weather`. La función asíncrona que ejecuta el hook es `fetchWeather`. Podemos ver en ella las llamadas a la API remota y el procesamiento de resultados.

## Descripción de la Aplicación de Backend

La aplicación de backend se encuentra desarrollada con Sinatra. El código principal de esta aplicación se encuentra en `backend/app.rb`.

**Procesamiento del contenido de peticiones**

El código en este archivo configura varios aspectos de la aplicación previo al código de los _endpoints_ de API. En primer lugar, se realiza un pre-procesamiento del contenido del request, de manera que si hay datos que vienen en JSON, se incorporan a la estructura `params` (similar a la utilizada en Rails) que permite mantener todos los parámetros que llegan desde la petición (_request_).

**Configuración de CORS**

Luego, se configura CORS para permitir llamadas a la API desde la aplicación de frontend que estamos usando, y tener la posibilidad de bloquear o excluir llamadas a la API desde aplicaciones servidas desde orígenes no permitidos. Esto está en dos partes:

```ruby
  configure do
    enable :cross_origin
  end
```

Lo anterior activa CORS en Sinatra. Luego tenemos:

```ruby
  options '*' do
    response.headers['Allow'] = 'HEAD,GET,POST,PUT,PATCH,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'HEAD,GET,POST,PUT,PATCH,DELETE,OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    200
  end
```

Este código permite responder a peticiones de tipo `OPTIONS` de HTTP. El mensaje `OPTIONS` en HTTP sirve para que un cliente pueda conocer las capacidades del servidor, como los métodos HTTP que admite para un recurso específico, y también es usado en el contexto de CORS (Cross-Origin Resource Sharing) para gestionar las solicitudes de origen cruzado. Un cliente puede enviar una solicitud `OPTIONS` a un servidor para averiguar qué métodos HTTP (como `GET`, `POST`, `PUT`, `DELETE`, etc.) están permitidos para un recurso en particular antes de intentar realizar una acción.

En CORS, un navegador envía una solicitud `OPTIONS` antes de realizar una solicitud HTTP real cuando una solicitud es considerada "compleja" (por ejemplo, cuando se usan métodos como `PUT` o `DELETE`, o se envían ciertos encabezados personalizados). Esta solicitud de verificación previa se llama "_preflight_" y se utiliza para verificar que el servidor permitirá la solicitud real.

En nuestro caso, el procesamiento de `OPTIONS` en Sinatra está configurado con comodín (`*`), por lo tanto, la configuración aplica a todas las rutas de la aplicación. Hay en el código que genera respuestas a `OPTIONS` las siguientes cabeceras:

- `Allow`: Es utilizada para informar a los clientes sobre los métodos HTTP permitidos para el recurso solicitado. Aquí, se especifica que los métodos permitidos son `HEAD`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE` y `OPTIONS`.
- `Access-Control-Allow-Origin`: Especifica qué orígenes están permitidos para realizar solicitudes. El valor '*' permite solicitudes desde cualquier origen, lo cual es útil en escenarios de CORS cuando se desea permitir acceso desde cualquier dominio.
- `Access-Control-Allow-Methods`: Especifica los métodos HTTP permitidos en las solicitudes del lado del cliente. Aquí se lista una serie de métodos que el servidor acepta, en línea con lo que se especifica en el encabezado Allow.
- `Access-Control-Allow-Headers`: Indica qué encabezados HTTP pueden ser utilizados durante la solicitud real que sigue a la solicitud OPTIONS. En este caso, se permite Authorization, Content-Type y Accept.
- Código de estado 200: Finalmente, la respuesta a la solicitud `OPTIONS` se devuelve con un estado 200 OK, indicando que la solicitud fue exitosa.

**Helpers**

El backend implementa unas funciones de ayuda (`helpers`) que permiten codificar y decodificar los tokens JWT, permiten autorizar usuarios (`authorized_user`), verificar si los usuarios están autorizados (`authorized?`), y controlar el acceso de usuarios a endpoints (`protected`).

**Endpoints del backend**

Los endpoints que el backend implementa sirven para incorporar nuestras funciones de inicio y cierre de sesión desde el frontend, así como también para obtener y actualizar la lista de ubicaciones favoritas para consultar la información climática:

- `POST /login`: Endpoint que realiza el proceso de autenticación y generación de token JWT.
- `PUT /favorites` y `POST /favorites`: Permiten actualizar y crear la lista de favoritos.
- `GET /favorites` devuelve la lista de favoritos del usuario autorizado.
- `GET /verify_token` permite determinar si el usuario está debidamente autorizado (si el token JWT es válido).

**Datos en el backend**

Como habrás podido ver, el backend no opera con una base de datos real. Más bien, mantiene los datos de cuentas de usuario en memoria. Esto quiere decir que si el servidor se reinicia, los cambios a los datos originales se pierden.

```es6
  USERS = {
    "user1@miuandes.cl" => {
      name: "Juan",
      password: "password1",
      favorites: ['Talca', 'Arica', 'Calama']
    },
    "user2@miuandes.cl" => {
      name: "Pedro",
      password: "password2",
      favorites: ['Temuco', 'Valdivia', 'Coyhaique']
    }
  }
```

## Experimenta con el código

1. Modifica `LoginForm` para mejorar el manejo de errores. Puedes inspirarte en el ejemplo que vimos en la clase, en donde usábamos componentes de tipo `<ErrorMessage>` de Formik. Con esto podrás simplificar considerablemente el código del formulario, sin tener que poner atributos `error` y `helperText` en los componentes de tipo `<Field>`. Ejemplo:

```es6
  <Field
    as={TextField}
    name="email"
    type="email"
    label="Email"
    fullWidth
    margin="normal"
    variant="outlined"
  />
  <ErrorMessage name="email" component="div" style={{ color: 'red' }} />
```
2. Implementa un componente `RegistrationForm` que permita crear una nueva cuenta de usuario e iniciar sesión con ella. Para esto, tendrás que agregar un endpoint al backend, e integrar `RegistrationForm` con `App`. Recuerda que `App` es dueña de los tokens JWT, por lo tanto, `App` tiene que pasar a `RegistrationForm` un handler vía `props`, similar a lo que ocurre con `LoginForm`.
3. En el formulario implementado por `RegistrationForm`, asegúrate de pedir la contraseña junto con la confirmación de la misma, y verificar que los campos sean iguales. Investiga cómo hacer esto con Yup y Formik.

## Anexo: Lo básico de Vite

Usamos Vite (https://vitejs.dev/) como andamiaje para crear nuestra aplicación utilizando React 18. Vite provee una serie de herramientas, por ejemplo, generadores parecidos a los que tiene una aplicación Rails, que permiten crear una aplicación de frontend a partir de cero, y preparar una aplicación para producción.

Si abres el archivo `package.json` verás que hay un objeto con clave `"scripts"` declarado. Este objeto define varias tareas posibles de realizar utilizando Vite, invocándolas con Yarn según nuestras preferencias de ambiente de desarrollo.

Los scripts relevantes son:

* `dev`: Permite levantar la aplicación en modo desarrollo como hemos visto arriba.
* `build`: Prepara la aplicación para ponerla en ambiente de producción.
* `lint`: Ejecuta linters para validar que el código cumpla estándares de codificación, y normas de calidad.
* `preview`: Permite previsualizar la aplicación después que ha sido construida con `build`.

