// --- STATE & ELEMENTS ---
let currentWeaponIndex = 0;
let isReloading = false;
let isAnimating = false;

// HTML elemek begyűjtése
const container = document.getElementById('container');
const holdImage = document.getElementById('hold-image');
const shootGif = document.getElementById('shoot-gif');
const reloadGif = document.getElementById('reload-gif');
const ammoCounter = document.getElementById('ammo-counter');
const currentWeaponUI = document.getElementById('current-weapon-ui');

// Audio elemek
const shootSound = document.getElementById('shoot-sound');
const reloadSound = document.getElementById('reload-sound');
const chamberSound = document.getElementById('chamber-sound'); // Még mindig szükség lehet rá, ha külön hangfájlt használsz
const emptySound = document.getElementById('empty-sound');
const unlockAudio = document.getElementById('unlock-audio');

// UI elemek
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.querySelector('#settings-guide .control-item img'); 
const fireIcon = document.getElementById('fire-icon');
const wheelIcon = document.getElementById('wheel-icon');
const reloadIcon = document.getElementById('reload-icon');

// Mobil feloldás állapota
let isAudioUnlocked = false;


// --- CORE FUNCTIONS ---

// Központi hang lejátszó
function playSound(audioElement, soundFile) {
    if (soundFile && audioElement) {
        audioElement.src = soundFile;
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error("Hang lejátszási hiba:", e));
    }
}

// Központi vizuális vezérlő
function setVisualState(state) {
    holdImage.style.display = 'none';
    shootGif.style.display = 'none';
    reloadGif.style.display = 'none';

    switch (state) {
        case 'shooting':
            shootGif.style.display = 'block';
            break;
        case 'reloading':
            reloadGif.style.display = 'block';
            break;
        case 'idle':
        default:
            holdImage.style.display = 'block';
            break;
    }
}

// UI frissítő
function updateWeaponDisplay() {
    const weapon = weapons[currentWeaponIndex];
    ammoCounter.innerText = `${weapon.currentAmmo} / ${weapon.maxAmmo}`;
    currentWeaponUI.innerText = weapon.name;
}

// Újratöltés
function handleReload() {
    const weapon = weapons[currentWeaponIndex];
    if (isReloading || isAnimating || weapon.currentAmmo === weapon.maxAmmo) return;
    
    isReloading = true;
    isAnimating = true;

    playSound(reloadSound, weapon.reloadSound);
    setVisualState('reloading');
    reloadGif.src = weapon.reloadGif + '?t=' + new Date().getTime();
            
    setTimeout(() => {
        if (weapon.reloadType === 'single_shell') {
            weapon.currentAmmo++;
        } else {
            weapon.currentAmmo = weapon.maxAmmo;
        }
        updateWeaponDisplay();
        setVisualState('idle');
        isReloading = false;
        isAnimating = false;
    }, weapon.reloadDuration);
}

// Ez a függvény felel egyetlen lövésért.
function fireOnce() {
    const weapon = weapons[currentWeaponIndex];

    if (isAnimating || isReloading || weapon.currentAmmo <= 0) {
        if (!isAnimating && !isReloading && weapon.currentAmmo <= 0) {
             playSound(emptySound, weapon.emptySound);
        }
        return;
    }
    
    isAnimating = true; // Zároljuk a rendszert
    playSound(shootSound, weapon.shootSound);
    weapon.currentAmmo--;
    updateWeaponDisplay();
    setVisualState('shooting');
    shootGif.src = weapon.shootGif + '?t=' + new Date().getTime();

    // A setTimeout az adatbázisból (weaponData.js) veszi a shootDuration-t.
    setTimeout(() => {
        setVisualState('idle');
        isAnimating = false; // Feloldjuk a zárat
    }, weapon.shootDuration);
}

// A kattintást kezelő fő funkció
function handlePrimaryAction() {
    if (isWheelOpen || isAnimating || isReloading) return;
    
    if (weapons[currentWeaponIndex].currentAmmo <= 0) {
        handleReload();
        return;
    }
    
    fireOnce();
}

// Fegyverválasztó vezérlője
function setActiveWeapon(index) {
    if (index < 0 || index >= weapons.length) return;
    
    currentWeaponIndex = index;
    const weapon = weapons[currentWeaponIndex];
    
    isReloading = false;
    isAnimating = false;
    
    holdImage.src = weapon.holdImage;
    shootGif.src = weapon.shootGif;
    reloadGif.src = weapon.reloadGif;
    
    setVisualState('idle');
    updateWeaponDisplay();
}

// Mobil hang feloldása
function unlockAudioContext() {
    if (isAudioUnlocked) return;
    if (!unlockAudio) return;

    unlockAudio.play().then(() => {
        isAudioUnlocked = true;
        console.log('Audio context unlocked successfully.');
    }).catch(error => {
        console.error('Audio context unlock failed:', error);
    });
}


// --- EVENT LISTENERS ---

// Lövés bal klikkre bárhol a képernyőn
container.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        unlockAudioContext();
        handlePrimaryAction();
    }
});

// Lövés érintésre bárhol a képernyőn
container.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    unlockAudioContext();
    handlePrimaryAction(); 
});

// Kézi újratöltés 'R' gombra
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'r') {
        handleReload();
    }
});

// Interaktív segédlet ikonok
if (fireIcon) {
    fireIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        handlePrimaryAction();
    });
}
if (reloadIcon) {
    reloadIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        handleReload();
    });
    
    reloadIcon.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });
}
if (wheelIcon) {
    wheelIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        const rightClickEvent = new MouseEvent('contextmenu', {
            bubbles: true, cancelable: true, clientX: window.innerWidth / 2, clientY: window.innerHeight / 2
        });
        container.dispatchEvent(rightClickEvent);
    });
}

// Hangerő szabályzó
if (volumeSlider) {
    volumeSlider.addEventListener('input', (event) => {
        const newVolume = parseFloat(event.target.value);

        if (volumeIcon) {
             if (newVolume === 0) {
                volumeIcon.src = 'buttons/VOLUME0.png';
            } else if (newVolume <= 0.50) {
                volumeIcon.src = 'buttons/VOLUME1.png';
            } else if (newVolume < 1) {
                volumeIcon.src = 'buttons/VOLUME2.png';
            } else {
                volumeIcon.src = 'buttons/VOLUME3.png';
            }
        }
    
        shootSound.volume = newVolume;
        reloadSound.volume = newVolume;
        chamberSound.volume = newVolume; // Ez is beállítódik, ha esetleg használnád
        emptySound.volume = newVolume;
    });
}

// --- INITIALIZATION ---
setActiveWeapon(0);