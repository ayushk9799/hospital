import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const labCategories = [
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
  }
];

const Lab = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Laboratory Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labCategories.map((category) => (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {category.types.map((type) => (
                  <li key={type}>
                    <Link to={`/lab/create/${category.name.toLowerCase().replace(/\s+/g, '-')}/${type.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-')}`}>
                      {type}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Lab;
