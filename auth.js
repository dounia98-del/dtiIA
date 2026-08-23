const SUPABASE_URL = 'https://devawblnsfoiqtoddyot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRldmF3Ymxuc2ZvaXF0b2RkeW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzUzMDAsImV4cCI6MjA4NTg1MTMwMH0.ReJslFl1SwNEokx3_em8NGXTcVC2OHSCNpK4mJNBzsY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function afficherErreur(texte) {
  const msg = document.getElementById('auth-msg');
  msg.className = 'msg erreur';
  msg.textContent = texte;
  msg.style.display = 'block';
}

function afficherSucces(texte) {
  const msg = document.getElementById('auth-msg');
  msg.className = 'msg succes';
  msg.textContent = texte;
  msg.style.display = 'block';
}

// Onglets
document.getElementById('tab-connexion').addEventListener('click', () => {
  document.getElementById('tab-connexion').classList.add('active');
  document.getElementById('tab-inscription').classList.remove('active');
  document.getElementById('fields-connexion').classList.add('active');
  document.getElementById('fields-inscription').classList.remove('active');
  document.getElementById('auth-msg').style.display = 'none';
});

document.getElementById('tab-inscription').addEventListener('click', () => {
  document.getElementById('tab-inscription').classList.add('active');
  document.getElementById('tab-connexion').classList.remove('active');
  document.getElementById('fields-inscription').classList.add('active');
  document.getElementById('fields-connexion').classList.remove('active');
  document.getElementById('auth-msg').style.display = 'none';
});

// Connexion
document.getElementById('btn-connexion').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { afficherErreur('Remplis tous les champs !'); return; }
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) { afficherErreur('Email ou mot de passe incorrect !'); }
  else { window.location.href = 'index.html'; }
});

// Inscription
document.getElementById('btn-inscription').addEventListener('click', async () => {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-password-confirm').value;
  if (!email || !password || !confirm) { afficherErreur('Remplis tous les champs !'); return; }
  if (password !== confirm) { afficherErreur('Les mots de passe ne correspondent pas !'); return; }
  if (password.length < 6) { afficherErreur('Le mot de passe doit faire au moins 6 caractères !'); return; }
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) { afficherErreur('Erreur lors de l\'inscription !'); }
  else { afficherSucces('Compte créé ! Vérifie ta boîte mail avant de te connecter 📧'); }
});