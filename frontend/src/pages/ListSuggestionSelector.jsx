import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  saveListSuggestions,
  deleteListSuggestion,
} from "../redux/slices/listSuggestionsSlice";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { TrashIcon, PlusIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";

/*
  ListSuggestionSelector (for multiselect fields)
  ------------------------------------------------
  Props:
    value               string/array   Currently selected suggestion(s)
    onChange            function       Called with (newValue) when user selects/uses a suggestion.
    suggestions         array[string]  Existing suggestions for the field.
    onSuggestionsChange function       Called with (newSuggestions) when suggestions updated.
    formTemplate        object         The template object.
    field               object         The field object.
    onDialogClose       function       Called when the dialog is closed.
*/

export default function ListSuggestionSelector({
  value = "",
  onChange = () => {},
  suggestions = [],
  onSuggestionsChange = () => {},
  formTemplate = null,
  field = {},
  onDialogClose = () => {},
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const [localSuggestions, setLocalSuggestions] = useState([...suggestions]);
  const [newSuggestion, setNewSuggestion] = useState("");

  // Add new suggestion
  const handleAddSuggestion = () => {
    // Support comma-separated list, e.g. "cough, fever , cold"
    const parts = newSuggestion
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    // Avoid duplicates while preserving order of new additions
    const updated = [...localSuggestions];
    parts.forEach((p) => {
      if (!updated.includes(p)) {
        updated.push(p);
      }
    });

    setLocalSuggestions(updated);
    setNewSuggestion("");
  };

  // Delete suggestion by index
  const handleDeleteSuggestion = (idx) => {
    const suggestion = localSuggestions[idx];

    // If backend stored suggestion exists we ask server to delete
    if (formTemplate && field && suggestion) {
      dispatch(
        deleteListSuggestion({
          suggestion,
          formTemplate,
          field,
        })
      )
        .then(() => {
          // Close parent dialog after successful deletion
          onDialogClose();
        })
        .catch((error) => {
          console.error("Failed to delete suggestion:", error);
        });
    } else {
      // For local suggestions, close parent dialog immediately
      onDialogClose();
    }
    setLocalSuggestions(localSuggestions.filter((_, i) => i !== idx));
  };

  // Save new suggestions to backend (only the ones not previously saved)
  const handleSaveChanges = async () => {
    const newlyAdded = localSuggestions.filter((s) => !suggestions.includes(s));

    if (newlyAdded.length > 0 && formTemplate && field) {
      await dispatch(
        saveListSuggestions({
          suggestions: newlyAdded,
          formTemplate,
          field,
        })
      ).unwrap();
    }

    // Pass combined suggestions up
    onSuggestionsChange(localSuggestions);
    setDialogOpen(false);
    // Close parent dialog after successful save
    onDialogClose();
  };

  const handleUseSuggestion = (idx) => {
    const suggestion = localSuggestions[idx];
    if (suggestion) {
      onChange(suggestion);
      setDialogOpen(false);
      // Close parent dialog after using suggestion
      onDialogClose();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Manage Suggestions</DialogTitle>
            <DialogDescription>
              Add or remove selectable options for this field.
            </DialogDescription>
          </DialogHeader>

          {/* Existing suggestions */}
          <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
            {localSuggestions.length === 0 && (
              <p className="text-sm text-muted-foreground">No suggestions.</p>
            )}
            {localSuggestions.map((sug, idx) => (
              <div
                className="flex items-center gap-2 bg-blue-400 px-2 py-1 text-white  rounded text-xs font-medium cursor-pointer hover:bg-gray-200 whitespace-nowrap"
                onClick={() => handleUseSuggestion(idx)}
              >
                <span className="mr-1">{sug}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSuggestion(idx);
                  }}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new suggestion */}
          <div className="mt-4 space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">Add New Suggestion</Label>
            <Input
              placeholder="Enter suggestion text"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSuggestion}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> Add Suggestion
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveChanges}>Save</Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
