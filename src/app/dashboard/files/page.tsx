"use client";

import { FileData, TableView } from "@/components/table-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

const Files = () => {
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const router = useRouter();

  const loadFiles = () => {
    const stored = localStorage.getItem('files');
    if (stored) {
      try {
        setFiles(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse files", e);
      }
    }
  };

  useEffect(() => {
    loadFiles();
    window.addEventListener('storage', loadFiles);
    return () => window.removeEventListener('storage', loadFiles);
  }, []);

  const handleCreateFile = () => {
    if (!fileName.trim()) return;

    const newFile: FileData = {
      id: uuidv4(),
      fileName: fileName.trim(),
      createdAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      content: [{ type: 'p', children: [{ text: '' }] }],
    };

    const updatedFiles = [newFile, ...files];
    localStorage.setItem('files', JSON.stringify(updatedFiles));
    setFiles(updatedFiles);

    setFileName("");
    setOpen(false);
    router.push(`/dashboard/file/${newFile.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this file?")) return;

    const updated = files.filter(f => f.id !== id);
    localStorage.setItem('files', JSON.stringify(updated));
    setFiles(updated);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl h-full mx-auto">
      <div className="flex flex-row justify-between items-center">
        <div className="text-4xl mb-5 font-(family-name:--font-instrument-serif)">
          Files
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New File</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
              <DialogDescription>
                Create a new transcription file.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label className="mt-4">
                File Name
              </Label>
              <Input
                placeholder="File Name"
                className="w-full mb-4"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile();
                }}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreateFile}>Create File</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <TableView />
    </div>
  );
};

export default Files;
