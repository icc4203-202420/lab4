# Laboratorio 4: Autenticación con JSON Web Token (JWT) y Formularios

En este laboratorio continuaremos desarrollando la aplicación de clima agregando autenticación de usuarios con token JWT, y usando de formularios con Formik y Yup como hemos visto en clases. La aplicación utiliza la API de OpenWeather para acceder a información climática.

## Pasos iniciales

Para este laboratorio debes contar con una cuenta en OpenWeather, a través del portal openweathermap.org. Puedes usar para esto tu correo personal o institucional. Luego, ingresando al portal de OpenWeather, puedes pinchar en el menú en donde aparece tu login arriba a la derecha en la _top bar_ del sitio, y allí acceder a la opción "My API keys". Ingresando allí, verás la API Key que OpenWeather ha creado automáticamente para tu uso gratuito (máximo 1000 consultas diarias).

A continuación, crea un archivo llamado `.env` en el directorio raíz de este repositorio. En dicho archivo ingresa el siguiente texto:

```sh
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

**Formik** es una biblioteca que simplifica la creación y manejo de formularios en React. Proporciona un conjunto de herramientas y componentes que ayudan a gestionar el estado del formulario, manejar el envío (_submission_) y gestionar la validación. Las principales características de Formik son:

Gestión del estado del formulario: Formik controla automáticamente el estado de los valores de los campos del formulario, errores de validación, y si el formulario ha sido tocado o no. Puedes acceder y manipular el estado del formulario a través de los _props_ proporcionados por Formik.

Manejo del envío del formulario: Formik facilita la ejecución de una función de envío cuando el formulario es enviado. También maneja el estado de envío, permitiendo mostrar indicadores de carga u otras interacciones mientras se procesa el envío.

Compatibilidad con validación de formularios: Formik puede integrar validaciones utilizando funciones de validación manuales o a través de esquemas de validación, como los que proporciona Yup.

Componentes principales de Formik:

- `<Formik>`: Componente que envuelve todo el formulario y gestiona su estado.
- `<Form>`: Componente que envuelve los campos del formulario y se conecta automáticamente con Formik.
- `<Field>`: Componente que conecta automáticamente un campo de entrada con el estado de Formik.
- `<ErrorMessage>`: Componente para mostrar mensajes de error asociados a un campo específico.

**Yup**  

Yup es una biblioteca de validación de esquemas que se usa a menudo junto con Formik para definir reglas de validación claras y reutilizables para formularios. Las características principales de Yup son las siguientes:

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

**Theme de MUI**

Existe un _theme_ de MUI (Material UI) configurado para la aplicación que se encuentra descrito en `src/theme.js`. Es posible variar la tipografía Roboto utilizada en la aplicación, el esquema de colores, y en general alterar todas las propiedades personalizables de los componentes de MUI.

El componente `ThemeProvider` decora `App` con el _theme_ cargado en el propio archivo `main.jsx`.

**BrowserRouter**

Luego, hay un componente `BrowserRouter`, provisto por React, que permite que la aplicación de frontend pueda tener sus propios enlaces (hipervínculos) locales, y procesar los paths que hay en la barra de direcciones del navegador interpretándolos en el contexto local del frontend. Los enlaces permiten acceder a distintos componentes de la aplicación que quedan instanciados por el componente `App`. 

**React.StrictMode**

Finalmente `React.StrictMode` permite comunicar advertencias o errores al desarrollador respecto a prácticas erróneas en el desarrollo de la aplicación, asociadas a potenciales problemas de calidad.

**Componente App**

El archivo `App.jsx` declara el componente principal de la aplicación `App`, junto con componentes que se instancian cuando se está en la ruta raíz `/` (`Home`) y en la ruta `/search` (`Search`). 

El componente `App` maneja una única variable de estado con el hook de _state_, que permite alternar la vista del menú de navegación, haciendo click en el botón que se encuentra en la barra superior (ver `AppBar` y uso de la variable de estado `toggleDrawer`).

El menú de navegación está construido con un componente tipo `List` de React que permite que los ítemes queden enlazados a otros componentes; `Home` y `Search`.

En las líneas finales de `App.jsx` se encuentra el componente `Routes` que en forma análoga a `routes.rb` en el backend de la aplicación Rails, define una lista de rutas que son válidas para la aplicación que se ejecuta en el _frontend_.

**Componente Home**

El componente `Home` incluye algunos componentes de MUI, como el de [`Card`](https://mui.com/material-ui/react-card/) y `CardContent`. Sin embargo, el propósito de `Card` es proveer un área en la cual instanciar el componente `Weather` que realiza las acciones relevantes en nuestra aplicación.

**Componente Weather**

En este componente hay dos hooks de React relevantes que son instanciados:

* `state` (variable `weather`): Esta variable contiene el objeto actual de clima cargado mediante la API de OpenWeather.
* `effect`: Este hook que no recibe ningún objeto para vigilar en su arreglo de argumentos, y ejecuta _automáticamente y una sola vez cuando se termina de renderizar_ el componente `Weather`. La función asíncrona que ejecuta el hook es `fetchWeather`. Podemos ver en ella las llamadas a la API remota y el procesamiento de resultados.

## Experimenta con el código



## Anexo: Lo básico de Vite

Usamos Vite (https://vitejs.dev/) como andamiaje para crear nuestra aplicación utilizando React 18. Vite provee una serie de herramientas, por ejemplo, generadores parecidos a los que tiene una aplicación Rails, que permiten crear una aplicación de frontend a partir de cero, y preparar una aplicación para producción.

Si abres el archivo `package.json` verás que hay un objeto con clave `"scripts"` declarado. Este objeto define varias tareas posibles de realizar utilizando Vite, invocándolas con Yarn según nuestras preferencias de ambiente de desarrollo.

Los scripts relevantes son:

* `dev`: Permite levantar la aplicación en modo desarrollo como hemos visto arriba.
* `build`: Prepara la aplicación para ponerla en ambiente de producción.
* `lint`: Ejecuta linters para validar que el código cumpla estándares de codificación, y normas de calidad.
* `preview`: Permite previsualizar la aplicación después que ha sido construida con `build`.

