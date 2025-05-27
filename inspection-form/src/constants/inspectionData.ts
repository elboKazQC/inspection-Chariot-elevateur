export const INSPECTION_SECTIONS = {
    visualInspection: {        alimentation: {
            title: 'Alimentation',
            items: [
                { name: 'Batterie' },
                { name: 'Bouchon de ventilation' },
                { name: 'Couvercle des connecteurs' },
                { name: 'Câbles' },
                { name: 'Bonbonne de propane' },
                { name: 'Connecteur' },
                { name: 'Valve' },
                { name: 'Attache' }
            ]
        },
        fluides: {
            title: 'Fluides',
            items: [
                { name: 'Eau/antigel' },
                { name: 'Huile du moteur' },
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
                { name: 'Dosseret de charge' },
                { name: 'Fourches/pinces' },
                { name: 'État des chaines' },
                { name: 'État des tuyaux hydrauliques' },
                { name: 'Cylindres' }
            ]
        },
        equipementsSecurite: {
            title: 'Equipements de sécurité',
            items: [
                { name: 'Feux avertisseurs' },
                { name: 'Klaxon' },
                { name: 'Phares' },
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
        },        mat: {
            title: 'Mat',
            items: [
                { name: 'Contrôle de l\'élévation' },
                { name: 'Contrôle de l\'inclinaison du mat (tilt)' },
                { name: 'Contrôle de déplacements latéraux' },
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
