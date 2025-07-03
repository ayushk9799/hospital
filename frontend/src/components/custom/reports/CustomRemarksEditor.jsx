import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Table,
  ListOrdered,
  Type,
  Heading1,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

const REMARK_TYPES = [
  { value: "header", label: "Header", icon: Heading1 },
  { value: "paragraph", label: "Paragraph", icon: Type },
  { value: "table", label: "Table", icon: Table },
  { value: "list", label: "Bullet List", icon: ListOrdered },
];

export default function CustomRemarksEditor({ value = [], onChange }) {
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [remarkToDelete, setRemarkToDelete] = useState(null);
  const [newTableData, setNewTableData] = useState({
    header: ["", "", ""],
    rows: [["", "", ""]],
  });

  const handleAddRemark = (type) => {
    const newRemark = {
      id: Date.now(),
      type: type,
      content: type === "paragraph" || type === "header" ? "" : undefined,
      items: type === "list" ? [""] : undefined,
      header: type === "table" ? ["", "", ""] : undefined,
      rows: type === "table" ? [["", "", ""]] : undefined,
    };
    onChange([...value, newRemark]);
    setExpandedRemarks((prev) => ({ ...prev, [newRemark.id]: true }));
  };

  const handleRemoveRemark = (index) => {
    setRemarkToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (remarkToDelete !== null) {
      const newValue = [...value];
      newValue.splice(remarkToDelete, 1);
      onChange(newValue);
      setDeleteDialogOpen(false);
      setRemarkToDelete(null);
    }
  };

  const handleRemarkChange = (index, updatedRemark) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], ...updatedRemark };
    onChange(newValue);
  };

  const handleRemoveColumn = (remarkIndex, colIndex) => {
    const remarkToUpdate = value[remarkIndex];
    if (!remarkToUpdate || !remarkToUpdate.header || !remarkToUpdate.rows)
      return;

    const newHeader = remarkToUpdate.header.filter((_, i) => i !== colIndex);
    const newRows = remarkToUpdate.rows.map((row) =>
      row.filter((_, i) => i !== colIndex)
    );
    handleRemarkChange(remarkIndex, { header: newHeader, rows: newRows });
  };

  const toggleRemarkExpansion = (remarkId) => {
    setExpandedRemarks((prev) => ({
      ...prev,
      [remarkId]: !prev[remarkId],
    }));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange(items);
  };

  const renderRemarkEditor = (remark, index) => {
    switch (remark.type) {
      case "header":
        return (
          <div className="mt-2">
            <Input
              value={remark.content || ""}
              onChange={(e) =>
                handleRemarkChange(index, { content: e.target.value })
              }
              placeholder="Enter header text..."
              className="text-lg font-bold leading-relaxed"
            />
          </div>
        );
      case "paragraph":
        return (
          <div className="mt-2">
            <Textarea
              value={remark.content || ""}
              onChange={(e) =>
                handleRemarkChange(index, { content: e.target.value })
              }
              placeholder="Enter paragraph text..."
              className="min-h-[100px] text-base leading-relaxed"
            />
          </div>
        );

      case "list":
        return (
          <div className="mt-2 space-y-3">
            {remark.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex gap-3 items-center">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium">
                  {itemIndex + 1}
                </div>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...remark.items]; 
                    newItems[itemIndex] = e.target.value;
                    handleRemarkChange(index, { items: newItems });
                  }}
                  placeholder={`List item ${itemIndex + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => {
                    const newItems = remark.items.filter(
                      (_, idx) => idx !== itemIndex
                    );
                    handleRemarkChange(index, { items: newItems });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                handleRemarkChange(index, {
                  items: [...remark.items, ""],
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
        );

      case "table":
        return (
          <div className="mt-4 space-y-4">
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {remark.header.map((headerItem, colIndex) => (
                      <th
                        key={colIndex}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1">
                          <Input
                            value={headerItem}
                            onChange={(e) => {
                              const newHeader = [...remark.header];
                              newHeader[colIndex] = e.target.value;
                              handleRemarkChange(index, { header: newHeader });
                            }}
                            placeholder={`Column ${colIndex + 1}`}
                            className="font-semibold bg-transparent border-none p-0 focus:ring-0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => handleRemoveColumn(index, colIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-2">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {remark.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="group">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-3 py-1 whitespace-nowrap"
                        >
                          <Input
                            value={cell}
                            onChange={(e) => {
                              const newRows = [...remark.rows];
                              newRows[rowIndex][cellIndex] = e.target.value;
                              handleRemarkChange(index, { rows: newRows });
                            }}
                            placeholder="..."
                            className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-1 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-full"
                          onClick={() => {
                            const newRows = remark.rows.filter(
                              (_, idx) => idx !== rowIndex
                            );
                            handleRemarkChange(index, { rows: newRows });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleRemarkChange(index, {
                    header: [...remark.header, ""],
                    rows: remark.rows.map((row) => [...row, ""]),
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Column
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleRemarkChange(index, {
                    rows: [
                      ...remark.rows,
                      new Array(remark.header.length).fill(""),
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {REMARK_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              type="button"
              variant="outline"
              className="bg-white hover:bg-gray-50"
              onClick={() => handleAddRemark(type.value)}
            >
              <Icon className="h-4 w-4 mr-2" />
              Add {type.label}
            </Button>
          );
        })}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="remarks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {value.map((remark, index) => (
                <Draggable
                  key={remark.id || index}
                  draggableId={String(remark.id || index)}
                  index={index}
                >
                  {(provided) => {
                    const remarkIdentifier = remark.id ?? index;
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleRemarkExpansion(remarkIdentifier)}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center gap-3 text-gray-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                            {(() => {
                              const Icon =
                                REMARK_TYPES.find(
                                  (type) => type.value === remark.type
                                )?.icon || Type;
                              return <Icon className="h-5 w-5" />;
                            })()}
                            <span className="font-medium">
                              {
                                REMARK_TYPES.find(
                                  (type) => type.value === remark.type
                                )?.label
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRemark(index);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <motion.div
                              animate={{
                                rotate: expandedRemarks[remarkIdentifier]
                                  ? 180
                                  : 0,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            </motion.div>
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedRemarks[remarkIdentifier] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-4 mt-4 border-t p-1">
                                {renderRemarkEditor(remark, index)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
              {value.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                  No remarks added yet. Click one of the buttons above to add a
                  remark.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Remark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this remark? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemarkToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 