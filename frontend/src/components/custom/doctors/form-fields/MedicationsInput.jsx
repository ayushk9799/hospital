import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import SearchSuggestion from "../../registration/CustomSearchSuggestion";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export default function MedicationsInput({
  medications,
  handleMedicationChange,
  addMedication,
  removeMedication,
}) {
  const { medicinelist = [] } = useSelector((state) => state.templates);
  const commonMedications = useMemo(() => {
    return medicinelist.map((item) => ({ name: item }));
  }, [medicinelist]);

  const handleMedicationSuggestionSelect = (index, suggestion) => {
    handleMedicationChange(index, "name", suggestion.name);
  };

  return (
    <div>
      {medications?.map((medication, index) => (
        <div
          key={index}
          className="grid grid-cols-[3fr_1fr_1fr_2fr_auto] gap-2 mb-2 items-center"
        >
          <SearchSuggestion
            suggestions={commonMedications}
            placeholder="Select medicine"
            value={medication.name}
            setValue={(value) => handleMedicationChange(index, "name", value)}
            onSuggestionSelect={(suggestion) =>
              handleMedicationSuggestionSelect(index, suggestion)
            }
          />
          <Input
            placeholder="0-0-0"
            value={medication.frequency}
            onChange={(e) =>
              handleMedicationChange(index, "frequency", e.target.value)
            }
            className="font-medium "
          />
          <Input
            placeholder="Duration"
            value={medication.duration}
            onChange={(e) =>
              handleMedicationChange(index, "duration", e.target.value)
            }
            className="font-medium "
          />
          <Input
            placeholder="Remarks"
            value={medication.remarks}
            onChange={(e) =>
              handleMedicationChange(index, "remarks", e.target.value)
            }
            className="font-medium"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeMedication(index)}
            disabled={medications.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        onClick={addMedication}
        variant="outline"
        className="mt-2 font-semibold"
      >
        <PlusCircle className="h-4 w-4 mr-2" /> Add Medication
      </Button>
    </div>
  );
}
