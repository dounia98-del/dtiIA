// ===== SUPABASE =====
const supabaseUrl = 'https://devawblnsfoiqtoddyot.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldmF3Ymxuc2ZvaXF0b2RkeW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzUzMDAsImV4cCI6MjA4NTg1MTMwMH0.ReJslFl1SwNEokx3_em8NGXTcVC2OHSCNpK4mJNBzsY';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
// ===== MÉTÉO =====
const VILLE = 'Paris';
const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
const THEMES = {
  Clear:        { gradient: 'linear-gradient(180deg, #ffb347 0%, #ff8c42 100%)' },
  Clouds:       { gradient: 'linear-gradient(180deg, #8fa3b1 0%, #6b8394 100%)' },
  Rain:         { gradient: 'linear-gradient(180deg, #4a6fa5 0%, #3a5a8c 100%)' },
  Drizzle:      { gradient: 'linear-gradient(180deg, #4a6fa5 0%, #3a5a8c 100%)' },
  Thunderstorm: { gradient: 'linear-gradient(180deg, #3d2b6b 0%, #2a1a4e 100%)' },
  Snow:         { gradient: 'linear-gradient(180deg, #c9d6e3 0%, #a8bfd4 100%)' },
  Default:      { gradient: 'linear-gradient(180deg, #7a1a1a 0%, #5a1010 100%)' },
};

// ===== DONNÉES =====
let garderobe = [];
let utilisatrice = null;


// ===== VÉRIFICATION SESSION =====
// Si pas connectée → on redirige vers auth.html
async function verifierSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = 'auth.html';
    return;
  }

  utilisatrice = data.session.user;
  charger();
  afficherBienvenue();
  chargerMeteo();
  ajouterBoutonDeconnexion();
  
}

// ===== BOUTON DÉCONNEXION =====
function ajouterBoutonDeconnexion() {
  const header = document.querySelector('header');
  const btn = document.createElement('button');
  btn.textContent = 'Se déconnecter';
  btn.style.cssText = `
    margin-left: auto;
    padding: 8px 16px;
    background: none;
    border: 1px solid #e0d8d0;
    border-radius: 8px;
    font-size: 13px;
    color: #9a9a9a;
    cursor: pointer;
  `;
  btn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'auth.html';
  });
  header.appendChild(btn);
}

// ===== MÉTÉO =====
async function chargerMeteo() {
  try {
    const reponse = await fetch(`/api/meteo?ville=${VILLE}`);
    const donnees = await reponse.json();

    // Dates en heure locale
    const maintenant = new Date();
    const demainDate = new Date(maintenant);
    demainDate.setDate(maintenant.getDate() + 1);
    const apresdemainDate = new Date(maintenant);
    apresdemainDate.setDate(maintenant.getDate() + 2);

    function dateLocale(d) {
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
    }

    const aujourdhuiStr = dateLocale(maintenant);
    const demainStr = dateLocale(demainDate);
    const apresdemainStr = dateLocale(apresdemainDate);

    // Météo de demain à midi
    const demain = donnees.list.find(item =>
      item.dt_txt.startsWith(demainStr) && item.dt_txt.includes('12:00')
    ) || donnees.list.find(item => item.dt_txt.startsWith(demainStr));

    if (!demain) {
      document.getElementById('meteo-desc').textContent = 'Météo indisponible';
      return;
    }

    const temp = Math.round(demain.main.temp);
    const description = demain.weather[0].description;
    const condition = demain.weather[0].main;
    const theme = THEMES[condition] || THEMES['Default'];

    document.getElementById('meteo-card').style.background = theme.gradient;
    document.getElementById('meteo-temp').textContent = temp + '°';
    document.getElementById('meteo-desc').textContent =
      description.charAt(0).toUpperCase() + description.slice(1);
    document.getElementById('meteo-ville').textContent = '📍 ' + VILLE + ' - ' + demainStr;

 // On prend simplement les 3 premiers jours distincts disponibles dans l'API
const joursDisponibles = [];
const datesVues = new Set();

for (const item of donnees.list) {
  const dateStr = item.dt_txt.split(' ')[0];
  if (!datesVues.has(dateStr)) {
    datesVues.add(dateStr);
    // On préfère midi, sinon on prend ce qui existe
    const entreeMidi = donnees.list.find(i =>
      i.dt_txt.startsWith(dateStr) && i.dt_txt.includes('12:00')
    ) || item;
    joursDisponibles.push(entreeMidi);
  }
  if (joursDisponibles.length === 3) break;
}

document.getElementById('meteo-forecast').innerHTML = joursDisponibles.map((jour, i) => {
  const date = new Date(jour.dt * 1000);
  const nomJour = JOURS[date.getDay()];
  const tempJour = Math.round(jour.main.temp);
  const actif = i === 1 ? 'active' : '';
  return `
    <div class="day-col ${actif}">
      <span class="day-label">${nomJour}</span>
      <span class="day-val">${tempJour}°</span>
      ${i === 1 ? '<span class="day-arrow">▲</span>' : ''}
    </div>
  `;
}).join('');

  } catch (erreur) {
    console.error('Erreur météo :', erreur.message);
    document.getElementById('meteo-desc').textContent = 'Météo indisponible';
  }
}
// ===== CHARGEMENT DES VÊTEMENTS =====
async function charger() {
  try {
    const reponse = await fetch(supabaseUrl + '/rest/v1/vetement?select=*&user_id=eq.' + utilisatrice.id, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + (await supabaseClient.auth.getSession()).data.session.access_token
      }
    });

    if (reponse.ok) {
      garderobe = await reponse.json();
      afficherGarderobe();
    }
  } catch (erreur) {
  console.error('Erreur chargement :', erreur);
  grille.innerHTML = '<p class="vide">Erreur lors du chargement 😕 Réessaie dans quelques secondes.</p>';
  }
}

