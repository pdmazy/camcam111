import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, CornerPoints, FilterType, ScanDocument, ScanPage } from './types';
import { 
  getStoredDocuments, 
  saveDocument, 
  deleteDocument as removeStoredDoc, 
  getStoredSettings, 
  saveStoredSettings 
} from './utils/storage';
import { Header } from './components/Header';
import { DocumentList } from './components/DocumentList';
import { CameraView } from './components/CameraView';
import { CropEditor } from './components/CropEditor';
import { FilterEditor } from './components/FilterEditor';
import { DocumentViewer } from './components/DocumentViewer';
import { CloudSyncModal } from './components/CloudSyncModal';
import { AndroidReleaseModal } from './components/AndroidReleaseModal';
import { SecurityModal } from './components/SecurityModal';

type AppView = 'list' | 'camera' | 'crop' | 'filter' | 'viewer';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [documents, setDocuments] = useState<ScanDocument[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('list');
  const [activeDoc, setActiveDoc] = useState<ScanDocument | null>(null);

  // Intermediate state for active scan session
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [activeCorners, setActiveCorners] = useState<CornerPoints | undefined>(undefined);
  const [editingPageIndex, setEditingPageIndex] = useState<number | null>(null);
  const [newDocMetadata, setNewDocMetadata] = useState<{ title: string; category: string }>({
    title: 'مدرک اسکن شده جدید',
    category: 'مدارک شناسایی',
  });

  // Modal states
  const [showCloudSync, setShowCloudSync] = useState<boolean>(false);
  const [showAndroidInfo, setShowAndroidInfo] = useState<boolean>(false);
  const [showSecurity, setShowSecurity] = useState<boolean>(false);

  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  // Sync dark mode class with html element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredSettings(settings);
  }, [settings]);

  // Load documents from IndexedDB
  const refreshDocuments = async () => {
    const docs = await getStoredDocuments();
    setDocuments(docs);
  };

  useEffect(() => {
    refreshDocuments();
  }, []);

  const toggleDarkMode = () => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  // Start a new scan from camera
  const handleStartNewScan = (meta?: { title: string; category: string }) => {
    setNewDocMetadata(meta || {
      title: `اسکن مدارک ${new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())}`,
      category: 'مدارک شناسایی',
    });
    setEditingPageIndex(null);
    setCurrentView('camera');
  };

  // Image captured from Camera, Gallery or Sample document
  const handleImageCaptured = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setActiveCorners(undefined);
    setCurrentView('crop');
  };

  // Sample doc clicked from list
  const handleSampleSelect = (dataUrl: string, title: string, category: string) => {
    setNewDocMetadata({ title, category });
    setEditingPageIndex(null);
    setCapturedImage(dataUrl);
    setActiveCorners(undefined);
    setCurrentView('crop');
  };

  // Gallery file pick triggered from header/banner
  const handleTriggerGalleryUpload = () => {
    fileUploadInputRef.current?.click();
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        handleImageCaptured(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Corner crop confirmed -> move to Filter stage
  const handleCropConfirmed = (corners: CornerPoints, rotatedImageSrc: string) => {
    setCapturedImage(rotatedImageSrc);
    setActiveCorners(corners);
    setCurrentView('filter');
  };

  // Filter confirmed -> save page to document
  const handleFilterSaved = async (
    processedDataUrl: string,
    warpedDataUrl: string,
    filter: FilterType,
    brightness: number,
    contrast: number,
    rotation: number
  ) => {
    const newPage: ScanPage = {
      id: 'page_' + Math.random().toString(36).substring(2, 9),
      originalImage: capturedImage,
      corners: activeCorners!,
      warpedImage: warpedDataUrl,
      processedImage: processedDataUrl,
      filter,
      brightness,
      contrast,
      rotation,
    };

    let targetDoc: ScanDocument;

    if (activeDoc) {
      if (editingPageIndex !== null && editingPageIndex >= 0) {
        // Edit existing page
        const updatedPages = [...activeDoc.pages];
        updatedPages[editingPageIndex] = newPage;
        targetDoc = {
          ...activeDoc,
          pages: updatedPages,
          updatedAt: Date.now(),
        };
      } else {
        // Append new page to existing doc
        targetDoc = {
          ...activeDoc,
          pages: [...activeDoc.pages, newPage],
          updatedAt: Date.now(),
        };
      }
    } else {
      // Create brand new doc
      targetDoc = {
        id: 'doc_' + Date.now(),
        title: newDocMetadata.title,
        category: newDocMetadata.category,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pages: [newPage],
      };
    }

    await saveDocument(targetDoc);
    await refreshDocuments();
    setActiveDoc(targetDoc);
    setEditingPageIndex(null);
    setCurrentView('viewer');
  };

  // Viewer actions
  const handleAddPageToDoc = () => {
    setCurrentView('camera');
  };

  const handleEditPageFromDoc = (pageIndex: number) => {
    if (!activeDoc || !activeDoc.pages[pageIndex]) return;
    const page = activeDoc.pages[pageIndex];
    setCapturedImage(page.originalImage);
    setActiveCorners(page.corners);
    setEditingPageIndex(pageIndex);
    setCurrentView('crop');
  };

  const handleUpdateDocument = async (updated: ScanDocument) => {
    await saveDocument(updated);
    await refreshDocuments();
    setActiveDoc(updated);
  };

  const handleDeleteDocument = async (id: string) => {
    await removeStoredDoc(id);
    await refreshDocuments();
    if (activeDoc?.id === id) {
      setActiveDoc(null);
      setCurrentView('list');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-['Vazirmatn',sans-serif] transition-colors">
      {/* Top Application Header */}
      <Header
        darkMode={settings.darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenSync={() => setShowCloudSync(true)}
        onOpenAndroidInfo={() => setShowAndroidInfo(true)}
        onOpenSecurity={() => setShowSecurity(true)}
        activeDocCount={documents.length}
      />

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 flex flex-col">
        {currentView === 'list' && (
          <DocumentList
            documents={documents}
            onOpenDocument={(doc) => {
              setActiveDoc(doc);
              setCurrentView('viewer');
            }}
            onNewScan={() => handleStartNewScan()}
            onUploadFile={handleTriggerGalleryUpload}
            onSampleSelect={handleSampleSelect}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {currentView === 'camera' && (
          <CameraView
            onCapture={handleImageCaptured}
            onClose={() => {
              if (activeDoc) setCurrentView('viewer');
              else setCurrentView('list');
            }}
          />
        )}

        {currentView === 'crop' && (
          <CropEditor
            imageSrc={capturedImage}
            initialCorners={activeCorners}
            onConfirm={handleCropConfirmed}
            onCancel={() => {
              if (activeDoc) setCurrentView('viewer');
              else setCurrentView('list');
            }}
          />
        )}

        {currentView === 'filter' && activeCorners && (
          <FilterEditor
            imageSrc={capturedImage}
            corners={activeCorners}
            onSave={handleFilterSaved}
            onBackToCrop={() => setCurrentView('crop')}
          />
        )}

        {currentView === 'viewer' && activeDoc && (
          <DocumentViewer
            document={activeDoc}
            onBack={() => {
              setActiveDoc(null);
              setCurrentView('list');
            }}
            onUpdateDocument={handleUpdateDocument}
            onAddPage={handleAddPageToDoc}
            onEditPage={handleEditPageFromDoc}
            onDeleteDocument={() => handleDeleteDocument(activeDoc.id)}
          />
        )}
      </main>

      {/* Hidden File Input for Gallery Selection */}
      <input
        ref={fileUploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryFileChange}
        className="hidden"
      />

      {/* Cloud Sync & Backup Modal */}
      {showCloudSync && (
        <CloudSyncModal
          onClose={() => setShowCloudSync(false)}
          onRefreshDocs={refreshDocuments}
        />
      )}

      {/* Android API 34 & Bazaar / Myket Compliance Modal */}
      {showAndroidInfo && (
        <AndroidReleaseModal onClose={() => setShowAndroidInfo(false)} />
      )}

      {/* Security & Offline Guarantee Modal */}
      {showSecurity && (
        <SecurityModal onClose={() => setShowSecurity(false)} />
      )}
    </div>
  );
}
