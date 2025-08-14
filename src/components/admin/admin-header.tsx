// components/admin/AdminHeader.tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminHeaderProps {
    title: string;
    subtitle: string;
    isFormOpen: boolean;
    isEditMode: boolean;
    onAddClick?: () => void;
    addButtonText?: string;
    editTitle?: string;
    addTitle?: string;
    addSubtitle?: string;
    editSubtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
                                                            title,
                                                            subtitle,
                                                            isFormOpen,
                                                            isEditMode,
                                                            onAddClick,
                                                            addButtonText = "Add New",
                                                            addTitle = "Add New Item",
                                                            editTitle = "Edit Item",
                                                            addSubtitle = "Fill out the form to add a new item",
                                                            editSubtitle = "Update item details",
                                                        }) => {
    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isFormOpen ? (isEditMode ? editTitle : addTitle) : title}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isFormOpen ? (isEditMode ? editSubtitle : addSubtitle) : subtitle}
                </p>
            </div>

            {!isFormOpen && (
                <Button onClick={onAddClick} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>{addButtonText}</span>
                </Button>
            )}
        </div>
    );
};

export default AdminHeader;
