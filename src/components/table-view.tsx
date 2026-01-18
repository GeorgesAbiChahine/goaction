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
import { Button } from "./ui/button";

export interface FileData {
  id: string;
  fileName: string;
  createdAt: string;
  content: any;
}

interface TableViewProps {
  files: FileData[];
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export function TableView({ files, onDelete }: TableViewProps) {
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
          {files?.length === 0 || !files ? (
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
                  <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => onDelete(file.id, e)}>
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
            <TableCell className="text-right">{files?.length || 0}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
