import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    RadioGroup,
    Paper,
    Container,
    FormControl,
    styled,
    Collapse,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import SignaturePad, { SignaturePadRef } from './SignaturePad';
import { InspectionForm } from '../types/InspectionTypes';
import { INSPECTION_SECTIONS } from '../constants/inspectionData';
import { saveToOneDrive } from '../services/OneDriveService';

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

const ItemBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    transition: 'background-color 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
}));

interface RadioButtonProps {
    status: 'ok' | 'notOk' | null;
}

const RadioButton = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'status',
})<RadioButtonProps>(({ theme, status }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: status === 'ok'
        ? theme.palette.success.light
        : status === 'notOk'
            ? theme.palette.error.light
            : 'transparent',
    color: status === 'ok'
        ? theme.palette.success.main
        : status === 'notOk'
            ? theme.palette.error.main
            : theme.palette.text.primary,
    '&:hover': {
        backgroundColor: status === 'ok'
            ? theme.palette.success.light
            : status === 'notOk'
                ? theme.palette.error.light
                : theme.palette.action.hover,
    },
}));

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
            <InspectionCard>
                <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.primary.main }}>
                    {section.title}
                </Typography>
                <Grid container spacing={2}>
                    {section.items.map((item: any, index: number) => (
                        <Box key={index} sx={{ width: '100%' }}>
                            <Controller
                                name={`${sectionName}.items.${index}.isOk` as any}
                                control={control}
                                defaultValue={null}
                                render={({ field }) => (
                                    <ItemBox>
                                        <Typography
                                            variant="body1"
                                            sx={{ minWidth: { xs: '100%', sm: '200px' }, fontWeight: 500 }}
                                        >
                                           {item.name}
                                        </Typography>
                                        <RadioGroup
                                            row
                                            {...field}
                                            sx={{ display: 'flex', gap: 2 }}
                                        >
                                            <RadioButton
                                                status={field.value === 'ok' ? 'ok' : null}
                                                onClick={() => field.onChange('ok')}
                                            >
                                                <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                                                <Typography variant="body2">OK</Typography>
                                            </RadioButton>
                                            <RadioButton
                                                status={field.value === 'notOk' ? 'notOk' : null}
                                                onClick={() => field.onChange('notOk')}
                                            >
                                                <CancelOutlinedIcon sx={{ mr: 1 }} />
                                                <Typography variant="body2">Non OK</Typography>
                                            </RadioButton>
                                        </RadioGroup>

                                        <Controller
                                            name={`${sectionName}.items.${index}.comments` as any}
                                            control={control}
                                            defaultValue=""
                                            render={({ field: commentField }) => (
                                                <Collapse
                                                    in={field.value === 'notOk'}
                                                    timeout="auto"
                                                    unmountOnExit
                                                    sx={{ flexGrow: 1 }}
                                                >
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
                                                </Collapse>
                                            )}
                                        />
                                    </ItemBox>
                                )}
                            />
                        </Box>
                    ))}
                </Grid>
            </InspectionCard>
        );
    };
    return (
        <Container maxWidth="sm">
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Fiche d'inspection des chariots élévateurs
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                        <Controller
                            name="date"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
                            )}
                        />
                    </Box>
                    <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                        <Controller
                            name="operator"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Opérateur" fullWidth />
                            )}
                        />
                    </Box>
                    <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                        <Controller
                            name="truckNumber"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="# du chariot" fullWidth />
                            )}
                        />
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                        <Controller
                            name="registration"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Immatriculation" fullWidth />
                            )}
                        />
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1 }}>
                        <Controller
                            name="department"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField {...field} label="Département" fullWidth />
                            )}
                        />
                    </Box>
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
