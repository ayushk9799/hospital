export const Backend_URL="http://localhost:3000"

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  export const convertTo12Hour=(time24)=> {
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minutes} ${ampm}`;
  }

  export const labCategories = [
    {
      name: 'Hematology',
      description: 'Blood cell counts and related tests',
      types: [
        'Complete Blood Count (CBC)',
        'Erythrocyte Sedimentation Rate',
        'Peripheral Blood Smear',
        'Reticulocyte Count',
        'Coagulation Profile',
        'Hemoglobin Electrophoresis'
      ]
    },
    {
      name: 'Biochemistry',
      description: 'Chemical analysis of blood and other body fluids',
      types: [
        'Lipid Profile',
        'Liver Function Tests',
        'Kidney Function Tests',
        'Electrolytes',
        'Calcium Profile',
        'Iron Studies'
      ]
    },
    {
      name: 'Endocrinology',
      description: 'Hormone-related tests',
      types: [
        'Thyroid Function Tests',
        'Diabetes Tests',
        'Reproductive Hormones',
        'Cortisol'
      ]
    },
    {
      name: 'Serology',
      description: 'Tests related to the immune system',
      types: [
        'C-Reactive Protein (CRP)',
        'Rheumatoid Factor (RF)',
        'Anti-Streptolysin O (ASO)',
        'Hepatitis Markers',
        'HIV',
        'VDRL'
      ]
    },
    {
      name: 'Microbiology',
      description: 'Tests for infectious diseases',
      types: [
        'Urine Culture',
        'Stool Culture',
        'Blood Culture',
        'Sputum Culture'
      ]
    },
    {
      name: 'Immunology',
      description: 'Tests related to the immune system',
      types: [
        'Antinuclear Antibodies (ANA)',
        'Anti-dsDNA',
        'Complement Levels'
      ]
    },
    {
      name: 'Tumor Markers',
      description: 'Tests for detecting cancer',
      types: [
        'Prostate Specific Antigen (PSA)',
        'Carcinoembryonic Antigen (CEA)',
        'Cancer Antigen 125 (CA-125)',
        'Alpha-Fetoprotein (AFP)'
      ]
    },
    {
      name: 'Urine Analysis',
      description: 'Analysis of urine samples',
      types: [
        'Routine Urine'
      ]
    },
    {
      name: 'Stool Analysis',
      description: 'Analysis of stool samples',
      types: [
        'Routine Stool'
      ]
    },
    {
      name: 'Blood Typing',
      description: 'Blood group, Rh factor, and related tests',
      types: [
        'ABO and Rh Typing',
        'Australian Antigen (Hepatitis B Surface Antigen)',
        'Antibody Screening'
      ]
    },
    {
      name: 'Radiology',
      description: 'Imaging studies and reports',
      types: [
        'CT Scan',
        'MRI',
        'Ultrasonography',
        'X-Ray',
        'IVP (Intravenous Pyelogram)',
        'CT KUB',
        'PET Scan',
        'Mammography',
        'Bone Densitometry (DEXA)',
        'Angiography'
      ]
    }
  ];