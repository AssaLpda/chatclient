const firebaseConfig = {
  apiKey: "AIzaSyCpAcMa6rYSulwQSYsUsqpm3SPjnXV6Poo",
  authDomain: "chatlanding-dfee6.firebaseapp.com",
  databaseURL: "https://chatlanding-dfee6-default-rtdb.firebaseio.com",
  projectId: "chatlanding-dfee6",
  storageBucket: "chatlanding-dfee6.appspot.com",
  messagingSenderId: "627733533904",
  appId: "1:627733533904:web:15603a1266d40a647dbad5",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM
const btnHablar = document.getElementById("btnHablar");
const chatWrapper = document.getElementById("chatWrapper");
const chatContainer = document.getElementById("chatContainer");
const mensajeInput = document.getElementById("mensajeInput");
const btnEnviar = document.getElementById("btnEnviar");

const nombreWrapper = document.getElementById("nombreWrapper");
const nombreInput = document.getElementById("nombreInput");
const btnNombre = document.getElementById("btnNombre");

const infoInicial = document.querySelector(".info-inicial");
const mensajePromocional = document.getElementById("mensajePromocional");

// Notificación containers
const notiContainerInicial = document.getElementById("notificaciones-container");
const notiContainerChat = document.getElementById("notificaciones-chat-container");
let currentNotiContainer = notiContainerInicial; // por defecto

let userId = localStorage.getItem("chatUserId");
if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("chatUserId", userId);
}

let nombreUsuario = localStorage.getItem("chatNombre");

btnHablar.addEventListener("click", () => {
  if (!nombreUsuario) {
    nombreWrapper.style.display = "flex";
  } else {
    iniciarChatYMostrarUI();
  }

  // Cambiar el contenedor de notificaciones
  currentNotiContainer = notiContainerChat;
  notiContainerInicial.style.display = "none";
  notiContainerChat.style.display = "flex";
});

btnNombre.addEventListener("click", () => {
  const nombre = nombreInput.value.trim();
  if (!nombre) return alert("Por favor, ingresá tu nombre.");

  nombreUsuario = nombre;
  localStorage.setItem("chatNombre", nombreUsuario);

  const now = Date.now();

  const mensajeBienvenida = {
    nombre: "Admin",
    mensaje: "¡Hola! Bienvenido/a!❤️. Decime tu nombre así te brindo un usuario para jugar",
    tipo: "admin",
    timestamp: now,
  };

  const primerMensajeUsuario = {
    nombre: nombreUsuario,
    mensaje: `Hola, mi nombre es: ${nombreUsuario}`,
    tipo: "user",
    timestamp: now,
  };

  const ref = db.ref(`chats/${userId}/mensajes`);

  ref.once("value").then((snapshot) => {
    if (!snapshot.exists()) {
      ref.push(mensajeBienvenida);
      ref.push(primerMensajeUsuario);
    }
    iniciarChatYMostrarUI();
  });
});

function iniciarChatYMostrarUI() {
  if (infoInicial) infoInicial.style.display = "none";
  nombreWrapper.style.display = "none";
  if (mensajePromocional) mensajePromocional.style.display = "block";
  chatWrapper.style.display = "flex";

  // Cambiar el contenedor de notificaciones
  currentNotiContainer = notiContainerChat;
  notiContainerInicial.style.display = "none";
  notiContainerChat.style.display = "flex";

  // Limpiar notificaciones visibles y detener el intervalo
  notiContainerChat.innerHTML = "";
  clearInterval(window.notiInterval);

  iniciarChat();
}

function iniciarChat() {
  escucharMensajes();
  mensajeInput.focus();
}

