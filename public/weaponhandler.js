// --- STATE & ELEMENTS ---
let currentWeaponIndex = 0;
let isReloading = false;
let isAnimating = false;
let lastTap = null;           // <<< EZ AZ ÚJ SOR: Az utolsó érintés időbélyegét tárolja.
const doubleTapDelay = 150; // <<< EZ AZ ÚJ SOR: Az időablak milliszekundumban (150ms = 0.15s).

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

function playSound(audioElement, soundFile) {
    if (soundFile && audioElement) {
        audioElement.src = soundFile;
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.error("Hang lejátszási hiba:", e));
    }
}

function setVisualState(state) {
    holdImage.style.display = 'none';
    shootGif.style.display = 'none';
    reloadGif.style.display = 'none';

    switch (state) {
        case 'shooting': shootGif.style.display = 'block'; break;
        case 'reloading': reloadGif.style.display = 'block'; break;
        case 'idle': default: holdImage.style.display = 'block'; break;
    }
}

function updateWeaponDisplay() {
    const weapon = weapons[currentWeaponIndex];
    ammoCounter.innerText = `${weapon.currentAmmo} / ${weapon.maxAmmo}`;
    currentWeaponUI.innerText = weapon.name;
}

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

function fireOnce() {
    const weapon = weapons[currentWeaponIndex];
    if (isAnimating || isReloading || weapon.currentAmmo <= 0) {
        if (!isAnimating && !isReloading && weapon.currentAmmo <= 0) {
             playSound(emptySound, weapon.emptySound);
        }
        return;
    }
    
    isAnimating = true;
    playSound(shootSound, weapon.shootSound);
    weapon.currentAmmo--;
    updateWeaponDisplay();
    setVisualState('shooting');
    shootGif.src = weapon.shootGif + '?t=' + new Date().getTime();

    setTimeout(() => {
        setVisualState('idle');
        isAnimating = false;
    }, weapon.shootDuration);
}

function handlePrimaryAction() {
    if (isWheelOpen || isAnimating || isReloading) return;
    
    if (weapons[currentWeaponIndex].currentAmmo <= 0) {
        handleReload();
        return;
    }
    fireOnce();
}

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

function unlockAudioContext() {
    if (isAudioUnlocked || !unlockAudio) return;
    unlockAudio.play().then(() => {
        isAudioUnlocked = true;
        console.log('Audio context unlocked successfully.');
    }).catch(error => {
        console.error('Audio context unlock failed:', error);
    });
}


// --- EVENT LISTENERS ---

container.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        unlockAudioContext();
        handlePrimaryAction();
    }
});

container.addEventListener('touchstart', (event) => {
    event.preventDefault(); 
    unlockAudioContext();
    
    const currentTime = new Date().getTime(); // Az aktuális időbélyeg
    
    // Ellenőrizzük, hogy volt-e már egy koppintás nemrég
    if (lastTap && (currentTime - lastTap) < doubleTapDelay) {
        // HA IGEN: Ez egy "dupla" vagy gyors második koppintás!
        // Töröljük a `lastTap` értékét, hogy ne ragadjon be a reload,
        // és elindítjuk a töltést.
        lastTap = null;
        handleReload();

    } else {
        // HA NEM: Ez egy sima, első koppintás.
        // Eltároljuk az idejét és elindítjuk a lövést.
        lastTap = currentTime;
        handlePrimaryAction();
    })

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'r') {
        handleReload();
    }
});

if (fireIcon) {
    fireIcon.addEventListener('mousedown', (e) => e.stopPropagation());
    fireIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        handlePrimaryAction();
    });
}

if (reloadIcon) {
    reloadIcon.addEventListener('mousedown', (e) => e.stopPropagation());
    reloadIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        handleReload();
    });
}

if (wheelIcon) {
    wheelIcon.addEventListener('mousedown', (e) => e.stopPropagation());
    wheelIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const rightClickEvent = new MouseEvent('contextmenu', {
            bubbles: true, cancelable: true, clientX: window.innerWidth / 2, clientY: window.innerHeight / 2
        });
        container.dispatchEvent(rightClickEvent);
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (event) => {
        const newVolume = parseFloat(event.target.value);
        if (volumeIcon) {
            if (newVolume === 0) { volumeIcon.src = 'buttons/VOLUME0.png'; }
            else if (newVolume <= 0.50) { volumeIcon.src = 'buttons/VOLUME1.png'; }
            else if (newVolume < 1) { volumeIcon.src = 'buttons/VOLUME2.png'; }
            else { volumeIcon.src = 'buttons/VOLUME3.png'; }
        }
        shootSound.volume = newVolume;
        reloadSound.volume = newVolume;
        // Mivel a chamberSound változót eltávolítottam a tetejéről, itt is ki kell venni.
        emptySound.volume = newVolume;
    });
}

// --- INITIALIZATION ---
setActiveWeapon(0);