const calendarContainer = document.getElementById('calendar');
const overlay = document.getElementById('overlay');

// Génération des 24 cases
for (let i = 1; i <= 24; i++) {
    const card = document.createElement('div');
    card.classList.add('day-card');
    card.dataset.day = i;

    const front = document.createElement('div');
    front.classList.add('front');
    front.style.backgroundImage = `url('images/couvertures/${i}.png')`;

    const back = document.createElement('div');
    back.classList.add('back');
    back.style.backgroundImage = `url('images/cadeaux/${i}.png')`;

    card.appendChild(front);
    card.appendChild(back);
    calendarContainer.appendChild(card);

    // Événement de clic
    card.addEventListener('click', () => openCard(card));
}

// Préchargement des images pour éviter les saccades lors de la première animation
function preloadImages() {
    for (let i = 1; i <= 24; i++) {
        const img = new Image();
        img.src = `images/cadeaux/${i}.png`;
    }
}
// Lancer le préchargement une fois la page chargée
window.addEventListener('load', preloadImages);

let activeCard = null;
let placeholder = null;

function openCard(card) {
    if (activeCard) return; // Empêche d'ouvrir plusieurs cartes

    // Vérification de la date
    const day = parseInt(card.dataset.day);
    const now = new Date();
    const currentMonth = now.getMonth(); // 11 = Décembre
    const currentDay = now.getDate() - 0; // Décalage pour tester avant décembre

    // Si on est en décembre
    if (currentMonth === 11) { // remettre à 11 pour décembre
        if (day > currentDay) {
            alert(`Patience ! Tu ne peux pas encore ouvrir la case du ${day} décembre.`);
            return;
        }
    } 
    // Si on est en novembre (on bloque avant le début)
    else if (currentMonth === 10) { // remettre à 10 pour novembre
        alert("Patience ! Le calendrier commence le 1er décembre.");
        return;
    }

    activeCard = card;
    
    // 1. Créer un placeholder pour garder l'espace dans la grille
    placeholder = document.createElement('div');
    placeholder.className = 'day-card';
    // Copier la classe de variante si elle existe pour maintenir la cohérence visuelle (même si invisible)
    // if (card.classList.contains('variant-green')) { placeholder.classList.add('variant-green'); }
    
    placeholder.style.visibility = 'hidden'; // Invisible mais prend de la place
    
    // 2. Récupérer la position actuelle de la carte
    const rect = card.getBoundingClientRect();
    
    // 3. Insérer le placeholder
    card.parentNode.insertBefore(placeholder, card);
    
    // 4. Déplacer la carte dans le body pour éviter les problèmes de contexte d'empilement (perspective du grid)
    document.body.appendChild(card);
    
    card.style.position = 'fixed';
    card.style.top = rect.top + 'px';
    card.style.left = rect.left + 'px';
    card.style.width = rect.width + 'px';
    card.style.height = rect.height + 'px';
    card.style.zIndex = '1000';
    card.style.margin = '0'; // Reset margin if any

    // Force reflow
    void card.offsetWidth;

    // 5. Activer l'animation vers le centre
    card.classList.add('open');
    
    // Modification directe des styles pour l'animation
    requestAnimationFrame(() => {
        card.style.top = '50%';
        card.style.left = '50%';
        // Ajout de perspective() pour l'effet 3D car on est hors du conteneur avec perspective
        card.style.transform = 'translate(-50%, -50%) perspective(1000px) rotateY(180deg) scale(3)';
    });

    overlay.classList.add('active');
}

function closeCard() {
    if (!activeCard) return;

    const card = activeCard;
    
    // 1. Récupérer la position du placeholder (là où la carte doit revenir)
    const rect = placeholder.getBoundingClientRect();

    // 2. Animer le retour
    card.style.top = rect.top + 'px';
    card.style.left = rect.left + 'px';
    // On garde la perspective pour la transition inverse
    card.style.transform = 'translate(0, 0) perspective(1000px) rotateY(0deg) scale(1)';
    card.classList.remove('open');

    overlay.classList.remove('active');

    // 3. Une fois la transition finie, remettre dans le flux
    card.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'transform') return; // On attend que la transformation soit finie
        
        card.removeEventListener('transitionend', handler);
        
        // Si l'utilisateur a cliqué très vite ailleurs, on vérifie que c'est toujours la carte active
        if (card === activeCard) {
            card.style.position = '';
            card.style.top = '';
            card.style.left = '';
            card.style.width = '';
            card.style.height = '';
            card.style.transform = '';
            card.style.zIndex = '';
            card.style.margin = '';

            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.replaceChild(card, placeholder);
            }
            
            activeCard = null;
            placeholder = null;
        }
    });
}

// Fermer en cliquant sur l'overlay
overlay.addEventListener('click', closeCard);

// Fermer en cliquant sur la carte ouverte (optionnel, mais intuitif)
// Note: Le clic sur la carte déclenche openCard, il faut gérer ça.
// On peut modifier openCard pour agir comme un toggle ou vérifier si la carte est déjà active.
// Mais comme on la sort du flux et qu'on met un overlay, le clic sur l'overlay est le plus simple.
// Si on veut que le clic sur la carte la ferme aussi :
/*
card.addEventListener('click', (e) => {
    e.stopPropagation();
    if (card.classList.contains('open')) {
        closeCard();
    } else {
        openCard(card);
    }
});
*/