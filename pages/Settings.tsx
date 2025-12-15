import React, { useState, useRef } from 'react';
import { ShopSettings, AppState } from '../types';
import { Save, Upload, Download, Database, FolderOpen, AlertCircle } from 'lucide-react';
import { exportData } from '../services/storage';

interface SettingsProps {
  settings: ShopSettings;
  fullState: AppState;
  onUpdateSettings: (s: ShopSettings) => void;
  onImportData: (s: AppState) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, fullState, onUpdateSettings, onImportData }) => {
  const [formData, setFormData] = useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    alert('Settings saved successfully!');
  };

  const handleSelectFolder = async () => {
    if (window.electronAPI) {
      try {
        const path = await window.electronAPI.selectFolder();
        if (path) {
          const updatedSettings = { ...formData, dataFolderPath: path };
          setFormData(updatedSettings);
          onUpdateSettings(updatedSettings);
        }
      } catch (error) {
        console.error("Error selecting folder:", error);
        alert("Failed to select folder");
      }
    } else {
      alert("Folder selection is only available in the Desktop (EXE) version of this app. \n\nIn the web version, your data is saved automatically in your browser.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            // Basic validation
            if (json.customers && json.finances && json.orders) {
                onImportData(json);
                alert('Database restored successfully!');
            } else {
                throw new Error("Invalid structure");
            }
        } catch (err) {
            alert('Error importing file. Please upload a valid backup JSON.');
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Manage shop details and data backup.</p>
      </div>

      {/* Shop Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            Shop Profile
        </div>
        <div className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Shop Name</label>
                    <input 
                        type="text" 
                        name="shopName"
                        required
                        className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.shopName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Owner Name</label>
                    <input 
                        type="text" 
                        name="ownerName"
                        className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.ownerName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Contact Number</label>
                    <input 
                        type="text" 
                        name="contactNumber"
                        className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.contactNumber}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                    <input 
                        type="text" 
                        name="address"
                        className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Save size={18} />
                    Save Changes
                </button>
            </form>
        </div>
      </div>

      {/* Desktop Storage Location Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
            <FolderOpen size={18} />
            Data Storage Location (Desktop App)
        </div>
        <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">
                Choose a folder on your computer to automatically save all your business data. 
                The data will be saved in a readable format <code>(vyapar-data.json)</code>.
            </p>
            
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                     <input 
                        type="text" 
                        readOnly
                        placeholder="No folder selected (Using internal storage)"
                        value={formData.dataFolderPath || ''}
                        className="flex-1 p-2 bg-slate-700 text-white border border-slate-600 rounded-lg outline-none cursor-not-allowed"
                    />
                    <button 
                        onClick={handleSelectFolder}
                        type="button"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Change Folder
                    </button>
                </div>
                {!window.electronAPI && (
                    <div className="flex items-start gap-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-100">
                        <AlertCircle size={14} className="mt-0.5" />
                        <p>This feature is active when running as installed Desktop Software.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
            <Database size={18} />
            Manual Backup & Restore
        </div>
        <div className="p-6">
            <p className="text-sm text-slate-600 mb-4">
                Manually download your data or restore from a file. useful for moving data between devices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => exportData(fullState)}
                    className="flex-1 flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <Download size={20} />
                    Download Backup (JSON)
                </button>
                <div className="flex-1">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".json"
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                    <button 
                        onClick={handleImportClick}
                        className="w-full flex items-center justify-center gap-2 border border-slate-300 bg-white text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <Upload size={20} />
                        Restore Backup
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;