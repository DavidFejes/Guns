// --- STATE & ELEMENTS ---
let currentWeaponIndex = 0;
let isReloading = false;
let isAnimating = false;
let isChambering = false; // ÚJ: Egy külön "zár" a forgózáras fegyverekhez
let isFiring = false;
let fireInterval = null;

const container = document.getElementById('container');
const holdImage = document.getElementById('hold-image');
const shootGif = document.getElementById('shoot-gif');
const reloadGif = document.getElementById('reload-gif');
// A weaponHandler.js tetején

// ... (a többi const) ...
const chamberGif = document.getElementById('chamber-gif');
const chamberDisplay = document.getElementById('chamber-display'); // <<< EZ AZ ÚJ SOR
// ... (a többi const) ...
const ammoCounter = document.getElementById('ammo-counter');
const currentWeaponUI = document.getElementById('current-weapon-ui');


function setVisualState(state) {
    holdImage.style.display = 'none';
    shootGif.style.display = 'none';
    reloadGif.style.display = 'none';
    chamberGif.style.display = 'none'; // ÚJ

    switch (state) {
        case 'shooting':
            shootGif.style.display = 'block';
            break;
        case 'reloading':
            reloadGif.style.display = 'block';
            break;
        case 'chambering': // ÚJ
            chamberGif.style.display = 'flex';
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
    if (isChambering || isReloading || isAnimating || weapon.currentAmmo === weapon.maxAmmo) return;
    
    stopShooting();
    isReloading = true;
    isAnimating = true;

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
function handleChambering() {
    isAnimating = true;
    isChambering = true; // A legerősebb zár aktiválása
    const weapon = weapons[currentWeaponIndex];

    setVisualState('chambering');
    chamberGif.src = weapon.chamberGif + '?t=' + new Date().getTime();

    setTimeout(() => {
        setVisualState('idle');
        isAnimating = false;
        isChambering = false; // A zár feloldása
    }, weapon.chamberDuration);
}

function fireOnce() {
    const weapon = weapons[currentWeaponIndex];
    // ÚJ: Ellenőrizzük az isChambering állapotot is, ez a legfontosabb
    if (isChambering || isAnimating || isReloading || weapon.currentAmmo <= 0) {
        if (weapon.currentAmmo <= 0) {
            stopShooting();
        }
        return;
    }
    
    isAnimating = true;
    weapon.currentAmmo--;
    updateWeaponDisplay();
    setVisualState('shooting');
    shootGif.src = weapon.shootGif + '?t=' + new Date().getTime();

    setTimeout(() => {
        setVisualState('idle'); // Vissza alapállapotba a lövés után...
        isAnimating = false; //...de még mielőtt feloldanánk a zárat...

        // ÚJ LOGIKA: ...ellenőrizzük, hogy ez egy forgózáras fegyver-e!
        if (weapon.actionType === 'bolt_action' && weapon.currentAmmo > 0) {
            handleChambering(); // Ha igen, elindítjuk az új animációt
        }

    }, weapon.shootDuration);
}

function startShooting() {
    // ÚJ: A Chambering állapot itt is blokkol
    if (isFiring || isReloading || isChambering) return;
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
    isChambering = false; 
    
    holdImage.src = weapon.holdImage;
    shootGif.src = weapon.shootGif;
    reloadGif.src = weapon.reloadGif;
    chamberGif.src = weapon.chamberGif;
    
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