function linkify(text) {
  const urlPattern = /(\b(https?:\/\/|www\.)[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
  return text.replace(urlPattern, (url) => {
    let href = url;
    if (!href.startsWith("http")) href = "http://" + href;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

function mostrarMensaje(snapshot) {
  const { mensaje, tipo, timestamp } = snapshot.val();
  const div = document.createElement("div");
  div.className = tipo === "user" ? "user message" : "admin message";
  let mensajeConLinks = linkify(mensaje).replace(/\n/g, "<br>");

  if (tipo === "admin") {
    const fecha = new Date(timestamp);
    const horas = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const horaStr = `${horas}:${minutos}`;
    div.innerHTML = `
      <div class="burbuja">
        <p>${mensajeConLinks}</p>
        <div class="meta" style="font-size: 10px; color: gray; text-align: right; margin-top: 5px;">
          <span class="hora">${horaStr}</span>
          <svg class="double-check" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" aria-label="Mensaje leído" role="img" style="width: 14px; height: 14px; vertical-align: middle; fill: #4fc3f7;">
            <path d="M1.5 6L5.5 10L14.5 1" stroke="#4fc3f7" stroke-width="2" fill="none" />
          </svg>
        </div>
      </div>`;
  } else {
    div.innerHTML = `<div class="burbuja"><p>${mensajeConLinks}</p></div>`;
  }

  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escucharMensajes() {
  const mensajesRef = db.ref(`chats/${userId}/mensajes`);
  mensajesRef.off();
  mensajesRef.on("child_added", (snapshot) => {
    mostrarMensaje(snapshot);
  });
}

function enviarMensaje() {
  const texto = mensajeInput.value.trim();
  if (!texto) return;

  const mensajeData = {
    nombre: nombreUsuario || "Usuario",
    mensaje: texto,
    tipo: "user",
    timestamp: Date.now(),
  };

  db.ref(`chats/${userId}/mensajes`).push(mensajeData)
    .then(() => {
      mensajeInput.value = "";
      mensajeInput.focus();
    })
    .catch((error) => {
      console.error("Error enviando mensaje:", error);
    });
}

btnEnviar.addEventListener("click", enviarMensaje);
mensajeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensaje();
  }
});

// --- Notificaciones ---
const nombres = ["Juan Carlos", "Lucía M.", "Pedro A.", "María L.", "Carlos B.", "Ana P.", "Sofía G.", "Federico T.", "Romina S.", "Martín D.", "Valentina R.", "Diego F.", "Julieta N.", "Andrés E.", "Camila V.", "Lucas M.", "Paula J.", "Nicolás H.", "Florencia C.", "Matías K.", "Carla Z.", "Emilia B.", "Joaquín T.", "Agustina Q.", "Tomás L.", "Verónica G.", "Benjamín A.", "Milagros Y.", "Ricardo P."];
const ciudades = ["CABA", "Buenos Aires", "La Plata", "Mar del Plata", "Salta", "Córdoba", "Rosario", "Santa Fe", "Mendoza", "San Juan", "San Luis", "Tucumán", "Santiago del Estero", "La Rioja", "Catamarca", "Jujuy", "Formosa", "Chaco", "Corrientes", "Misiones", "Entre Ríos", "Neuquén", "Río Negro", "Chubut", "Santa Cruz", "Tierra del Fuego", "Bahía Blanca", "Resistencia", "Posadas", "Trelew"];
const casinoImages = [
  "https://static.casino.guru/pict/1077550/2-Sweet-4-U.png",
  "https://static.casino.guru/pict/165466/Gates-of-Olymps.png",
  "https://ecdn.speedsize.com/146a650b-0738-4cda-9854-934a12c53a89/https://www.codere.bet.ar/lobby_tiles/MGS9MasksofFire_Square.jpg",
  "https://static.templodeslots.es/pict/562516/Sweet-Crush.png",
  "https://i.pinimg.com/736x/68/0f/61/680f617e5e94e7f104be209e3942668c.jpg",
  "https://static.casino.guru/pict/181096/3-Clown-Monty.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThm4B5BW-kVxkGq4z9pRfpd9azxfReieKUwQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpK4byCnnWVkrbZNrgOiH9cbm4atUXducn5Q&s",
  "https://ecdn.speedsize.com/146a650b-0738-4cda-9854-934a12c53a89/https://www.codere.bet.ar/lobby_tiles/MGSQueenofAlexandria_Square.jpg"
];

function mostrarNotificacion() {
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
  const monto = (Math.floor(Math.random() * 20) + 1) * 10000;
  const minutos = Math.floor(Math.random() * 59) + 1;
  const imgUrl = casinoImages[Math.floor(Math.random() * casinoImages.length)];

  const notif = document.createElement('div');
  notif.classList.add('notification');
  notif.innerHTML = `
    <img src="${imgUrl}" alt="Premio Casino" />
    <div class="text">
      <div><span class="icon">🎁</span><strong>${nombre}</strong></div>
      <div>Acaba de retirar $${monto.toLocaleString()}</div>
      <div><span class="icon">📍</span>${ciudad} - Hace ${minutos}min</div>
    </div>
  `;

  currentNotiContainer.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOutFade 0.4s forwards';
    notif.addEventListener('animationend', () => notif.remove());
  }, 4000);
}

// Mostrar notificaciones solo en pantalla de bienvenida
if (currentNotiContainer === notiContainerInicial) {
  window.notiInterval = setInterval(mostrarNotificacion, 15000);
  mostrarNotificacion(); // Primera inmediata
}


















