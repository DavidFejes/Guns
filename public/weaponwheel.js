// --- STATE & ELEMENTS ---
let isWheelVisible = false;
let wheelCenterX, wheelCenterY;

const weaponWheel = document.getElementById('weapon-wheel');
const closeIcon = document.getElementById('close-icon');

// --- WHEEL LOGIC ---

function createWeaponWheel() {
    // It reads the global 'weapons' array from weaponData.js
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

function openWeaponWheel(event) {
    isWheelVisible = true;
    
    weaponWheel.style.left = `${event.clientX}px`;
    weaponWheel.style.top = `${event.clientY}px`;
    weaponWheel.style.display = 'flex';
    
    const wheelRect = weaponWheel.getBoundingClientRect();
    wheelCenterX = wheelRect.left + wheelRect.width / 2;
    wheelCenterY = wheelRect.top + wheelRect.height / 2;
    
    window.addEventListener('mousemove', handleWheelMouseMove);
}

function closeWeaponWheel() {
    if (!isWheelVisible) return;
    isWheelVisible = false;
    weaponWheel.style.display = 'none';

    window.removeEventListener('mousemove', handleWheelMouseMove);

    const highlightedSlot = document.querySelector('.weapon-slot.highlighted');
    if (highlightedSlot) {
        const selectedIndex = parseInt(highlightedSlot.dataset.weaponIndex);
        
        // --- THIS IS THE COMMUNICATION STEP ---
        // Instead of updating things itself, it tells the weaponHandler what to do.
        setActiveWeapon(selectedIndex);
        
        highlightedSlot.classList.remove('highlighted');
    }
}

function handleWheelMouseMove(event) {
    if (!isWheelVisible) return;
    const dx = event.clientX - wheelCenterX;
    const dy = event.clientY - wheelCenterY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 40) { 
        clearHighlights();
        return;
    }
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    const anglePerSegment = 360 / weapons.length;
    const segmentIndex = Math.floor((angle + anglePerSegment / 2) / anglePerSegment) % weapons.length;

    clearHighlights();
    const slots = document.querySelectorAll('.weapon-slot');
    slots[segmentIndex].classList.add('highlighted');
}

function clearHighlights() {
    document.querySelectorAll('.weapon-slot.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });
}

// --- EVENT LISTENERS ---
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    openWeaponWheel(event);
});
window.addEventListener('mouseup', () => {
    if (isWheelVisible) {
        event.stopPropagation();
        closeWeaponWheel();
    }
});
window.addEventListener('keydown', (event) => {
    // Csak akkor csinálunk bármit, ha a fegyverválasztó kerék éppen látható
    // ÉS ha a lenyomott gomb az 'Escape'
    if (isWheelVisible && event.key === 'Escape') {
        // Ha a feltételek teljesülnek, bezárjuk a kereket.
        closeWeaponWheel();
    }
});

// --- INITIALIZATION ---
createWeaponWheel();