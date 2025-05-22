import { writeFile } from 'fs/promises';
import { join } from 'path';

const SAVE_PATH = 'C:\\Users\\vcasaubon.NOOVELIA\\Noovelia\\!SST - General\\Inspection chariot élévateur\\Fiche inspection app';

export const saveLocally = async (formData: any) => {
    try {
        const response = await fetch('http://10.136.136.143:3000/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        alert('Inspection sauvegardée avec succès');
        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
        throw error;
    }
};