// ===== ÉLÉMENTS HTML =====
const inputNom = document.getElementById('nom');
const selectCategorie = document.getElementById('categorie');
const btnAjouter = document.getElementById('btn-ajouter');
const grille = document.getElementById('grille');
const selectCouleur = document.getElementById('couleur');
const selectSaison = document.getElementById('saison');
const inputPhoto = document.getElementById('photo');
const preview = document.getElementById('preview');

// ===== AJOUTER UN VÊTEMENT =====
async function ajouterVetement() {
  const nom = inputNom.value.trim();
  const categorie = selectCategorie.value;

  if (!nom || !categorie) {
    alert('Remplis le nom et la catégorie !');
    return;
  }

  const session = await supabaseClient.auth.getSession();
  const token = session.data.session.access_token;

  const fichier = inputPhoto.files[0];
  let imageUrl = null;

  if (fichier) {
    const nomFichier = Date.now() + '_' + fichier.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    const reponseUpload = await fetch(
      supabaseUrl + '/storage/v1/object/photos/' + nomFichier,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + token,
          'Content-Type': fichier.type
        },
        body: fichier
      }
    );

    if (reponseUpload.ok) {
      imageUrl = supabaseUrl + '/storage/v1/object/public/photos/' + nomFichier;
    } else {
      console.error('Erreur upload photo :', await reponseUpload.text());
      alert("Erreur lors de l'upload de la photo !");
      return;
    }
  }

  // On lie le vêtement à l'utilisatrice connectée !
  const nwvetement = {
    nom: nom,
    categorie: categorie,
    couleur: selectCouleur.value,
    saison: selectSaison.value,
    image_url: imageUrl,
    user_id: utilisatrice.id
  };

  const reponse = await fetch(supabaseUrl + '/rest/v1/vetement', {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(nwvetement)
  });

  if (reponse.ok) {
    const data = await reponse.json();
    garderobe.push(data[0]);
    afficherGarderobe();

    inputNom.value = '';
    selectCategorie.value = '';
    selectCouleur.value = '';
    selectSaison.value = 'Toutes saisons';
    inputPhoto.value = '';
    preview.src = '';
    preview.style.display = 'none';
  } else {
    console.error('Erreur serveur :', await reponse.text());
    alert("Erreur lors de l'ajout !");
  }
}

// ===== AFFICHER LA GARDE-ROBE =====
function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function afficherGarderobe() {
  if (garderobe.length === 0) {
    grille.innerHTML = '<p class="vide">Aucun vêtement pour l\'instant 👗</p>';
    return;
  }

  grille.innerHTML = garderobe.map(vetement => `
    <div class="carte">
      ${vetement.image_url
        ? `<img src="${escape(vetement.image_url)}" alt="${escape(vetement.nom)}" class="carte-photo">`
        : '<div class="carte-photo-vide">Pas de photo</div>'}
      <div class="carte-categorie">${escape(vetement.categorie)}</div>
      <div class="carte-nom">${escape(vetement.nom)}</div>
      <div class="carte-couleur">${escape(vetement.couleur)}</div>
      <div class="carte-saison">${escape(vetement.saison)}</div>
      <button class="btn-supprimer" onclick="supprimerVetement(${vetement.id})">Supprimer</button>
    </div>
  `).join('');
}

