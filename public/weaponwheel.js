// --- STATE & ELEMENTS ---
let isWheelVisible = false;
let wheelCenterX, wheelCenterY;

// EZ A GLOBÁLIS "ZÁR", AMI MEGOLDJA a lövés-a-választáskor hibát.
let isWheelOpen = false;

const weaponWheel = document.getElementById('weapon-wheel');


// --- WHEEL LOGIC (Ez a részed már jó volt) ---

function createWeaponWheel() {
    const angleIncrement = 360 / weapons.length;
    weapons.forEach((weapon, index) => {
        const slot = document.createElement('div');
        slot.className = 'weapon-slot';
        slot.dataset.weaponIndex = index;
        const angle = index * angleIncrement;
        slot.style.setProperty('--angle', `${angle}deg`);
        const icon = document.createElement('img');
        icon.src = weapon.icon;
        icon.alt = weapon.name;
        slot.appendChild(icon);
        weaponWheel.appendChild(slot);
    });
}


// --- JAVÍTOTT FUNKCIÓK (TOUCH & MOUSE KEZELÉS) ---

function openWeaponWheel(event) {
    // Kinyerjük a koordinátákat, akár érintés, akár egér az esemény.
    const touchPoint = event.touches ? event.touches[0] : event;
    const clientX = touchPoint.clientX;
    const clientY = touchPoint.clientY;
    
    isWheelOpen = true; // BEKAPCSOLJUK A GLOBÁLIS ZÁRAT!
    isWheelVisible = true;
    
    weaponWheel.style.left = `${clientX}px`;
    weaponWheel.style.top = `${clientY}px`;
    weaponWheel.style.display = 'flex';
    
    const wheelRect = weaponWheel.getBoundingClientRect();
    wheelCenterX = wheelRect.left + wheelRect.width / 2;
    wheelCenterY = wheelRect.top + wheelRect.height / 2;
    
    // Figyeljük az egeret ÉS az érintést is.
    window.addEventListener('mousemove', handleWheelMouseMove);
    window.addEventListener('touchmove', handleWheelMouseMove, { passive: false }); // 'passive: false' fontos mobilon
}

function closeWeaponWheel() {
    isWheelOpen = false; // KIKAPCSOLJUK A GLOBÁLIS ZÁRAT!
    if (!isWheelVisible) return;

    isWheelVisible = false;
    weaponWheel.style.display = 'none';

    // Eltávolítjuk MINDKÉT figyelőt.
    window.removeEventListener('mousemove', handleWheelMouseMove);
    window.removeEventListener('touchmove', handleWheelMouseMove);

    const highlightedSlot = document.querySelector('.weapon-slot.highlighted');
    if (highlightedSlot) {
        const selectedIndex = parseInt(highlightedSlot.dataset.weaponIndex);
        setActiveWeapon(selectedIndex);
        highlightedSlot.classList.remove('highlighted');
    }
}

function handleWheelMouseMove(event) {
    if (!isWheelVisible) return;

    // Itt is kinyerjük a koordinátákat mindkét eseménytípusból.
    const touchPoint = event.touches ? event.touches[0] : event;
    const clientX = touchPoint.clientX;
    const clientY = touchPoint.clientY;
    
    // Hogy a PWA ne görgessen húzás közben (fontos mobilon)
    if (event.touches) {
        event.preventDefault();
    }

    const dx = clientX - wheelCenterX;
    const dy = clientY - wheelCenterY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // Kisebb holt zóna az érzékenységért
    if (dist < 20) { 
        clearHighlights();
        return;
    }
    
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    const anglePerSegment = 360 / weapons.length;
    const segmentIndex = Math.floor(angle / anglePerSegment);

    clearHighlights();
    const slots = document.querySelectorAll('.weapon-slot');
    if (slots[segmentIndex]) {
        slots[segmentIndex].classList.add('highlighted');
    }
}

function clearHighlights() {
    document.querySelectorAll('.weapon-slot.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });
}


// --- JAVÍTOTT EVENT LISTENERS (Figyeli a touchend-et is!) ---

// Jobb klikk asztali gépen
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    openWeaponWheel(event);
});

// Hosszú érintés mobilon (ez a mobil "jobb klikk")
let touchTimer;
window.addEventListener('touchstart', (event) => {
    // Ha nem egy ujjal érint, ne csináljon semmit
    if (event.touches.length > 1) return;
    
    touchTimer = setTimeout(() => {
        event.preventDefault(); // Megakadályozzuk a böngésző alapértelmezett menüjét
        openWeaponWheel(event);
    }, 500); // 500ms (fél másodperc) után számít hosszú érintésnek
});

// A mouseup esemény mindkét platformon zár
window.addEventListener('mouseup', () => {
    if (isWheelVisible) {
        closeWeaponWheel();
    }
});

// FONTOS: Az ujj felemelése mobilon is zár!
window.addEventListener('touchend', () => {
    // Töröljük a hosszú érintés időzítőjét, hogy egy sima koppintás ne nyissa meg a menüt
    clearTimeout(touchTimer);

    if (isWheelVisible) {
        closeWeaponWheel();
    }
});


// Escape gombos bezárás (ez a részed már jó volt)
window.addEventListener('keydown', (event) => {
    if (isWheelVisible && event.key === 'Escape') {
        closeWeaponWheel();
    }
});


// --- INITIALIZATION ---
createWeaponWheel();