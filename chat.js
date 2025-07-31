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

const btnHablar = document.getElementById("btnHablar");
const chatWrapper = document.getElementById("chatWrapper");
const chatContainer = document.getElementById("chatContainer");
const mensajeInput = document.getElementById("mensajeInput");
const btnEnviar = document.getElementById("btnEnviar");

let userId = localStorage.getItem("chatUserId");
if (!userId) {
  userId = Date.now().toString();
  localStorage.setItem("chatUserId", userId);
}

btnHablar.addEventListener("click", () => {
  btnHablar.style.display = "none";
  chatWrapper.style.display = "flex";

  // Primero activar la escucha para que los mensajes lleguen y no se dupliquen
  escucharMensajes();

  const welcomePath = `chats/${userId}/mensajes`;

  // Verificar si ya existe ese mensaje exacto del admin
  db.ref(welcomePath)
    .orderByChild("mensaje")
    .equalTo("¡Hola! Bienvenido/a!❤️. Decime tu nombre así te brindo un usuario para jugar")
    .once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        db.ref(welcomePath).push({
          nombre: "Admin",
          mensaje: "¡Hola! Bienvenido/a!❤️. Decime tu nombre así te brindo un usuario para jugar",
          tipo: "admin",
          timestamp: Date.now()
        });
      }
    });
});



function mostrarMensaje(data) {
  const { mensaje, tipo } = data.val();
  const div = document.createElement("div");
  div.textContent = mensaje;
  div.className = tipo === "user" ? "user message" : "admin message";
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

btnEnviar.addEventListener("click", () => {
  const texto = mensajeInput.value.trim();
  if (!texto) return;
  const mensajeData = {
    nombre: "Usuario",
    mensaje: texto,
    tipo: "user",
    timestamp: Date.now()
  };
  db.ref(`chats/${userId}/mensajes`).push(mensajeData);
  mensajeInput.value = "";
});



