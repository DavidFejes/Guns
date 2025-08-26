const weapons = [
    { 
        name: "Pistol",
        // Visuals
        icon: "/weapons/pistol/pistol.png", 
        holdImage: "/weapons/pistol/pistol.png",
        shootGif: "/weapons/pistol/pistol-shoot.gif",
        reloadGif: "/weapons/pistol/pistol-reload.gif",
        shootSound: "/weapons/pistol/pistol-shoot.wav",
        reloadSound: "/weapons/pistol/pistol-reload.wav",
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
        shootSound: "/weapons/mp5a3/mp5a3-shoot.wav",
        reloadSound: "/weapons/mp5a3/mp5a3-reload.wav",
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
        shootSound: "/weapons/shotgun/shotgun-shoot.wav",
        reloadSound: "/weapons/shotgun/shotgun-reload.wav",
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
        shootSound: "/weapons/assaultrifle/assaultrifle-shoot.wav",
        reloadSound: "/weapons/assaultrifle/assaultrifle-reload.wav",
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
        shootSound: "/weapons/kar98/kar98-shoot.wav",
        reloadSound: "/weapons/kar98/kar98-reload.wav",
        maxAmmo: 5,
        shootDuration: 2700,
        reloadDuration: 4180,
        isAutomatic: false,
        actionType: " "
    },
    { 
        name: "Bazooka", 
        icon: "/weapons/bazooka/bazooka.png", 
        holdImage: "/weapons/bazooka/bazooka.png",
        shootGif: "/weapons/bazooka/bazooka-shoot.gif",
        reloadGif: "/weapons/bazooka/bazooka-reload.gif",
        shootSound: "/weapons/bazooka/bazooka-shoot.wav",
        reloadSound: "/weapons/bazooka/bazooka-reload.wav",
        maxAmmo: 1,
        shootDuration: 800,
        reloadDuration: 1900,
        isAutomatic: false,
        actionType: " "
    },
    { 
        name: "Revolver-Colt 45", 
        icon: "/weapons/revolver-colt45/revolver-colt45.png", 
        holdImage: "/weapons/revolver-colt45/revolver-colt45.png",
        shootGif: "/weapons/revolver-colt45/revolver-colt45-shoot.gif",
        reloadGif: "/weapons/revolver-colt45/revolver-colt45-reload.gif",
        shootSound: "/weapons/revolver-colt45/revolver-colt45-shoot.wav",
        reloadSound: "/weapons/revolver-colt45/revolver-colt45-reload.wav",
        maxAmmo: 6,
        shootDuration: 1000,
        reloadDuration: 5200,
        isAutomatic: false,
        actionType: " "
    },
    { 
        name: "AK-47", 
        icon: "/weapons/ak-47/ak-47.png", 
        holdImage: "/weapons/ak-47/ak-47.png",
        shootGif: "/weapons/ak-47/ak-47-shoot.gif",
        reloadGif: "/weapons/ak-47/ak-47-reload.gif",
        shootSound: "/weapons/ak-47/ak-47-shoot.wav",
        reloadSound: "/weapons/ak-47/ak-47-reload.wav",
        maxAmmo: 30,
        shootDuration: 600,
        reloadDuration: 1350,
        isAutomatic: true,
        actionType: " "
    },
    // Add other weapons here...
];

// We add currentAmmo to each weapon object at the start.
weapons.forEach(w => w.currentAmmo = w.maxAmmo);