// ===== SUPPRIMER UN VÊTEMENT =====
async function supprimerVetement(id) {
  try {
    const session = await supabaseClient.auth.getSession();
    const token = session.data.session.access_token;

    const reponse = await fetch(supabaseUrl + '/rest/v1/vetement?id=eq.' + id, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + token
      }
    });

    if (reponse.ok) {
      garderobe = garderobe.filter(v => v.id !== id);
      afficherGarderobe();
    }
  } catch (e) {
  console.error('Erreur suppression :', e);
  alert('Erreur lors de la suppression, réessaie !');
}
}

// ===== ÉVÉNEMENTS =====
// On ajoute un vêtement quand on clique sur le bouton
btnAjouter.addEventListener('click', ajouterVetement);

inputPhoto.addEventListener('change', function () {
  const fichier = inputPhoto.files[0];
  if (fichier) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(fichier);
  }
});

// ===== DÉMARRAGE =====
// On vérifie la session en premier — tout le reste se lance depuis là
verifierSession();

// ===== CHAT IA =====
const toggleBtn = document.getElementById('chat-toggle');
const closeBtn = document.getElementById('chat-close');
const popup = document.getElementById('chat-popup');
const messages = document.getElementById('chat-messages');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');

// Historique de la conversation pour que l'IA se souvienne du contexte
let historiqueChat = [];

toggleBtn.addEventListener('click', () => {
  popup.classList.toggle('open');
  // Message de bienvenue au premier ouverture
  if (messages.children.length === 0) {
    const meteoResume = document.getElementById('meteo-temp').textContent;
    const desc = document.getElementById('meteo-desc').textContent;
    addMessage(`Salut ! 👗 Je suis ton assistante mode. Demain il fera ${meteoResume} et ${desc.toLowerCase()} à ${VILLE}. Dis moi ce que tu cherches et je te propose une tenue depuis ton dressing !`, 'bot');
  }
});

closeBtn.addEventListener('click', () => popup.classList.remove('open'));

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = 'msg ' + sender;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addLoadingMessage() {
  //pendant que l'ia reflechit on affiche ... pour montrer que ça charge
  const div = document.createElement('div');
  div.className = 'msg bot loading-msg';
  div.textContent = '...';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';

  const loading = addLoadingMessage();

  // On construit le contexte de la garde-robe, on construit un resume qui lui dit la méetéo de demain et toute la garde robe
  const resumeGarderobe = garderobe.length === 0
    ? "La garde-robe est vide pour l'instant."
    : garderobe.map(v =>
        `- ${escape(v.nom)} (${escape(v.categorie)}, ${escape(v.couleur)}, ${escape(v.saison)})`
      ).join('\n');

  const meteoTemp = document.getElementById('meteo-temp').textContent;
  const meteoDesc = document.getElementById('meteo-desc').textContent;

  // Message système qui donne le contexte à l'IA
  const systemPrompt = `Tu es une assistante mode personnelle sympa et bienveillante pour l'application DressChooseAI. 
Tu aides l'utilisatrice à choisir sa tenue pour demain en fonction de sa garde-robe et de la météo.

Météo de demain à ${VILLE} : ${meteoTemp}, ${meteoDesc}.

Garde-robe disponible :
${resumeGarderobe}

Règles importantes :
- Propose uniquement des vêtements qui existent dans la garde-robe listée ci-dessus
- Tiens compte de la météo (température et conditions)
- Tiens compte des associations de couleurs
- Sois courte, sympa et directe
- Si la garde-robe est vide, encourage l'utilisatrice à ajouter des vêtements
- Réponds toujours en français`;

  // On ajoute le message de l'utilisatrice à l'historique
  historiqueChat.push({ role: 'user', content: text });

  try {
    const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    systemPrompt: systemPrompt,
    messages: historiqueChat
  })
});

const data = await response.json();

if (!response.ok || !data.choices || !data.choices[0]) {
  throw new Error(data.error || 'Réponse IA invalide');
}

const reponseIA = data.choices[0].message.content;

historiqueChat.push({ role: 'assistant', content: reponseIA });

loading.remove();
addMessage(reponseIA, 'bot');

  } catch (erreur) {
    console.error('Erreur IA :', erreur);
    loading.remove();
    addMessage('Oups, une erreur s\'est produite. Réessaie !', 'bot');
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

// ===== POPUP BIENVENUE =====
function afficherBienvenue() {
  // On vérifie si l'utilisatrice a déjà vu le popup
  const dejaVu = localStorage.getItem('welcome_' + utilisatrice.id);
  
  if (!dejaVu) {
    document.getElementById('welcome-overlay').style.display = 'flex';
    
    document.getElementById('welcome-btn').addEventListener('click', () => {
      document.getElementById('welcome-overlay').style.display = 'none';
      // On note que l'utilisatrice a vu le popup
      localStorage.setItem('welcome_' + utilisatrice.id, 'true');
    });
  }
}