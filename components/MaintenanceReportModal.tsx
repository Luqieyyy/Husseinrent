'use client';

import { useState } from 'react';
import { createMaintenanceRequest, MaintenanceCategory, MaintenancePriority } from '@/app/actions/maintenance';
import { createClient } from '@/utils/supabase/client';
import { X, AlertCircle, Droplet, Zap, Wifi, Wrench, Home, Bug, MoreHorizontal, Upload, Image as ImageIcon } from 'lucide-react';

interface MaintenanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: number;
  roomId?: number;
  propertyTitle: string;
  roomName?: string;
}

const categoryIcons = {
  plumbing: Droplet,
  electrical: Zap,
  water_supply: Droplet,
  internet: Wifi,
  appliances: Wrench,
  structural: Home,
  pest_control: Bug,
  other: MoreHorizontal,
};

const categoryLabels = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  water_supply: 'Water Supply',
  internet: 'Internet/WiFi',
  appliances: 'Appliances',
  structural: 'Structural Issues',
  pest_control: 'Pest Control',
  other: 'Other',
};

const priorityColors = {
  low: 'bg-gray-600 hover:bg-gray-500',
  medium: 'bg-blue-600 hover:bg-blue-500',
  high: 'bg-orange-600 hover:bg-orange-500',
  urgent: 'bg-red-600 hover:bg-red-500',
};

export default function MaintenanceReportModal({
  isOpen,
  onClose,
  propertyId,
  roomId,
  propertyTitle,
  roomName,
}: MaintenanceReportModalProps) {
  const [category, setCategory] = useState<MaintenanceCategory>('plumbing');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `maintenance/${fileName}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    let uploadedImageUrl = imageUrl;

    // Upload image if file is selected
    if (imageFile) {
      const url = await uploadImageToSupabase(imageFile);
      if (!url) {
        setError('Failed to upload image. Please try again or submit without image.');
        setIsSubmitting(false);
        return;
      }
      uploadedImageUrl = url;
    }

    const result = await createMaintenanceRequest({
      propertyId,
      roomId,
      category,
      priority,
      title: title.trim(),
      description: description.trim(),
      imageUrl: uploadedImageUrl || undefined,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset form
        setTitle('');
        setDescription('');
        setImageUrl('');
        setImageFile(null);
        setImagePreview('');
        setCategory('plumbing');
        setPriority('medium');
        setSuccess(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 text-orange-400" />
              Report Maintenance Issue
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {propertyTitle} {roomName && `• ${roomName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Issue Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(categoryLabels) as MaintenanceCategory[]).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-lg border transition flex flex-col items-center justify-center space-y-1 ${
                      category === cat
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs text-center">{categoryLabels[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Priority Level *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as MaintenancePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-lg text-white font-medium transition capitalize ${
                    priority === p
                      ? priorityColors[p]
                      : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaking pipe in bathroom"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              required
            />
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Image (Optional)
            </label>
            
            {!imagePreview ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 bg-gray-800 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-700 hover:border-indigo-500 transition"
                >
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Upload a photo of the issue to help your landlord understand the problem better
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-300">Report submitted successfully!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
