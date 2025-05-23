const INSPECTION_SECTIONS = {
    visualInspection: {
        alimentation: {
            title: 'Alimentation',
            items: [
                { name: 'Batterie' },
                { name: 'Bouchon de ventilation' },
                { name: 'Couvercle des connecteurs' },
                { name: 'Câbles' },
                { name: 'Bonbonne de propane' },
                { name: 'Connecteur' },
                { name: 'Valve' },
            ]
        },
        fluides: {
            title: 'Fluides',
            items: [
                { name: 'Huile du moteur' },
                { name: 'Eau/antigel' },
                { name: 'Fluides hydrauliques' }
            ]
        },
        roues: {
            title: 'Roues',
            items: [
                { name: 'État des pneus' },
                { name: 'État des roues (boulons)' }
            ]
        },
        mat: {
            title: 'Mât',
            items: [
                { name: 'Desseret de charge' },
                { name: 'Fourches/pinces' },
                { name: 'État des chaînes' },
                { name: 'Cylindre' },
                { name: 'État des tuyaux hydrauliques' }
            ]
        },
        equipementsSecurite: {
            title: 'Équipements de sécurité',
            items: [
                { name: 'Feux avertisseurs' },
                { name: 'Klaxon' },
                { name: 'Alarmes' },
                { name: 'Avertisseur sonore' },
                { name: 'Siège et ceinture de sécurité' }
            ]
        }
    },
    operationalInspection: {
        freins: {
            title: 'Freins',
            items: [
                { name: 'Freins' },
                { name: 'Frein manuel' }
            ]
        },
        mat: {
            title: 'Mât',
            items: [
                { name: 'Contrôle de l\'élévation' },
                { name: 'Contrôle de l\'inclinaison du mât (tilt)' },
                { name: 'Contrôle de déplacements latéraux' },
                { name: 'Side shift' },
                { name: 'Contrôle de fermeture et d\'ouverture des pinces' }
            ]
        },
        conduite: {
            title: 'Conduite',
            items: [
                { name: 'Conduite avant' },
                { name: 'Accélération' },
                { name: 'Direction' },
                { name: 'Conduite arrière' },
                { name: 'Accélération' },
                { name: 'Direction' },
                { name: 'Avertisseur de recul' }
            ]
        },
        fluides: {
            title: 'Fluides',
            items: [
                { name: 'Fuites de liquides sur le sol' }
            ]
        }
    }
};

module.exports = { INSPECTION_SECTIONS };
