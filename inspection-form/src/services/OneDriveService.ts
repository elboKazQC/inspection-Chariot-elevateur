// Utility to save the inspection data on the local server
// The server exposes an /api/save endpoint that writes the JSON file to disk.

export const saveLocally = async (formData: any) => {
    try {
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
