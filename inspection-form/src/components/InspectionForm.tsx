import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
    Paper,
    Container,
} from '@mui/material';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import { InspectionForm } from '../types/InspectionTypes';
import { INSPECTION_SECTIONS } from '../constants/inspectionData';
import { saveToOneDrive } from '../services/OneDriveService';

const InspectionFormComponent: React.FC = () => {
    const signatureRef = useRef<SignaturePadRef>(null);
    const { control, handleSubmit } = useForm<InspectionForm>({
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
                data.signature = signatureRef.current.getImage();
            }
            await saveToOneDrive(data);
            console.log('Form data:', data);
        } catch (error) {
            console.error('Error saving form:', error);
        }
    };

    const renderInspectionSection = (section: any, sectionName: string) => {
        return (
            <Paper sx={{ p: 2, mb: 2 }} elevation={2}>
                <Typography variant="h6" gutterBottom>
                    {section.title}
                </Typography>
                <Grid container spacing={2}>
                    {section.items.map((item: any, index: number) => (
                        <Grid item xs={12} key={index} component="div">
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="body1">{item.name}</Typography>
                                <Controller
                                    name={`${sectionName}.items.${index}.isOk`}
                                    control={control}
                                    defaultValue={null}
                                    render={({ field }) => (
                                        <RadioGroup row {...field}>
                                            <FormControlLabel value="ok" control={<Radio />} label="OK" />
                                            <FormControlLabel value="notOk" control={<Radio />} label="Non OK" />
                                        </RadioGroup>
                                    )}
                                />
                                <Controller
                                    name={`${sectionName}.items.${index}.comments`}
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Commentaires"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        );
    };
    return (
        <Container maxWidth="lg">
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Fiche d'inspection des chariots élévateurs
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4} component="div">
                        <Controller
                            name="date"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} component="div">
                        <Controller
                            name="operator"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Opérateur" fullWidth />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} component="div">
                        <Controller
                            name="truckNumber"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="# du chariot" fullWidth />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} component="div">
                        <Controller
                            name="registration"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Immatriculation" fullWidth />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} component="div">
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
