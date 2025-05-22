// Utility to save the inspection data on the local server
// The server exposes an /api/save endpoint that writes the JSON file to disk.

export const saveLocally = async (formData: any) => {
    try {
        console.log('Début de la sauvegarde...');
        // Use a relative URL so the request targets the same host that served
        // the application. This works whether the app is accessed from the
        // local machine or another device on the network.
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        console.log('Réponse reçue du serveur');
        const result = await response.json();

        if (!result.success) {
            console.error('Erreur serveur:', result.message);
            throw new Error(result.message);
        }

        alert('Inspection sauvegardée avec succès');
        return { success: true };
    } catch (error: any) {
        console.error('Erreur détaillée lors de la sauvegarde:', error);

        // Afficher un message d'erreur plus détaillé
        let errorMsg = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
        if (error.message) {
            errorMsg += ` (${error.message})`;
        }

        alert(errorMsg);
        throw error;
    }
};
