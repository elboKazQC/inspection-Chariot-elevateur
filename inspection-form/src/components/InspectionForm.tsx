import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
    Container,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
} from '@mui/material';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import { InspectionForm } from '../types/InspectionTypes';
import { INSPECTION_SECTIONS } from '../constants/inspectionData';
import { saveLocally } from '../services/OneDriveService';

// Styles personnalisés
const InspectionCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    },
}));


const InspectionFormComponent: React.FC = () => {
    const signatureRef = useRef<SignaturePadRef>(null);
    const { control, handleSubmit, reset } = useForm<InspectionForm>({
        defaultValues: {
            date: '',
            operator: '',
            signature: '',
            truckNumber: '',
            registration: '',
            department: '',
        }
    });

    const onSubmit = async (data: InspectionForm) => {
        try {
            if (signatureRef.current) {
                if (signatureRef.current.isEmpty()) {
                    alert('Veuillez ajouter votre signature.');
                    return;
                }
                data.signature = signatureRef.current.getImage();
            }

            if (!data.date) {
                alert('Veuillez saisir la date.');
                return;
            }

            await saveLocally(data);
            alert('Sauvegarde réussie');
            reset();
            signatureRef.current?.clear();
        } catch (error) {
            console.error('Error saving form:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const renderInspectionSection = (section: any, sectionName: string) => {
        return (
            <InspectionCard>
                <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.primary.main }}>
                    {section.title}
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Élément</TableCell>
                                <TableCell align="center">OK</TableCell>
                                <TableCell align="center">Non OK</TableCell>
                                <TableCell align="center">N/A</TableCell>
                                <TableCell>Commentaires</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {section.items.map((item: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">
                                        {item.name}
                                    </TableCell>
                                    <Controller
                                        name={`${sectionName}.items.${index}.status` as any}
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={field.value === 'ok'}
                                                        onChange={() => field.onChange('ok')}
                                                        inputProps={{ 'aria-label': 'ok' }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={field.value === 'notOk'}
                                                        onChange={() => field.onChange('notOk')}
                                                        inputProps={{ 'aria-label': 'not ok' }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={field.value === 'na'}
                                                        onChange={() => field.onChange('na')}
                                                        inputProps={{ 'aria-label': 'na' }}
                                                    />
                                                </TableCell>
                                            </>
                                        )}
                                    />
                                    <TableCell>
                                        <Controller
                                            name={`${sectionName}.items.${index}.comments` as any}
                                            control={control}
                                            defaultValue=""
                                            render={({ field: commentField }) => (
                                                <TextField
                                                    {...commentField}
                                                    placeholder="Commentaires"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: (
                                                            <CommentOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </InspectionCard>
        );
    };
    return (
        <Container maxWidth="md">
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4 }}>
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <img src="/logo192.png" alt="Logo Noovelia" style={{ height: 60 }} />
                        </Grid>
                        <Grid item xs={12} md={10}>
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Fiche d'inspection des chariots élévateurs
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="date"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="operator"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <TextField {...field} label="Opérateur" fullWidth />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="truckNumber"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <TextField {...field} label="# du chariot" fullWidth />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="registration"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <TextField {...field} label="Immatriculation" fullWidth />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="department"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <TextField {...field} label="Département" fullWidth />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    Inspection visuelle
                </Typography>
                {Object.entries(INSPECTION_SECTIONS.visualInspection).map(([key, section]) => (
                    renderInspectionSection(section, `visualInspection.${key}`)
                ))}

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    Inspection opérationnelle
                </Typography>
                {Object.entries(INSPECTION_SECTIONS.operationalInspection).map(([key, section]) => (
                    renderInspectionSection(section, `operationalInspection.${key}`)
                ))}

                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                    Signature de l'opérateur
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <SignaturePad ref={signatureRef} />
                </Box>
                <Button variant="text" onClick={() => signatureRef.current?.clear()}>Effacer la signature</Button>

                <Box sx={{ mt: 4, mb: 4 }}>
                    <Button variant="contained" color="primary" type="submit" size="large">
                        Enregistrer
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default InspectionFormComponent;
