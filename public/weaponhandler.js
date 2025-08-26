// --- STATE & ELEMENTS ---
let currentWeaponIndex = 0;
let isReloading = false;
let isAnimating = false;
let isFiring = false;
let fireInterval = null;

const container = document.getElementById('container');
const holdImage = document.getElementById('hold-image');
const shootGif = document.getElementById('shoot-gif');
const reloadGif = document.getElementById('reload-gif');
// A weaponHandler.js tetején
const ammoCounter = document.getElementById('ammo-counter');
const currentWeaponUI = document.getElementById('current-weapon-ui');
// A weaponHandler.js tetején, az element definícióknál

// ... (többi const)
const shootSound = document.getElementById('shoot-sound');
const reloadSound = document.getElementById('reload-sound');
const chamberSound = document.getElementById('chamber-sound');
const emptySound = document.getElementById('empty-sound');


// A fenti element definíciók alá, de még a többi függvény elé

// Ez az új, központi hang lejátszó függvényünk
function playSound(audioElement, soundFile) {
    if (soundFile && audioElement) {
        audioElement.src = soundFile;
        // A currentTime = 0 trükk lehetővé teszi, hogy a hangot gyorsan
        // egymás után is le lehessen játszani (pl. gyorstüzelésnél)
        audioElement.currentTime = 0;
        audioElement.play();
    }
}


function setVisualState(state) {
    holdImage.style.display = 'none';
    shootGif.style.display = 'none';
    reloadGif.style.display = 'none';
    // ÚJ

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


function updateWeaponDisplay() {
    const weapon = weapons[currentWeaponIndex];
    ammoCounter.innerText = `${weapon.currentAmmo} / ${weapon.maxAmmo}`;
    currentWeaponUI.innerText = weapon.name;
}


function handleReload() {
    const weapon = weapons[currentWeaponIndex];
    // ÚJ: Most már az isChambering állapotot is ellenőrizzük
    if (isReloading || isAnimating || weapon.currentAmmo === weapon.maxAmmo) return;
    
    stopShooting();
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
        if (isFiring && weapon.reloadType === 'single_shell' && weapon.currentAmmo < weapon.maxAmmo) {
            handleReload();
        }
    }, weapon.reloadDuration);
}

// ÚJ: Ez az új funkció kezeli a megszakíthatatlan újratöltési animációt

// REPLACE YOUR OLD fireOnce() WITH THIS NEW ONE

function fireOnce() {
    const weapon = weapons[currentWeaponIndex];

    // This is the most important guard clause in the code.
    // It prevents shots from overlapping, firing while reloading, or firing on empty.
    if (isAnimating || isReloading || weapon.currentAmmo <= 0) {
         playSound(emptySound, weapon.emptySound);
        // If the gun is empty, stop the full-auto loop.
        if (weapon.currentAmmo <= 0) {
            stopShooting();
        }
        return; // Do nothing.
    }
    
    // If we passed the check, lock the state and play the animation.
    playSound(shootSound, weapon.shootSound);
    isAnimating = true;
    weapon.currentAmmo--;
    updateWeaponDisplay();
    setVisualState('shooting'); // <--- This implicitly hid the static image
    shootGif.src = weapon.shootGif + '?t=' + new
 Date().getTime();

    // After the animation duration, unlock the state.
    setTimeout(() => {
        setVisualState('idle'); // <--- This brought the static image back
        isAnimating = false; // Release the lock
    }, weapon.shootDuration);
}

function startShooting() {
    // ÚJ: A Chambering állapot itt is blokkol
    if (isFiring || isReloading || isWheelVisible) return;
    isFiring = true;

    const weapon = weapons[currentWeaponIndex];
    if (weapon.currentAmmo <= 0) {
        handleReload();
        return;
    }

    fireOnce();
    if (weapon.isAutomatic) {
        const rateOfFire = 150;
        fireInterval = setInterval(fireOnce, rateOfFire);
    }
}

function stopShooting() {
    isFiring = false;
    clearInterval(fireInterval);
}


function setActiveWeapon(index) {
    if (index < 0 || index >= weapons.length) return;
    
    stopShooting();
    currentWeaponIndex = index;
    
    const weapon = weapons[currentWeaponIndex];
    // ÚJ: Minden állapotot alaphelyzetbe állítunk, beleértve az isChambering-et is
    isReloading = false;
    isAnimating = false;
    isFiring = false;
    
    holdImage.src = weapon.holdImage;
    shootGif.src = weapon.shootGif;
    reloadGif.src = weapon.reloadGif;
    // Force consistent size for all weapon images
    [holdImage, shootGif, reloadGif].forEach(img => {
        img.width = 512;
        img.height = 320;
    });
    
    setVisualState('idle');
    updateWeaponDisplay();
}

// --- EVENT LISTENERS ---
container.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        startShooting();
    }
});
window.addEventListener('mouseup', stopShooting);
container.addEventListener('mouseleave', stopShooting);
container.addEventListener('touchstart', (e) => { e.preventDefault(); startShooting(); });
window.addEventListener('touchend', stopShooting);
window.addEventListener('touchcancel', stopShooting);
window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'r') {
        handleReload();
    }
});

// --- INITIALIZATION ---
setActiveWeapon(0);