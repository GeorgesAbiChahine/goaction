"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface FileData {
  id: string;
  fileName: string;
  createdAt: string;
  content: any;
}

export function TableView() {
  const [files, setFiles] = useState<FileData[]>([]);
  const router = useRouter();

  useEffect(() => {
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

    loadFiles();
    // Listen for storage events (optional, but good for sync)
    window.addEventListener('storage', loadFiles);
    return () => window.removeEventListener('storage', loadFiles);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if wrapped
    if (!confirm("Are you sure you want to delete this file?")) return;

    const updated = files.filter(f => f.id !== id);
    localStorage.setItem('files', JSON.stringify(updated));
    setFiles(updated);
  };

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] font-mono">ID</TableHead>
            <TableHead>File</TableHead>
            <TableHead className="w-[200px] font-mono">Created At</TableHead>
            <TableHead className="text-right w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                No files found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            files.map((file, index) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{(index + 1).toString().padStart(3, '0')}</TableCell>
                <TableCell>{file.fileName}</TableCell>
                <TableCell>{file.createdAt}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Link href={`/dashboard/file/${file.id}`}>
                    <Button size="icon-sm" className="cursor-pointer" variant="ghost">
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => handleDelete(file.id, e)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">{files.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
