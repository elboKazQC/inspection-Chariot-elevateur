import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

const msalConfig = {
    auth: {
        clientId: 'YOUR_CLIENT_ID', // À remplacer avec votre Client ID Azure
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin,
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

export const saveToOneDrive = async (formData: any) => {
    try {
        const account = msalInstance.getAllAccounts()[0];
        if (!account) {
            await msalInstance.loginPopup();
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('Could not acquire access token');
        }

        // Créer un fichier JSON avec la date et l'heure
        const fileName = `inspection_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const fileContent = JSON.stringify(formData, null, 2);

        // Sauvegarder le fichier dans OneDrive
        await uploadToOneDrive(fileName, fileContent, accessToken);

        return { success: true };
    } catch (error) {
        console.error('Error saving to OneDrive:', error);
        throw error;
    }
};

const getAccessToken = async () => {
    const accessTokenRequest = {
        scopes: ['Files.ReadWrite'],
        account: msalInstance.getAllAccounts()[0],
    };

    try {
        const response = await msalInstance.acquireTokenSilent(accessTokenRequest);
        return response.accessToken;
    } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
            const response = await msalInstance.acquireTokenPopup(accessTokenRequest);
            return response.accessToken;
        }
        throw error;
    }
};

const uploadToOneDrive = async (fileName: string, content: string, accessToken: string) => {
    const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`,
        {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: content,
        }
    );

    if (!response.ok) {
        throw new Error('Failed to upload file to OneDrive');
    }

    return response.json();
};
