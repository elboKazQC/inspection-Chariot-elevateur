export interface InspectionItem {
    name: string;
    /**
     * Status de l'item :
     * - 'ok'     : conforme
     * - 'notOk'  : non conforme
     * - 'na'     : non applicable
     * - ''       : non évalué
     */
    status: 'ok' | 'notOk' | 'na' | '';
    comments: string;
}

export interface InspectionSection {
    title: string;
    items: InspectionItem[];
}

export interface InspectionForm {
    date: string;
    operator: string;
    signature: string;
    truckNumber: string;
    registration: string;
    department: string;
    visualInspection: {
        alimentation: InspectionSection;
        fluides: InspectionSection;
        roues: InspectionSection;
        mat: InspectionSection;
        equipementsSecurite: InspectionSection;
    };
    operationalInspection: {
        freins: InspectionSection;
        mat: InspectionSection;
        conduite: InspectionSection;
        fluides: InspectionSection;
    };
}
