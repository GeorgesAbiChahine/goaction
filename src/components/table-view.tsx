import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpRight } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

const files = [
  {
    ID: "001",
    fileName: "Transcript number 1",
    createdAt: "17 Janvier 2026",
  },
]

export function TableView() {
  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] font-mono">ID</TableHead>
            <TableHead>File</TableHead>
            <TableHead className="w-[100px] font-mono">Created At</TableHead>
            <TableHead className="text-right w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.ID}>
              <TableCell className="font-medium">{file.ID}</TableCell>
              <TableCell>{file.fileName}</TableCell>
              <TableCell>{file.createdAt}</TableCell>
              <TableCell className="text-right"><Link href={`/dashboard/file/${file.ID}`}><Button size="icon-sm" className="cursor-pointer" variant="ghost"><ArrowUpRight className="w-4 h-4" /></Button></Link></TableCell>
            </TableRow>
          ))}
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
