const weapons = [
    { 
        name: "Pistol",
        // Visuals
        icon: "/weapons/pistol/pistol.png", 
        holdImage: "/weapons/pistol/pistol.png",
        shootGif: "/weapons/pistol/pistol-shoot.gif",
        reloadGif: "/weapons/pistol/pistol-reload.gif",
        // Stats
        maxAmmo: 12,
        shootDuration: 820, // Animation length
        reloadDuration: 2510, // 2.5 seconds
        // Behavior
        isAutomatic: false, // <<<-- We can add custom behavior flags!
        actionType: '' // <<< Üres string

    },
    { 
        name: "MP5A3", 
        icon: "/weapons/mp5a3/mp5a3.png", 
        holdImage: "/weapons/mp5a3/mp5a3.png",
        shootGif: "/weapons/mp5a3/mp5a3-shoot.gif",
        reloadGif: "/weapons/mp5a3/mp5a3-reload.gif",
        maxAmmo: 40,
        shootDuration: 600,
        reloadDuration: 1400,
        isAutomatic: true,
        actionType: '' // <<< Üres string

    },
    { 
        name: "Shotgun", 
        icon: "/weapons/shotgun/shotgun.png", 
        holdImage: "/weapons/shotgun/shotgun.png",
        shootGif: "/weapons/shotgun/shotgun-shoot.gif",
        reloadGif: "/weapons/shotgun/shotgun-reload.gif",
        maxAmmo: 8,
        shootDuration: 580,
        reloadDuration: 1150,
        reloadType: "single_shell",
        isAutomatic: false,
        actionType: '' // <<< Üres string

    },
    { 
        name: "Assault Rifle", 
        icon: "/weapons/assaultrifle/assaultrifle.png", 
        holdImage: "/weapons/assaultrifle/assaultrifle.png",
        shootGif: "/weapons/assaultrifle/assaultrifle-shoot.gif",
        reloadGif: "/weapons/assaultrifle/assaultrifle-reload.gif",
        maxAmmo: 30,
        shootDuration: 920,
        reloadDuration: 730,
        isAutomatic: true,
        actionType: '' // <<< Üres string

    },
    { 
        name: "Kar98", 
        icon: "/weapons/kar98/kar98.png", 
        holdImage: "/weapons/kar98/kar98.png",
        shootGif: "/weapons/kar98/kar98-shoot.gif",
        reloadGif: "/weapons/kar98/kar98-reload.gif",
        maxAmmo: 5,
        shootDuration: 2700,
        reloadDuration: 3630,
        isAutomatic: false,
        actionType: " "
    },
    { 
        name: "Bazooka", 
        icon: "/weapons/bazooka/bazooka.png", 
        holdImage: "/weapons/bazooka/bazooka.png",
        shootGif: "/weapons/bazooka/bazooka-shoot.gif",
        reloadGif: "/weapons/bazooka/bazooka-reload.gif",
        maxAmmo: 1,
        shootDuration: 800,
        reloadDuration: 1900,
        isAutomatic: false,
        actionType: " "
    },
    // Add other weapons here...
];

// We add currentAmmo to each weapon object at the start.
weapons.forEach(w => w.currentAmmo = w.maxAmmo);