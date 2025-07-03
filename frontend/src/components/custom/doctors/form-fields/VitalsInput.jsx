import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

export default function VitalsInput({ vitals, handleVitalChange, readOnly }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div>
        <Label htmlFor="temperature" className="text-xs font-semibold">
          Temperature (°C)
        </Label>
        <Input
          id="temperature"
          name="temperature"
          value={vitals?.temperature}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="heartRate" className="text-xs font-semibold">
          Heart Rate (bpm)
        </Label>
        <Input
          id="heartRate"
          name="heartRate"
          value={vitals?.heartRate}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="bloodPressure" className="text-xs font-semibold">
          Blood Pressure (mmHg)
        </Label>
        <Input
          id="bloodPressure"
          name="bloodPressure"
          value={vitals?.bloodPressure}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="respiratoryRate" className="text-xs font-semibold">
          Respiratory Rate (bpm)
        </Label>
        <Input
          id="respiratoryRate"
          name="respiratoryRate"
          value={vitals.respiratoryRate}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="height" className="text-xs font-semibold">
          Height (cm)
        </Label>
        <Input
          id="height"
          name="height"
          value={vitals.height}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="weight" className="text-xs font-semibold">
          Weight (kg)
        </Label>
        <Input
          id="weight"
          name="weight"
          value={vitals.weight}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
      <div>
        <Label htmlFor="bmi" className="text-xs font-semibold">
          BMI
        </Label>
        <Input
          id="bmi"
          name="bmi"
          value={vitals.bmi}
          readOnly
          className="h-8 text-sm font-medium bg-gray-100"
        />
      </div>
      <div>
        <Label htmlFor="oxygenSaturation" className="text-xs font-semibold">
          O₂ Saturation (%)
        </Label>
        <Input
          id="oxygenSaturation"
          name="oxygenSaturation"
          value={vitals.oxygenSaturation}
          onChange={handleVitalChange}
          className="h-8 text-sm font-medium"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
