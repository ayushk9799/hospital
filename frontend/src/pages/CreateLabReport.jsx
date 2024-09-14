import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { PlusCircle, X } from 'lucide-react';

const labReportFields = {
  'hematology': {
    'complete-blood-count-cbc': [
      { name: 'wbc', label: 'White Blood Cell Count (WBC)', unit: '10^3/µL', normalRange: '4.5-11.0' },
      { name: 'rbc', label: 'Red Blood Cell Count (RBC)', unit: '10^6/µL', normalRange: '4.5-5.9 (male), 4.1-5.1 (female)' },
      { name: 'hemoglobin', label: 'Hemoglobin (Hgb)', unit: 'g/dL', normalRange: '13.5-17.5 (male), 12.0-15.5 (female)' },
      { name: 'hematocrit', label: 'Hematocrit (Hct)', unit: '%', normalRange: '41-53 (male), 36-46 (female)' },
      { name: 'mcv', label: 'Mean Corpuscular Volume (MCV)', unit: 'fL', normalRange: '80-100' },
      { name: 'mch', label: 'Mean Corpuscular Hemoglobin (MCH)', unit: 'pg', normalRange: '27-31' },
      { name: 'mchc', label: 'Mean Corpuscular Hemoglobin Concentration (MCHC)', unit: 'g/dL', normalRange: '32-36' },
      { name: 'rdw', label: 'Red Cell Distribution Width (RDW)', unit: '%', normalRange: '11.5-14.5' },
      { name: 'platelets', label: 'Platelet Count', unit: '10^3/µL', normalRange: '150-450' },
      { name: 'mpv', label: 'Mean Platelet Volume (MPV)', unit: 'fL', normalRange: '7.5-11.5' },
      { name: 'neutrophils', label: 'Neutrophils', unit: '%', normalRange: '40-60' },
      { name: 'lymphocytes', label: 'Lymphocytes', unit: '%', normalRange: '20-40' },
      { name: 'monocytes', label: 'Monocytes', unit: '%', normalRange: '2-8' },
      { name: 'eosinophils', label: 'Eosinophils', unit: '%', normalRange: '1-4' },
      { name: 'basophils', label: 'Basophils', unit: '%', normalRange: '0.5-1' },
      { name: 'abs_neutrophils', label: 'Absolute Neutrophils', unit: '10^3/µL', normalRange: '2.0-7.0' },
      { name: 'abs_lymphocytes', label: 'Absolute Lymphocytes', unit: '10^3/µL', normalRange: '1.0-3.0' },
      { name: 'abs_monocytes', label: 'Absolute Monocytes', unit: '10^3/µL', normalRange: '0.2-1.0' },
      { name: 'abs_eosinophils', label: 'Absolute Eosinophils', unit: '10^3/µL', normalRange: '0.02-0.5' },
      { name: 'abs_basophils', label: 'Absolute Basophils', unit: '10^3/µL', normalRange: '0.02-0.1' },
    ],
    'erythrocyte-sedimentation-rate': [
      { name: 'esr', label: 'ESR', unit: 'mm/hr', normalRange: '0-22 (male), 0-29 (female)' },
    ],
    'peripheral-blood-smear': [
      { name: 'rbc_morphology', label: 'RBC Morphology', unit: '', normalRange: 'Normal' },
      { name: 'wbc_morphology', label: 'WBC Morphology', unit: '', normalRange: 'Normal' },
      { name: 'platelet_morphology', label: 'Platelet Morphology', unit: '', normalRange: 'Normal' },
    ],
    'reticulocyte-count': [
      { name: 'reticulocyte_count', label: 'Reticulocyte Count', unit: '%', normalRange: '0.5-2.5' },
    ],
    'coagulation-profile': [
      { name: 'pt', label: 'Prothrombin Time (PT)', unit: 'seconds', normalRange: '11-13.5' },
      { name: 'inr', label: 'International Normalized Ratio (INR)', unit: '', normalRange: '0.8-1.1' },
      { name: 'aptt', label: 'Activated Partial Thromboplastin Time (APTT)', unit: 'seconds', normalRange: '30-40' },
    ],
    'hemoglobin-electrophoresis': [
      { name: 'hb_a', label: 'Hemoglobin A', unit: '%', normalRange: '95-98' },
      { name: 'hb_a2', label: 'Hemoglobin A2', unit: '%', normalRange: '1.5-3.5' },
      { name: 'hb_f', label: 'Hemoglobin F', unit: '%', normalRange: '<2' },
    ],
  },
  'biochemistry': {
    'lipid-profile': [
      { name: 'total_cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', normalRange: '<200' },
      { name: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '<100' },
      { name: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '>60' },
      { name: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', normalRange: '<150' },
      { name: 'vldl', label: 'VLDL Cholesterol', unit: 'mg/dL', normalRange: '<30' },
      { name: 'cholesterol_hdl_ratio', label: 'Cholesterol/HDL Ratio', unit: '', normalRange: '<3.5' },
    ],
    'liver-function-tests': [
      { name: 'total_bilirubin', label: 'Total Bilirubin', unit: 'mg/dL', normalRange: '0.3-1.2' },
      { name: 'direct_bilirubin', label: 'Direct Bilirubin', unit: 'mg/dL', normalRange: '0.0-0.3' },
      { name: 'sgpt', label: 'SGPT (ALT)', unit: 'U/L', normalRange: '7-56' },
      { name: 'sgot', label: 'SGOT (AST)', unit: 'U/L', normalRange: '10-40' },
      { name: 'alkaline_phosphatase', label: 'Alkaline Phosphatase', unit: 'U/L', normalRange: '44-147' },
      { name: 'total_proteins', label: 'Total Proteins', unit: 'g/dL', normalRange: '6.0-8.3' },
      { name: 'albumin', label: 'Albumin', unit: 'g/dL', normalRange: '3.5-5.0' },
      { name: 'globulin', label: 'Globulin', unit: 'g/dL', normalRange: '2.3-3.5' },
      { name: 'ag_ratio', label: 'A/G Ratio', unit: '', normalRange: '1.2-2.2' },
    ],
    'kidney-function-tests': [
      { name: 'urea', label: 'Urea', unit: 'mg/dL', normalRange: '15-40' },
      { name: 'creatinine', label: 'Creatinine', unit: 'mg/dL', normalRange: '0.6-1.2' },
      { name: 'uric_acid', label: 'Uric Acid', unit: 'mg/dL', normalRange: '3.4-7.0' },
      { name: 'sodium', label: 'Sodium', unit: 'mEq/L', normalRange: '136-145' },
      { name: 'potassium', label: 'Potassium', unit: 'mEq/L', normalRange: '3.5-5.1' },
      { name: 'chloride', label: 'Chloride', unit: 'mEq/L', normalRange: '98-107' },
    ],
    'electrolytes': [
      { name: 'sodium', label: 'Sodium', unit: 'mEq/L', normalRange: '135-145' },
      { name: 'potassium', label: 'Potassium', unit: 'mEq/L', normalRange: '3.5-5.0' },
      { name: 'chloride', label: 'Chloride', unit: 'mEq/L', normalRange: '98-106' },
      { name: 'bicarbonate', label: 'Bicarbonate', unit: 'mEq/L', normalRange: '22-28' },
    ],
    'calcium-profile': [
      { name: 'total_calcium', label: 'Total Calcium', unit: 'mg/dL', normalRange: '8.5-10.5' },
      { name: 'ionized_calcium', label: 'Ionized Calcium', unit: 'mg/dL', normalRange: '4.5-5.3' },
    ],
    'iron-studies': [
      { name: 'serum_iron', label: 'Serum Iron', unit: 'µg/dL', normalRange: '60-170' },
      { name: 'tibc', label: 'Total Iron Binding Capacity (TIBC)', unit: 'µg/dL', normalRange: '240-450' },
      { name: 'ferritin', label: 'Ferritin', unit: 'ng/mL', normalRange: '20-250' },
    ],
  },
  'endocrinology': {
    'thyroid-function-tests': [
      { name: 't3', label: 'T3', unit: 'ng/dL', normalRange: '80-200' },
      { name: 't4', label: 'T4', unit: 'µg/dL', normalRange: '5.1-14.1' },
      { name: 'tsh', label: 'TSH', unit: 'µIU/mL', normalRange: '0.4-4.0' },
    ],
    'diabetes-tests': [
      { name: 'fasting_glucose', label: 'Fasting Glucose', unit: 'mg/dL', normalRange: '70-100' },
      { name: 'pp_glucose', label: 'Post Prandial Glucose', unit: 'mg/dL', normalRange: '<140' },
      { name: 'hba1c', label: 'HbA1c', unit: '%', normalRange: '<5.7' },
    ],
    'reproductive-hormones': [
      { name: 'fsh', label: 'Follicle Stimulating Hormone (FSH)', unit: 'mIU/mL', normalRange: 'Varies with menstrual cycle' },
      { name: 'lh', label: 'Luteinizing Hormone (LH)', unit: 'mIU/mL', normalRange: 'Varies with menstrual cycle' },
      { name: 'prolactin', label: 'Prolactin', unit: 'ng/mL', normalRange: '2-29' },
      { name: 'testosterone', label: 'Testosterone', unit: 'ng/dL', normalRange: '270-1070 (male), 15-70 (female)' },
    ],
    'cortisol': [
      { name: 'morning_cortisol', label: 'Morning Cortisol', unit: 'µg/dL', normalRange: '6-23' },
    ],
  },
  'serology': {
    'c-reactive-protein-crp': [
      { name: 'crp', label: 'C-Reactive Protein (CRP)', unit: 'mg/L', normalRange: '<3.0' },
    ],
    'rheumatoid-factor-rf': [
      { name: 'ra_factor', label: 'Rheumatoid Factor (RF)', unit: 'IU/mL', normalRange: '<14' },
    ],
    'anti-streptolysin-o-aso': [
      { name: 'aso', label: 'Anti-Streptolysin O (ASO)', unit: 'IU/mL', normalRange: '<200' },
    ],
    'hepatitis-markers': [
      { name: 'hbsag', label: 'Hepatitis B Surface Antigen (HBsAg)', unit: '', normalRange: 'Negative' },
      { name: 'anti_hcv', label: 'Anti-HCV', unit: '', normalRange: 'Negative' },
    ],
    'hiv': [
      { name: 'hiv_1_2', label: 'HIV 1 & 2 Antibodies', unit: '', normalRange: 'Non-reactive' },
    ],
    'vdrl': [
      { name: 'vdrl', label: 'VDRL', unit: '', normalRange: 'Non-reactive' },
    ],
  },
  'microbiology': {
    'urine-culture': [
      { name: 'organism', label: 'Organism', unit: '', normalRange: 'No growth' },
      { name: 'colony_count', label: 'Colony Count', unit: 'CFU/mL', normalRange: '<10,000' },
    ],
    'stool-culture': [
      { name: 'organism', label: 'Organism', unit: '', normalRange: 'No pathogenic organism isolated' },
    ],
    'blood-culture': [
      { name: 'organism', label: 'Organism', unit: '', normalRange: 'No growth' },
      { name: 'antibiotic_sensitivity', label: 'Antibiotic Sensitivity', unit: '', normalRange: 'N/A' },
    ],
    'sputum-culture': [
      { name: 'organism', label: 'Organism', unit: '', normalRange: 'Normal respiratory flora' },
      { name: 'antibiotic_sensitivity', label: 'Antibiotic Sensitivity', unit: '', normalRange: 'N/A' },
    ],
  },
  'immunology': {
    'antinuclear-antibodies-ana': [
      { name: 'ana', label: 'Antinuclear Antibodies (ANA)', unit: '', normalRange: 'Negative' },
    ],
    'anti-dsdna': [
      { name: 'anti_dsdna', label: 'Anti-dsDNA', unit: 'IU/mL', normalRange: '<30' },
    ],
    'complement-levels': [
      { name: 'c3', label: 'Complement C3', unit: 'mg/dL', normalRange: '90-180' },
      { name: 'c4', label: 'Complement C4', unit: 'mg/dL', normalRange: '10-40' },
    ],
  },
  'tumor-markers': {
    'prostate-specific-antigen-psa': [
      { name: 'psa', label: 'Prostate Specific Antigen (PSA)', unit: 'ng/mL', normalRange: '<4' },
    ],
    'carcinoembryonic-antigen-cea': [
      { name: 'cea', label: 'Carcinoembryonic Antigen (CEA)', unit: 'ng/mL', normalRange: '<3 (non-smokers), <5 (smokers)' },
    ],
    'cancer-antigen-125-ca-125': [
      { name: 'ca_125', label: 'Cancer Antigen 125 (CA-125)', unit: 'U/mL', normalRange: '<35' },
    ],
    'alpha-fetoprotein-afp': [
      { name: 'afp', label: 'Alpha-Fetoprotein (AFP)', unit: 'ng/mL', normalRange: '<10' },
    ],
  },
  'urine-analysis': {
    'routine-urine': [
      { name: 'color', label: 'Color', unit: '', normalRange: 'Pale yellow to amber' },
      { name: 'appearance', label: 'Appearance', unit: '', normalRange: 'Clear' },
      { name: 'specific_gravity', label: 'Specific Gravity', unit: '', normalRange: '1.005-1.030' },
      { name: 'ph', label: 'pH', unit: '', normalRange: '4.5-8' },
      { name: 'protein', label: 'Protein', unit: '', normalRange: 'Negative' },
      { name: 'glucose', label: 'Glucose', unit: '', normalRange: 'Negative' },
      { name: 'ketones', label: 'Ketones', unit: '', normalRange: 'Negative' },
      { name: 'blood', label: 'Blood', unit: '', normalRange: 'Negative' },
      { name: 'leukocyte_esterase', label: 'Leukocyte Esterase', unit: '', normalRange: 'Negative' },
      { name: 'nitrite', label: 'Nitrite', unit: '', normalRange: 'Negative' },
    ],
  },
  'stool-analysis': {
    'routine-stool': [
      { name: 'color', label: 'Color', unit: '', normalRange: 'Brown' },
      { name: 'consistency', label: 'Consistency', unit: '', normalRange: 'Formed' },
      { name: 'occult_blood', label: 'Occult Blood', unit: '', normalRange: 'Negative' },
      { name: 'wbc', label: 'White Blood Cells', unit: '/HPF', normalRange: '0-5' },
      { name: 'rbc', label: 'Red Blood Cells', unit: '/HPF', normalRange: '0-5' },
    ],
  },
  'blood-typing': {
    'abo-and-rh-typing': [
      { name: 'blood_group', label: 'Blood Group', unit: '', normalRange: 'A, B, AB, or O' },
      { name: 'rh_factor', label: 'Rh Factor', unit: '', normalRange: 'Positive or Negative' },
    ],
    'australian-antigen-hepatitis-b-surface-antigen': [
      { name: 'hbsag', label: 'Hepatitis B Surface Antigen (HBsAg)', unit: '', normalRange: 'Negative' },
    ],
    'antibody-screening': [
      { name: 'antibody_screen', label: 'Antibody Screen', unit: '', normalRange: 'Negative' },
      { name: 'antibody_identification', label: 'Antibody Identification', unit: '', normalRange: 'None detected' },
    ],
  },
};

const CreateLabReport = () => {
  const { category, type } = useParams();
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({ name: '', label: '', unit: '', value: '', normalRange: '' });

  useEffect(() => {
    if (labReportFields[category] && labReportFields[category][type]) {
      setFields(labReportFields[category][type].map(field => ({ ...field, value: '' })));
    }
  }, [category, type]);

  const handleInputChange = (e, fieldName) => {
    const { value } = e.target;
    setFields(prevFields =>
      prevFields.map(field =>
        field.name === fieldName ? { ...field, value } : field
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Lab Report Data:', fields);
    // TODO: Implement API call to save lab report data
  };

  const handleAddField = () => {
    if (newField.name && newField.label && newField.unit) {
      setFields([...fields, { ...newField, value: '' }]);
      setNewField({ name: '', label: '', unit: '', value: '', normalRange: '' });
    }
  };

  const handleRemoveField = (fieldName) => {
    setFields(fields.filter(field => field.name !== fieldName));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Create {type.replace(/-/g, ' ')} Report</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <Label htmlFor={field.name} className="mb-1">{field.label}</Label>
                <div className="flex items-center">
                  <Input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => handleInputChange(e, field.name)}
                    className="mr-2"
                    step="0.01"
                  />
                  <span className="text-sm text-gray-500 w-16">{field.unit}</span>
                  {!labReportFields[category][type].some(f => f.name === field.name) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(field.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {field.normalRange && (
                  <span className="text-xs text-gray-500 mt-1">Normal Range: {field.normalRange}</span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Add Custom Field</h2>
            <div className="flex flex-wrap space-x-2 space-y-2">
              <Input
                placeholder="Field Name"
                value={newField.name}
                onChange={(e) => setNewField({...newField, name: e.target.value})}
              />
              <Input
                placeholder="Label"
                value={newField.label}
                onChange={(e) => setNewField({...newField, label: e.target.value})}
              />
              <Input
                placeholder="Unit"
                value={newField.unit}
                onChange={(e) => setNewField({...newField, unit: e.target.value})}
              />
              <Input
                placeholder="Normal Range"
                value={newField.normalRange}
                onChange={(e) => setNewField({...newField, normalRange: e.target.value})}
              />
              <Button type="button" onClick={handleAddField}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full">Save Lab Report</Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateLabReport;