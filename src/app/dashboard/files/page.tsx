import { TableView } from "@/components/table-view";
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

const Files = () => {
  return (
    <div className="flex flex-col w-full max-w-4xl h-full mx-auto">
      <div className="flex flex-row justify-between items-center">
        <div className="text-4xl mb-5 font-(family-name:--font-instrument-serif)">
          Files
        </div>
        <Dialog>
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
              <Label htmlFor="file-name" className="mt-4">
                File Name
              </Label>
              <Input placeholder="File Name" className="w-full mb-4" />
            </div>
            <DialogFooter>
              <Button type="submit">Create File</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <TableView />
    </div>
  );
};

export default Files;
