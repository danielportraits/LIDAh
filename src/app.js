import { demoChats, demoStatuses } from "./data/demo-data.js";
import { readJSON, writeJSON } from "./modules/storage.js";
import { showView, setupNavigation } from "./modules/navigation.js";
import { openDialog, closeDialog, toast } from "./modules/dialogs.js";

const state = {
  chats: readJSON("lida.chats", demoChats),
  messages: readJSON("lida.messages", {}),
  statuses: readJSON("lida.statuses", demoStatuses),
  filter: "all",
  activeChatId: null,
  profile: readJSON("lida.profile", { name: "Daniel", handle: "@lida_user", bio: "Construyendo conexiones, a mi manera." })
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
const initials = name => name.trim().split(/\s+/).slice(0,2).map(part => part[0]).join("").toUpperCase();

function persist() {
  writeJSON("lida.chats", state.chats);
  writeJSON("lida.messages", state.messages);
  writeJSON("lida.statuses", state.statuses);
  writeJSON("lida.profile", state.profile);
}
function renderChats() {
  const query = ($("#chat-search").value || "").toLowerCase().trim();
  const chats = state.chats.filter(chat => {
    const matchesQuery = `${chat.name} ${chat.lastMessage || ""}`.toLowerCase().includes(query);
    const matchesFilter = state.filter === "all" || (state.filter === "unread" && chat.unread) || (state.filter === "favorites" && chat.favorite);
    return matchesQuery && matchesFilter;
  });
  $("#chat-list").innerHTML = chats.map(chat => `<button class="chat-row" data-chat-id="${esc(chat.id)}">
    <span class="avatar ${chat.online ? "online-avatar" : ""}">${esc(initials(chat.name))}</span>
    <span class="chat-copy"><span class="chat-title-line"><strong>${esc(chat.name)}</strong><time>${esc(chat.time || "")}</time></span><span class="chat-preview">${chat.unread ? '<i class="unread-dot"></i>' : ""}${esc(chat.lastMessage || "Inicia una conversación")}</span></span>
    ${chat.favorite ? '<span class="favorite-mark" aria-label="Favorito">★</span>' : ""}
  </button>`).join("");
  $("#chat-empty").classList.toggle("hidden", chats.length > 0);
}
function renderConversation(chatId) {
  const chat = state.chats.find(item => item.id === chatId);
  if (!chat) return;
  state.activeChatId = chatId;
  chat.unread = false;
  $("#conversation-name").textContent = chat.name;
  $("#conversation-avatar").textContent = initials(chat.name);
  $("#conversation-status").textContent = chat.online ? "En línea" : "Última vez recientemente";
  const messages = state.messages[chatId] || [];
  $("#message-list").innerHTML = `<div class="date-divider"><span>HOY</span></div>` + messages.map(message => `<div class="message ${message.mine ? "mine" : "theirs"}"><p>${esc(message.text)}</p><time>${esc(message.time)}</time></div>`).join("");
  $("#message-list").scrollTop = $("#message-list").scrollHeight;
  persist();
  renderChats();
  showView("conversation");
}
function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || !state.activeChatId) return;
  const messages = state.messages[state.activeChatId] || [];
  const time = new Date().toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" });
  messages.push({ text: trimmed, mine: true, time });
  state.messages[state.activeChatId] = messages;
  const chat = state.chats.find(item => item.id === state.activeChatId);
  if (chat) { chat.lastMessage = trimmed; chat.time = time; }
  persist();
  renderConversation(state.activeChatId);
}
function openNewChat() {
  openDialog(`<p class="eyebrow">NUEVA CONVERSACIÓN</p><h2>Empezar un chat</h2><p class="muted">En esta versión de demostración puedes crear una conversación local.</p><label class="field-label" for="new-contact-name">Nombre del contacto</label><input id="new-contact-name" class="dialog-input" maxlength="60" placeholder="Ej. Alex"><button class="primary-button full-width" id="create-contact">Crear conversación</button>`);
  $("#create-contact").addEventListener("click", () => {
    const name = $("#new-contact-name").value.trim();
    if (!name) { toast("Escribe un nombre para continuar."); return; }
    const id = `local-${Date.now()}`;
    state.chats.unshift({ id, name, lastMessage: "Conversación creada", time: "Ahora", unread: false, favorite: false, online: false });
    state.messages[id] = [];
    persist(); closeDialog(); renderChats(); renderConversation(id);
  });
}
function openStatusDialog() {
  openDialog(`<p class="eyebrow">COMPARTE UN MOMENTO</p><h2>Crear estado</h2><p class="muted">Este estado será una nota local de demostración.</p><textarea id="status-text" class="dialog-input" maxlength="240" rows="3" placeholder="¿Qué quieres compartir?"></textarea><button class="primary-button full-width" id="publish-status">Publicar estado</button>`);
  $("#publish-status").addEventListener("click", () => {
    const text = $("#status-text").value.trim();
    if (!text) { toast("Escribe algo para tu estado."); return; }
    state.statuses.unshift({ id: `status-${Date.now()}`, name: state.profile.name, text, time: "Ahora", own: true });
    persist(); renderStatuses(); closeDialog(); toast("Estado guardado en este dispositivo.");
  });
}
function renderStatuses() {
  $("#status-list").innerHTML = state.statuses.map(status => `<article class="status-row"><div class="status-ring"><div class="avatar">${esc(initials(status.name))}</div></div><div class="status-copy"><h3>${esc(status.name)} ${status.own ? '<span class="muted-inline">(tú)</span>' : ""}</h3><p>${esc(status.text)}</p><small>${esc(status.time || "")}</small></div></article>`).join("");
}
function editProfile() {
  openDialog(`<p class="eyebrow">PERSONALIZACIÓN</p><h2>Editar perfil</h2><label class="field-label" for="edit-name">Nombre</label><input id="edit-name" class="dialog-input" maxlength="50" value="${esc(state.profile.name)}"><label class="field-label" for="edit-handle">Usuario</label><input id="edit-handle" class="dialog-input" maxlength="40" value="${esc(state.profile.handle)}"><label class="field-label" for="edit-bio">Biografía</label><textarea id="edit-bio" class="dialog-input" maxlength="160" rows="3">${esc(state.profile.bio)}</textarea><button class="primary-button full-width" id="save-profile">Guardar cambios</button>`);
  $("#save-profile").addEventListener("click", () => {
    const name = $("#edit-name").value.trim();
    const handle = $("#edit-handle").value.trim();
    if (!name || !handle) { toast("El nombre y el usuario son obligatorios."); return; }
    state.profile = { name, handle: handle.startsWith("@") ? handle : `@${handle}`, bio: $("#edit-bio").value.trim() };
    persist(); renderProfile(); closeDialog(); toast("Perfil actualizado.");
  });
}
function renderProfile() {
  $("#profile-display-name").textContent = state.profile.name;
  $("#profile-handle").textContent = state.profile.handle;
  $(".profile-bio").textContent = state.profile.bio;
  $(".profile-avatar").textContent = initials(state.profile.name);
  $("#profile-shortcut").textContent = initials(state.profile.name);
}
function setupAI() {
  const ask = text => {
    const input = text.trim(); if (!input) return;
    const area = $("#ai-messages");
    area.insertAdjacentHTML("beforeend", `<div class="ai-bubble user-ai">${esc(input)}</div><div class="ai-bubble assistant-ai"><strong>✦ LIDA AI</strong><p>Estoy en modo de demostración. Cuando conectemos el servicio de IA, podré responder a “${esc(input)}” con ayuda real.</p></div>`);
    $("#ai-input").value = ""; area.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  $("#ai-form").addEventListener("submit", event => { event.preventDefault(); ask($("#ai-input").value); });
  $$(".suggestion").forEach(button => button.addEventListener("click", () => ask(button.dataset.prompt)));
}
function setupEvents() {
  $("#chat-search").addEventListener("input", renderChats);
  $$(".filter-chip").forEach(button => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    $$(".filter-chip").forEach(item => item.classList.toggle("selected", item === button));
    renderChats();
  }));
  $("#chat-list").addEventListener("click", event => {
    const row = event.target.closest("[data-chat-id]");
    if (row) renderConversation(row.dataset.chatId);
  });
  $("#message-form").addEventListener("submit", event => { event.preventDefault(); sendMessage($("#message-input").value); $("#message-input").value = ""; });
  $("#back-to-chats").addEventListener("click", () => showView("chats"));
  $("#new-chat-button").addEventListener("click", openNewChat);
  $("#new-status-button").addEventListener("click", openStatusDialog);
  $("#status-add").addEventListener("click", openStatusDialog);
  $("#edit-profile-button").addEventListener("click", editProfile);
  $("#profile-edit-main").addEventListener("click", editProfile);
  $("#profile-shortcut").addEventListener("click", () => showView("profile"));
  $("#search-button").addEventListener("click", () => { showView("chats"); $("#chat-search").focus(); });
  $("#attach-button").addEventListener("click", () => toast("Los archivos adjuntos se habilitarán en una fase posterior."));
  $("#conversation-menu").addEventListener("click", () => openDialog(`<p class="eyebrow">CONVERSACIÓN</p><h2>Opciones</h2><button class="settings-row" id="toggle-favorite"><span>★</span><span><strong>Alternar favorito</strong><small>Marca o quita esta conversación de favoritos</small></span></button><button class="settings-row" id="clear-chat"><span>⌫</span><span><strong>Limpiar mensajes</strong><small>Elimina los mensajes locales de esta conversación</small></span></button>`));
  document.addEventListener("click", event => {
    if (event.target.closest("#toggle-favorite")) {
      const chat = state.chats.find(item => item.id === state.activeChatId);
      if (chat) chat.favorite = !chat.favorite;
      persist(); renderChats(); closeDialog(); toast("Preferencia actualizada.");
    }
    if (event.target.closest("#clear-chat")) {
      state.messages[state.activeChatId] = []; persist(); renderConversation(state.activeChatId); closeDialog(); toast("Mensajes locales eliminados.");
    }
  });
  $("#appearance-button").addEventListener("click", () => openDialog(`<p class="eyebrow">APARIENCIA</p><h2>Estilo de LIDA</h2><p>El prototipo usa el tema oscuro premium con acentos verde neón, paneles translúcidos y brillo sutil. Más opciones de personalización se añadirán en otra fase.</p>`));
  $("#privacy-button").addEventListener("click", () => openDialog(`<p class="eyebrow">PRIVACIDAD</p><h2>Datos del prototipo</h2><p>Los chats y ajustes de esta versión se almacenan localmente en el navegador. No hay cuentas reales, cifrado de extremo a extremo ni sincronización con servidores implementados todavía. No uses información sensible en esta demo.</p>`));
  $("#about-button").addEventListener("click", () => openDialog(`<p class="eyebrow">ACERCA DE</p><h2>LIDA</h2><p>Prototipo inicial de interfaz PWA. Las funciones de red, cuentas, multimedia y asistente real aún requieren implementación de backend.</p><p class="muted">Versión 0.1.0</p>`));
}
setupNavigation();
setupEvents();
setupAI();
renderChats();
renderStatuses();
renderProfile();
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(error => console.warn("No se pudo registrar el service worker:", error)));
}
