import React, { useState } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { UserPlus, FileText, Bed, Stethoscope, Plus, ClipboardList } from "lucide-react";
import OPDRegDialog from "../components/custom/registration/OPDRegDialog";
import IPDRegDialog from "../components/custom/registration/IPDRegDialog";
import OPDProcedureDialog from "../components/custom/procedures/OPDProcedureDialog";
import { useNavigate } from 'react-router-dom';

const QuickMenu = () => {
  const [isOPDDialogOpen, setIsOPDDialogOpen] = useState(false);
  const [isIPDDialogOpen, setIsIPDDialogOpen] = useState(false);
  const [isOPDProcedureOpen, setIsOPDProcedureOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Book OPD",
      description: "Register a new OPD patient",
      icon: UserPlus,
      action: () => setIsOPDDialogOpen(true),
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200"
    },
    {
      title: "Book IPD",
      description: "Register a new IPD patient",
      icon: Bed,
      action: () => setIsIPDDialogOpen(true),
      color: "bg-green-100 text-green-700 hover:bg-green-200"
    },
    {
      title: "OPD Procedure",
      description: "Register new OPD procedure",
      icon: FileText,
      action: () => setIsOPDProcedureOpen(true),
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200"
    },
    {
      title: "Admitted Patients",
      description: "View and discharge admitted patients",
      icon: Bed,
      action: () => navigate('/patients/admitted'),
      color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
    },
  ];

  return (
    <div className="p-4">
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${action.color}`}
            onClick={action.action}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-white">
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{action.title}</h2>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <OPDRegDialog 
        open={isOPDDialogOpen} 
        onOpenChange={setIsOPDDialogOpen}
      />
      
      <IPDRegDialog
        open={isIPDDialogOpen}
        onOpenChange={setIsIPDDialogOpen}
      />
      
      <OPDProcedureDialog 
        open={isOPDProcedureOpen} 
        onOpenChange={setIsOPDProcedureOpen}
      />
    </div>
  );
};

export default QuickMenu; 