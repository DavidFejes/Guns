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
// A weaponHandler.js tetején, az element definícióknál

// ... (többi const) ...
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.querySelector('#controls-volume img');


// A weaponHandler.js fájl végén

// --- INTERACTIVE GUIDE LISTENERS ---
const fireIcon = document.getElementById('fire-icon');
const wheelIcon = document.getElementById('wheel-icon');
const reloadIcon = document.getElementById('reload-icon');




// Tüzelés ikonra kattintása
if (fireIcon) {
    fireIcon.addEventListener('click', (event) => {
        // Megakadályozzuk, hogy a kattintás a háttérre is átterjedjen,
        // ami esetleg elindítaná a normál lövést is.
        event.stopPropagation();

        // Lefuttatjuk a lövés animációt (de a full-auto ciklust nem indítjuk el).
        // Ez egy "bemutató" lövés lesz.
        fireOnce(); 
    });
}

// Újratöltés ikonra kattintás
if (reloadIcon) {
    reloadIcon.addEventListener('click', (event) => {
        event.stopPropagation();

        // Meghívjuk a már létező újratöltés függvényt.
        handleReload();
    });
}

// A fegyverválasztó kerék ikonjára egy kicsit másképp kell rákattintanunk.
// Ehhez egy globális hivatkozás kell. A 'weaponWheel.js' fájlban
// az 'openWeaponWheel' függvénynek globálisnak kell lennie.
// De egyszerűbb, ha szimulálunk egy jobb klikket.

if (wheelIcon) {
    wheelIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        
        // Szimulálunk egy jobb klikk eseményt a képernyő közepén,
        // hogy meghívjuk a fegyverválasztó kereket.
        const rightClickEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2
        });
        // Az eseményt a fő konténeren "sütjük el".
        container.dispatchEvent(rightClickEvent);
    });
}

// A többi függvény mellé illeszd be

function unlockAudioContext() {
    // Ha már feloldottuk, nem csinálunk semmit
    if (isAudioUnlocked) return;

    // Megpróbáljuk lejátszani a néma hangot
    unlockAudio.play().then(() => {
        // Ha sikerült, beállítjuk a zárat, és kiírjuk a konzolra a sikert
        isAudioUnlocked = true;
        console.log('Audio context unlocked successfully.');
    }).catch(error => {
        // Ha hiba történik, azt is kiírjuk (ritka eset)
        console.error('Audio context unlock failed:', error);
    });
}

// A // --- EVENT LISTENERS --- szekcióban

container.addEventListener('mousedown', (event) => {
    unlockAudioContext(); // <<< ÚJ HÍVÁS
    if (event.button === 0) {
        startShooting();
    }
});
// ...

container.addEventListener('touchstart', (e) => {
    unlockAudioContext(); // <<< ÚJ HÍVÁS
    e.preventDefault(); 
    startShooting(); 
});

volumeSlider.addEventListener('input', (event) => {
    // Get the new volume value (it's a string, so we convert it to a number)
    const newVolume = parseFloat(event.target.value);

    // --- LOGIC TO CHANGE THE ICON ---
    // Check the value and set the icon's source accordingly.
    // The checks are performed from most specific to least specific.
    if (newVolume === 0) {
        volumeIcon.src = 'buttons/VOLUME0.png';
    } else if (newVolume <= 0.50) {
        volumeIcon.src = 'buttons/VOLUME1.png';
    } else if (newVolume < 1) {
        volumeIcon.src = 'buttons/VOLUME2.png';
    } else {
        volumeIcon.src = 'buttons/VOLUME3.png';
    }
    // --- END OF ICON LOGIC ---


    // --- LOGIC TO SET THE ACTUAL VOLUME ---
    // This part remains the same.
    shootSound.volume = newVolume;
    reloadSound.volume = newVolume;
    chamberSound.volume = newVolume;
    emptySound.volume = newVolume;
});


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
    if (isFiring || isReloading || isWheelVisible || isWheeelOpen) return;
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