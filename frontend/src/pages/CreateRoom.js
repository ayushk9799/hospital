import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import { Label } from "../components/ui/label";
import { createRoom } from "../redux/slices/roomSlice";
import { useToast } from "../hooks/use-toast";
import { ChevronLeft } from "lucide-react";

const ROOM_TYPES = [
  { name: "General" },
  { name: "Semi-Private" },
  { name: "Private" },
  { name: "ICU" },
  { name: "Operation Theater" },
  { name: "Emergency" },
];

const CreateRoom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createRoomStatus = useSelector((state) => state.rooms.createRoomStatus);

  const [room, setRoom] = useState({
    roomNumber: "",
    type: "",
    floor: "",
    capacity: "",
    ratePerDay: "",
    beds: [],
  });

  const handleChange = (name, value) => {
    setRoom((prevRoom) => {
      const updatedRoom = {
        ...prevRoom,
        [name]: ["floor", "capacity", "ratePerDay"].includes(name)
          ? Number(value)
          : value,
      };

      // Update beds array when capacity changes
      if (name === "capacity") {
        const capacity = Number(value);
        updatedRoom.beds = Array.from(
          { length: capacity },
          (_, index) => `${index + 1}`
        );
      }

      return updatedRoom;
    });
  };

  const handleBedChange = (index, value) => {
    const updatedBeds = [...room.beds];
    updatedBeds[index] = value;
    setRoom((prevRoom) => ({
      ...prevRoom,
      beds: updatedBeds,
    }));
  };

  const renderFormField = (id, label, type = "text", required = false) => (
    <div className="flex-1 min-w-[200px]">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <Input
        id={id}
        type={type}
        value={room[id]}
        onChange={(e) => handleChange(id, e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        required={required}
        className="w-full"
      />
    </div>
  );

  const renderBedInputs = () => {
    const capacity = parseInt(room.capacity, 10);
    if (isNaN(capacity) || capacity <= 0) return null;

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Bed Numbers/Names
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {room.beds.map((bed, index) => (
            <Input
              key={index}
              type="text"
              value={bed}
              onChange={(e) => handleBedChange(index, e.target.value)}
              placeholder={`Bed ${index + 1}`}
              className="w-full"
            />
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(createRoom(room))
      .unwrap()
      .then(() => {
        toast({
          title: "Room created successfully",
          description: "The new room has been added to the system.",
          variant: "success",
        });
        // Navigate to the rooms page
        navigate("/rooms");
      })
      .catch((error) => {
        toast({
          title: "Failed to create room",
          description: error.message || "There was an error creating the room. Please try again.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto md:mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Create New Room</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-4">
          {renderFormField("roomNumber", "Room Number/Name", "text", true)}
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room Type
            </label>
            <SearchSuggestion
              suggestions={ROOM_TYPES}
              placeholder="Select room type"
              value={room.type}
              setValue={(value) => handleChange("type", value)}
              onSuggestionSelect={(suggestion) =>
                handleChange("type", suggestion.name)
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {renderFormField("floor", "Floor", "number")}
          {renderFormField("capacity", "Capacity", "number", true)}
          {renderFormField("ratePerDay", "Rate per Day", "number")}
        </div>

        {renderBedInputs()}

        <Button 
          type="submit" 
          className="w-full text-white"
          disabled={createRoomStatus === "loading"}
        >
          {createRoomStatus === "loading" ? "Creating..." : "Create Room"}
        </Button>
      </form>
    </div>
  );
};

export default CreateRoom;
