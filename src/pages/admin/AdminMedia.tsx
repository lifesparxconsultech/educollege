import React, { useState } from 'react';
import { Upload, Search, Trash2, Eye, Download, Image, FileText } from 'lucide-react';
import AdminLayout from '../../components/admin/admin-layout.tsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ImageUpload } from '../../components/ui/image-upload';
import { ConfirmationDialog } from '../../components/ui/confirmation-dialog';
import { toast } from 'sonner';

interface MediaFile {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedAt: string;
  usedIn: string[];
}

const AdminMedia: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: 1,
      name: 'hero-background.jpg',
      type: 'image',
      size: '2.5 MB',
      url: '/placeholder.svg',
      uploadedAt: '2024-01-15T10:30:00Z',
      usedIn: ['Homepage Hero']
    },
    {
      id: 2,
      name: 'manipal-logo.png',
      type: 'image',
      size: '156 KB',
      url: '/placeholder.svg',
      uploadedAt: '2024-01-14T15:45:00Z',
      usedIn: ['Universities Page', 'Programs Page']
    },
    {
      id: 3,
      name: 'student-testimonial.jpg',
      type: 'image',
      size: '1.8 MB',
      url: '/placeholder.svg',
      uploadedAt: '2024-01-13T09:20:00Z',
      usedIn: ['Testimonials Section']
    },
    {
      id: 4,
      name: 'program-brochure.pdf',
      type: 'document',
      size: '3.2 MB',
      url: '/placeholder.svg',
      uploadedAt: '2024-01-12T14:10:00Z',
      usedIn: ['Program Details']
    }
  ]);

  const tabs = [
    { id: 'all', label: 'All Files', count: mediaFiles.length },
    { id: 'image', label: 'Images', count: mediaFiles.filter(f => f.type === 'image').length },
    { id: 'document', label: 'Documents', count: mediaFiles.filter(f => f.type === 'document').length }
  ];

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 'all' || file.type === selectedTab;
    return matchesSearch && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-blue-600" />;
      case 'document': return <FileText className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleUpload = (file: string) => {
    // Mock upload functionality
    const fileName = `uploaded-file-${Date.now()}.jpg`;
    const newFile: MediaFile = {
      id: Math.max(...mediaFiles.map(f => f.id)) + 1,
      name: fileName,
      type: 'image',
      size: '1.2 MB',
      url: file,
      uploadedAt: new Date().toISOString(),
      usedIn: []
    };
    setMediaFiles([...mediaFiles, newFile]);
    toast.success('File uploaded successfully!');
  };

  const handleDeleteClick = (file: MediaFile) => {
    setSelectedFile(file);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!selectedFile) return;
    
    const updatedFiles = mediaFiles.filter(file => file.id !== selectedFile.id);
    setMediaFiles(updatedFiles);
    setIsDeleteDialogOpen(false);
    setSelectedFile(null);
    toast.success('File deleted successfully!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600 mt-1">Manage images, documents, and other media files</p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <ImageUpload
            value=""
            onChange={handleUpload}
            placeholder="Drop files to upload or click to browse"
            className="h-32"
          />
          <p className="text-xs text-gray-500 mt-2 text-center">Supports: JPG, PNG, GIF, PDF, DOC, DOCX (Max: 10MB)</p>
        </div>

        {/* Tabs and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={selectedTab === tab.id ? "default" : "ghost"}
                  onClick={() => setSelectedTab(tab.id)}
                  className="text-sm"
                >
                  {tab.label} ({tab.count})
                </Button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search files..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-sm border p-4 group">
              <div className="relative mb-3">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white shadow-sm">
                      <Eye className="h-3 w-3 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white shadow-sm">
                      <Download className="h-3 w-3 text-gray-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 bg-white shadow-sm"
                      onClick={() => handleDeleteClick(file)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 truncate mb-1">{file.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{file.size} • {formatDate(file.uploadedAt)}</p>
                
                {file.usedIn.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 mb-1">Used in:</p>
                    <div className="flex flex-wrap gap-1">
                      {file.usedIn.slice(0, 2).map((location, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {location}
                        </span>
                      ))}
                      {file.usedIn.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                          +{file.usedIn.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600">Try adjusting your search or upload some files to get started.</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete File"
          description={`Are you sure you want to delete "${selectedFile?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminMedia;
